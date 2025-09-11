import ectPath from 'ect-bin'

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'

export function ectPlugin () {
  return {
    name: 'vite:ect',
    writeBundle: async (options, bundle) => {
      // since we embedded all assets before,
      // we can ignore those
      const embeddedFiles = Object.values(bundle).map((asset) => asset.fileName)

      const files = await fs.promises.readdir('docs/')
      const assetFiles = files
        .filter(
          (file) =>
            !embeddedFiles.includes(file) &&
            !file.endsWith('.html') &&
            !file.endsWith('.zip')
        )
        .map((file) => `docs/${file}`)

      const args = [
        '-strip',
        '-zip',
        '-10009',
        'docs/index.html',
        ...assetFiles
      ]

      // ect provides a path to the binary file
      const result = execFileSync(ectPath, args)
      console.log(result.toString().trim())
      const stats = await fs.promises.stat('docs/index.zip')
      console.log('Zip size', stats.size)
    }
  }
}

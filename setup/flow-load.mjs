import flowRemoveTypes from 'flow-remove-types'

import { dirname } from 'node:path'

// update it to match project root
const root = dirname(dirname(import.meta.url))

export async function resolve (specifier, context, nextResolve) {
  // Fallback to default resolver
  return nextResolve(specifier)
}

export async function load (url, context, nextLoad) {
  // Take a resolved URL and return the source code to be evaluated.
  const result = await nextLoad(url, context)

  // Transform only project files
  if (url.startsWith(root) && !url.includes('node_modules')) {
    const source = flowRemoveTypes(
      typeof result.source === 'string'
        ? result.source
        : result.source.toString('utf8')
    )
    return Object.assign({}, result, { source: source.toString() })
  }

  return result
}

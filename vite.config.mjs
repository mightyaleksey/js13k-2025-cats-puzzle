import { defineConfig } from 'vite'
import babel from 'vite-plugin-babel'

import { ectPlugin } from './plugins/vite-plugin-ect.mjs'
import { roadrollerPlugin } from './plugins/vite-plugin-roadroller.mjs'

import { resolve } from 'node:path'

/**
 * Environment flags:
 *
 * USE_RR_CONFIG=1 - use existing roadroller config ('readroller-config.json').
 */

const babelConfig = {
  babelrc: false,
  configFile: false,
  plugins: ['babel-plugin-syntax-hermes-parser'],
  presets: ['@babel/preset-flow']
}

/**
 * @param {Object} props
 * @param {string} props.mode - development or production
 * @param {string} props.command - build or serve
 * @param {boolean} props.isSsrBuild
 * @param {boolean} props.isPreview
 */
export default defineConfig((props) => {
  switch (props.command) {
    case 'build':
      return {
        build: {
          assetsDir: '',
          assetsInlineLimit: 800,
          minify: true,
          modulePreload: { polyfill: false },
          outDir: resolve(__dirname, 'dist'),
          target: 'es2020',
          emptyOutDir: true,
          rollupOptions: {
            output: {
              assetFileNames: '[name][extname]',
              inlineDynamicImports: true
            }
          }
        },
        esbuild: true,
        plugins: [
          babel({ babelConfig, filter: /\.m?js$/ }),
          roadrollerPlugin(),
          ectPlugin()
        ]
      }

    default:
      return {
        plugins: [babel({ babelConfig, filter: /\.m?js$/ })],
        server: { port: 1234 }
      }
  }
})

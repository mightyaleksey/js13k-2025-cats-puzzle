import { register } from 'node:module'

// @see https://nodejs.org/en/learn/test-runner/using-test-runner
// @see https://nodejs.org/docs/latest/api/module.html#hooks
register('./flow-load.mjs', import.meta.url)

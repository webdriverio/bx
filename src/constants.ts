import { createRequire } from 'node:module'

export const SUPPORTED_FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.html']
export const IS_CI = Boolean(process.env.HEADLESS || process.env.CI)
export const DEFAULT_BROWSER = 'chrome'

const require = createRequire(import.meta.url)
export const pkg = require('../package.json')

export const CLI_EPILOGUE = `bx (v${pkg.version})`
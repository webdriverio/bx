export const SUPPORTED_FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.html']
export const IS_CI = Boolean(process.env.HEADLESS || process.env.CI)
export const CLI_OPTIONS = {
    browserName: { type: 'string', alias: 'b', default: 'chrome' },
    browserVersion: { type: 'string', alias: 'v' },
    headless: { type: 'boolean', alias: 'h', default: IS_CI },
    rootDir: { type: 'string', alias: 'r', default: process.cwd() },
    sessionName: { type: 'string', alias: 's' }
} as const

export const PARSE_OPTIONS = {
    options: CLI_OPTIONS,
    tokens: true,
    allowPositionals: true
} as const
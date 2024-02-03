import { parseArgs } from 'node:util'

import { run } from './runner.js'

const IS_CI = Boolean(process.env.HEADLESS || process.env.CI)
const CLI_OPTIONS = {
    browserName: { type: 'string', alias: 'b', default: 'chrome' },
    browserVersion: { type: 'string', alias: 'v' },
    headless: { type: 'boolean', alias: 'h', default: IS_CI },
} as const
const PARSE_OPTIONS = {
    options: CLI_OPTIONS,
    tokens: true,
    allowPositionals: true
} as const

export default async function cli () {
    const { values, tokens, positionals } = parseArgs(PARSE_OPTIONS)

    ;(tokens || []).filter((token) => token.kind === 'option').forEach((token: any) => {
        if (token.name.startsWith('no-')) {
            // Store foo:false for --no-foo
            const positiveName = token.name.slice(3) as 'headless'
            values[positiveName] = false
            delete values[token.name as 'headless']
        } else {
            // Re-save value so last one wins if both --foo and --no-foo.
            values[token.name as keyof typeof CLI_OPTIONS] = token.value ?? true
        }
    })

    const filename = positionals[0]
    try {
        await run({
            filename,
            browserName: values.browserName!,
            browserVersion: values.browserVersion,
            headless: values.headless!
        })
    } catch (err) {
        console.error('Error:', (err as Error).message)
        process.exit(1)
    }
}    
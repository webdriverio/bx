import { parseArgs } from 'node:util'

import { ViteServer } from './server.js'
import { run } from './runner.js'
import { parseFileName } from './utils.js'
import { CLI_OPTIONS, PARSE_OPTIONS } from './constants.js'
import type { RunnerArgs } from './types.js'

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

    const args = values as RunnerArgs
    const filename = parseFileName(positionals[0])
    const server = new ViteServer({ root: args.rootDir })
    
    try {
        const env = await server.start(filename)
        await run(env, args)
    } catch (err) {
        console.error('Error:', (err as Error).message)
        process.exit(1)
    } finally {
        await server.stop()
    }
}

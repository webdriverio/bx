import { parseArgs } from 'node:util'

import { parseFileName } from './utils.js'
import { CLI_OPTIONS, PARSE_OPTIONS } from './constants.js'
import { runCommand, startSession, stopSession } from './commands/index.js'
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

    if (positionals.includes('session')) {
        if (positionals.includes('stop')) {
            return stopSession(values as RunnerArgs)
        }

        return startSession(values as RunnerArgs)
    }

    return runCommand(parseFileName(positionals[0]), values as RunnerArgs)
}

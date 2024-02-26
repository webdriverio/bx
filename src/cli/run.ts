import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import type { Argv } from 'yargs'

import { ViteServer } from '../server.js'
import { run } from '../runner.js'
import { CLI_EPILOGUE } from '../constants.js'

export const command = '<target> [options]'
export const desc = 'Run script, html file or URL.'
export const cmdArgs = {
    browserName: {
        type: 'string',
        alias: 'b',
        description: 'Name of the browser to use. Defaults to "chrome".'
    },
    browserVersion: {
        type: 'string',
        alias: 'v',
        description: 'Version of the browser to use.'
    },
    headless: {
        type: 'boolean',
        alias: 'h',
        description: 'Run the browser in headless mode. Defaults to true in CI environments.'
    },
    rootDir: {
        type: 'string',
        alias: 'r',
        description: 'Root directory of the project. Defaults to the current working directory.'
    }
} as const

const yargsInstance = yargs(hideBin(process.argv)).options(cmdArgs)

export const builder = (yargs: Argv) => {
    return yargs
        .example('$0 ./script.js --browserName chrome', 'Run a JavaScript script with Chrome')
        .example('$0 ./script.ts --browserName chrome', 'Run a TypeScript file with Chrome')
        .example('$0 ./site.html --browserName chrome', 'Run a HTML file with Chrome')
        .example('$0 http://localhost:8080 --browserName chrome', 'Run a website with Chrome')
        .epilogue(CLI_EPILOGUE)
        .help()
}

export const handler = async () => {
    const params = await yargsInstance.parse()
    const rootDir = params.rootDir || process.cwd()
    const server = new ViteServer({ root: rootDir })
    const target = params._[0] as string | undefined

    if (!target) {
        console.error('Error: No target provided')
        process.exit(1)
    }

    if (target.startsWith('http')) {
        console.error('Error: Running URLs is not supported yet')
        process.exit(1)
    }
    
    try {
        const env = await server.start(target)
        await run(env, params)
    } catch (err) {
        console.error('Error:', (err as Error).message)
        process.exit(1)
    } finally {
        await server.stop()
    }
}
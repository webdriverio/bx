import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import type { Argv } from 'yargs'

import { ViteServer } from '../server.js'
import { initBrowserSession } from '../utils.js'
import { loadSession } from '../session.js'
import { CLI_EPILOGUE } from '../constants.js'
import { cmdArgs as runCmdArgs } from './run.js'
import type { RunnerArgs } from '../types.js'

export const command = '<target> [options]'
export const desc = 'Render HTML and return the DOM as a string.'
export const cmdArgs = runCmdArgs

const yargsInstance = yargs(hideBin(process.argv)).options(cmdArgs)

export const builder = (yargs: Argv) => {
    return yargs
        .example('$0 ./site.html --browserName chrome', 'Render a HTML file with Chrome')
        .example('$0 http://localhost:8080 --browserName chrome', 'Render a website with Chrome')
        .epilogue(CLI_EPILOGUE)
        .help()
}

export const handler = async () => {
    const params = await yargsInstance.parse()
    const target = params._[0] as string | undefined
    await render(target, params)
    process.exit(0)
}

export async function render (target?: string, params?: RunnerArgs) {
    if (!target) {
        console.error('Error: No target provided')
        process.exit(1)
    }

    if (typeof target === 'string' && target.startsWith('http')) {
        console.error('Error: Running URLs is not supported yet')
        process.exit(1)
    }
    
    let server: ViteServer | undefined
    let result: any
    try {
        const rootDir = params?.rootDir || process.cwd()
        const server = new ViteServer({ root: rootDir })
        const env = await server.start(target)
        const browser = params?.sessionName
            ? await loadSession(params.sessionName)
            : await initBrowserSession(params!)

        await browser.url(env.url)
        console.log('get html');
        
        result = await browser.$('body').getHTML()
        await browser.debug()
        console.log('got', result);
        
        await browser.deleteSession()
    } catch (err) {
        console.error('Error:', (err as Error).message)
    } finally {
        await server?.stop()
    }

    return result
}
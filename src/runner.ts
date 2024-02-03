import { remote } from 'webdriverio'

import { getHeadlessArgs } from './utils.js'
import type { ExecutionEnvironment, RunnerArgs } from './types.js'

export async function run (env: ExecutionEnvironment, args: RunnerArgs) {
    const browser = await remote({
        logLevel: 'error',
        capabilities: Object.assign({
            browserName: args.browserName,
            browserVersion: args.browserVersion
        }, getHeadlessArgs(args))
    })

    let error: Error | undefined
    browser.url(env.url)
    await new Promise<void>((resolve) => {
        env.server.ws.on('bx:event', (message) => {
            if (message.name === 'errorEvent') {
                error = new Error(message.message)
                error.stack = message.error.replace(`http://localhost:${env.server.config.server.port}/@fs`, 'file://')
                return resolve()
            }
            if (message.name === 'doneEvent') {
                return resolve()
            }
        })
    })
    await browser.deleteSession()

    if (error) {
        console.error(error);
        process.exit(1)
    }
}
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

    await browser.url(env.url)
    await env.connectPromise
    return browser.deleteSession()
}
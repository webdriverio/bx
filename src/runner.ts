import { remote } from 'webdriverio'

import { getHeadlessArgs } from './utils.js'

interface RunnerArgs {
    filename: string
    browserName: string
    browserVersion?: string
    headless: boolean
}

export async function run (args: RunnerArgs) {
    const browser = await remote({
        capabilities: Object.assign({
            browserName: args.browserName,
            browserVersion: args.browserVersion
        }, getHeadlessArgs(args.browserName))
    })

    console.log('Running', args.filename, 'in', args.browserName, 'headless:', args.headless);

    return browser.deleteSession()
}
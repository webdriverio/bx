import { initBrowserSession } from '../utils.js'
import { SessionManager } from '../session.js'
import type { RunnerArgs } from '../types.js'

export async function startSession (args: RunnerArgs) {
    const sessionName = args.sessionName
    if (!sessionName) {
        throw new Error('Please provide a session name')
    }

    const browser = await initBrowserSession(args)
    await SessionManager.saveSession(browser, sessionName)
    console.log(`Session "${sessionName}" started, you can now run scripts faster e.g. \`npx exweb ./script.js --sessionName ${sessionName}\``)
    process.exit(0)
}

export async function stopSession (args: RunnerArgs) {
    const sessionName = args.sessionName
    if (!sessionName) {
        throw new Error('Please provide a session name')
    }

    const browser = await SessionManager.loadSession(sessionName)
    await browser.deleteSession()
    
    console.log(`Session "${sessionName}" stopped`)
    process.exit(0)
}
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import type { Argv } from 'yargs'

import { cmdArgs as runCmdArgs } from './run.js'
import { CLI_EPILOGUE } from '../constants.js'
import { initBrowserSession } from '../utils.js'
import { deleteSession, deleteAllSessions, listSessions, saveSession } from '../session.js'
import { RunnerArgs } from 'types.js'

export const command = 'session [options]'
export const desc = 'Manage `bx` sessions.'
export const cmdArgs = {
    name: {
        type: 'string',
        alias: 's',
        description: 'Name of the session.'
    },
    kill: {
        type: 'string',
        description: 'Kill a session by name.'
    },
    killAll: {
        type: 'boolean',
        description: 'Kill all sessions.'
    },
    ...runCmdArgs
} as const

const yargsInstance = yargs(hideBin(process.argv)).options(cmdArgs)

export const builder = (yargs: Argv) => {
    return yargs
        .example('$0 session --browserName chrome', 'Create a new session with Chrome')
        .example('$0 session --name myChromeSession --browserName chrome', 'Create a named session with Chrome')
        .example('$0 session --killAll', 'Kill all local sessions')
        .example('$0 session --kill myChromeSession ', 'Kill a local session by name')
        .epilogue(CLI_EPILOGUE)
        .help()
}

export const handler = async () => {
    const params = await yargsInstance.parse()
    
    if (typeof params.kill === 'string') {
        await deleteSession(params.kill)
        return console.log(`Session "${params.kill}" stopped`)
    }

    if (params.killAll) {
        await deleteAllSessions()
        return console.log('All sessions stopped')
    }

    const browserName = params.browserName

    /**
     * if browserName is not provided, list all sessions
     */
    if (!browserName) {
        const sessions = await listSessions()
        if (sessions.length === 0) {
            return console.log('No sessions found!')
        }

        console.log('Available sessions:')
        for (const session of sessions) {
            console.log(`- ${session.name} (${session.capabilities.browserName} ${session.capabilities.browserVersion})`)
        }
        return
    }

    let sessionName = params.name
    /**
     * if no session name is provided, generate a random one
     */
    if (!sessionName) {
        const sessions = await listSessions()
        const browserNameSessions = sessions.filter((session) => session.requestedCapabilities.browserName === browserName)
        sessionName = `${browserName}-${browserNameSessions.length}`
    }

    await createSession(sessionName, { ...params, browserName })
    console.log(`Session "${sessionName}" started, you can now run scripts faster e.g. \`npx bx ./script.js --sessionName ${sessionName}\``)
    process.exit(0)
}

export async function createSession (sessionName: string, params: RunnerArgs) {
    const headless = Boolean(params.headless)
    const rootDir = params.rootDir || process.cwd()
    const browser = await initBrowserSession({ ...params, rootDir, headless })
    await saveSession(browser, sessionName)
}
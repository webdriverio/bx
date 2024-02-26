import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs/promises'

import { attach } from 'webdriverio'
import type { Options } from '@wdio/types'

const SESSION_DIR = process.env.TMPDIR || os.tmpdir()
const SESSION_FILE_PREFIX = 'bx_session_'

function getSessionFilePath(sessionName: string) {
    return path.join(SESSION_DIR, `${SESSION_FILE_PREFIX}${sessionName}.json`)
}

interface SessionFile {
    name: string
    capabilities: WebdriverIO.Capabilities
    requestedCapabilities: WebdriverIO.Capabilities
    sessionId: string
    options: Options.WebdriverIO
}

/**
 * @description To allow run scripts faster, user can keep a browser session around.
 *              This class is responsible for managing the session.
 */
export class SessionManager {
    static async loadSession(sessionName: string) {
        const sessionFilePath = getSessionFilePath(sessionName)
        const sessionExists = await fs.access(sessionFilePath).then(() => true, () => false)
        if (!sessionExists) {
            throw new Error(`Session "${sessionName}" not found`)
        }

        const session: SessionFile = JSON.parse(await fs.readFile(sessionFilePath, 'utf8'))
        return attach({ ...session.options, ...session })
    }

    static async saveSession(browser: WebdriverIO.Browser, sessionName: string) {
        const { capabilities, requestedCapabilities, sessionId, options } = browser
        await fs.writeFile(
            getSessionFilePath(sessionName),
            JSON.stringify({ name: sessionName, capabilities, requestedCapabilities, sessionId, options } as SessionFile)
        )
    }

    static async listSessions(): Promise<SessionFile[]> {
        const files = await fs.readdir(SESSION_DIR)
        const sessionFiles: SessionFile[] = []

        for (const file of files) {
            if (file.startsWith(SESSION_FILE_PREFIX)) {
                const session = JSON.parse(await fs.readFile(path.join(SESSION_DIR, file), 'utf8'))
                sessionFiles.push(session)
            }
        }

        return sessionFiles
    }

    static async deleteSession(sessionName?: string) {
        if (!sessionName) {
            throw new Error('Please provide a session name')
        }

        const sessionFilePath = getSessionFilePath(sessionName)
        const sessionExists = await fs.access(sessionFilePath).then(() => true, () => false)
        if (!sessionExists) {
            throw new Error(`Session "${sessionName}" not found`)
        }

        await fs.unlink(sessionFilePath)
    }

    static async deleteAllSessions() {
        const files = await fs.readdir(SESSION_DIR)
        return Promise.all(files.map(async (file) => {
            if (!file.startsWith(SESSION_FILE_PREFIX)) {
                return
            }
            const sessionName = path.basename(file, path.extname(file)).replace(SESSION_FILE_PREFIX, '')
            const session = await SessionManager.loadSession(sessionName)
            await fs.unlink(path.join(SESSION_DIR, file))
            await session.deleteSession()
        }))
    }
}
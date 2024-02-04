import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs/promises'

import { attach } from 'webdriverio'
import type { Options } from '@wdio/types'

const SESSION_DIR = process.env.TMPDIR || os.tmpdir()

function getSessionFilePath(sessionName: string) {
    return path.join(SESSION_DIR, `${sessionName}.json`)
}

interface SessionFile {
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
        return attach(session)
    }

    static async saveSession(browser: WebdriverIO.Browser, sessionName: string) {
        const { capabilities, requestedCapabilities, sessionId, options } = browser
        await fs.writeFile(
            getSessionFilePath(sessionName),
            JSON.stringify({ capabilities, requestedCapabilities, sessionId, options } as SessionFile)
        )
    }
}
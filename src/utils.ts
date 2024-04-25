import path from 'node:path'
import { remote } from 'webdriverio'

import { SUPPORTED_FILE_EXTENSIONS, DEFAULT_BROWSER } from './constants.js'
import type { RunnerArgs } from './types.js'

export function getHeadlessArgs ({ browserName, headless }: Pick<RunnerArgs, 'browserName' | 'headless'>) {
    if (!headless) {
        return {}
    }

    if (browserName === 'chrome') {
        return {
            'goog:chromeOptions': {
                args: ['headless', 'disable-gpu']
            }
        }
    } else if (browserName === 'firefox') {
        return {
            'moz:firefoxOptions': {
                args: ['-headless']
            }
        }
    } else if (browserName && browserName.includes('edge')) {
        return {
            'ms:edgeOptions': {
                args: ['--headless']
            }
        }
    }

    console.log(`Given browser "${browserName}" doesn't support headless mode.`)
    return {}
}

export function parseFileName (filename: string) {
    if (!filename) {
        throw new Error('Please provide a filename')
    }
    if (!SUPPORTED_FILE_EXTENSIONS.some((ext) => filename.endsWith(ext))) {
        throw new Error(`Unsupported file extension: ${filename}, supported extensions are: ${SUPPORTED_FILE_EXTENSIONS.join(', ')}`)
    }
    return path.resolve(process.cwd(), filename)
}

export async function initBrowserSession (params: RunnerArgs) {
    const args = parseRunArgs(params)
    const capabilities: WebdriverIO.Capabilities = Object.assign({
        browserName: args.browserName,
        browserVersion: args.browserVersion,
        webSocketUrl: true
    }, getHeadlessArgs(args))

    /**
     * Safari currently doesn't support Bidi
     */
    if (args.browserName !== 'safari') {
        capabilities.webSocketUrl = true
    }

    return remote({
        logLevel: 'error',
        capabilities
    })
}

export function parseRunArgs (args: RunnerArgs) {
    const browserName = args.browserName ?? DEFAULT_BROWSER
    const browserVersion = args.browserVersion
    const headless = args.headless ?? true
    const rootDir = args.rootDir ?? process.cwd()
    return { browserName, browserVersion, headless, rootDir }
}
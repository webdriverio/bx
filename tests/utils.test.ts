import path from 'node:path'
import { test, expect, vi } from 'vitest'
import { remote } from 'webdriverio'

import { getHeadlessArgs, parseFileName, initBrowserSession } from '../src/utils.js'

vi.mock('webdriverio', () => ({
    remote: vi.fn()
}))

test('getHeadlessArgs', () => {
    expect(getHeadlessArgs({ browserName: 'chrome', headless: true })).toEqual({
        'goog:chromeOptions': {
            args: ['headless', 'disable-gpu']
        }
    })
    expect(getHeadlessArgs({ browserName: 'firefox', headless: true })).toEqual({
        'moz:firefoxOptions': {
            args: ['-headless']
        }
    })
    expect(getHeadlessArgs({ browserName: 'edge', headless: true })).toEqual({
        'ms:edgeOptions': {
            args: ['--headless']
        }
    })
    expect(() => getHeadlessArgs({ browserName: 'safari', headless: true }))
        .toThrowError(`Given browser "safari" doesn't support headless mode.`)
    expect(getHeadlessArgs({ browserName: 'chrome', headless: false }))
        .toEqual({})
})

test('parseFileName', () => {
    expect(() => parseFileName('')).toThrowError('Please provide a filename')
    expect(() => parseFileName('file.txt')).toThrowError('Unsupported file extension')
    expect(parseFileName('file.js')).toEqual(path.resolve(process.cwd(), 'file.js'))
    expect(parseFileName('file.ts')).toEqual(path.resolve(process.cwd(), 'file.ts'))
})

test('initBrowserSession', async () => {
    await initBrowserSession({
        rootDir: process.cwd(),
        browserName: 'chrome',
        browserVersion: 'latest',
        headless: true
    })
    expect(remote).toBeCalledTimes(1)
})

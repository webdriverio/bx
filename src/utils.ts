export function getHeadlessArgs (browserName: string) {
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
    } else if (browserName.includes('edge')) {
        return {
            'ms:edgeOptions': {
                args: ['--headless']
            }
        }
    }

    throw new Error(`Given browser "${browserName}" doesn't support headless mode.`)
}
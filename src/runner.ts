import { initBrowserSession } from './utils.js'
import { loadSession } from './session.js'
import type { ExecutionEnvironment, RunnerArgs } from './types.js'

const SAFARI_ERROR_PREFIX = 'module code@'

export async function run (env: ExecutionEnvironment, args: RunnerArgs) {
    const browser = args.sessionName
        ? await loadSession(args.sessionName)
        : await initBrowserSession(args)

    let error: Error | undefined

    /**
     * don't use `await` so that we can trigger url load and listen on events
     * at the same time
     */
    browser.url(env.url)
    const result = await new Promise<any>((resolve) => {
        env.server.hot.on('bx:event', (message) => {
            if (message.name === 'errorEvent') {
                error = new Error(message.message)

                /**
                 * Safari sometimes doesn't return a formatted error stack, so
                 * we need to replace the stack with the original error message
                 */
                if (message.error.startsWith(SAFARI_ERROR_PREFIX)) {
                    message.error = `${error.message}\n\tat ${message.error.replace(SAFARI_ERROR_PREFIX, '')}`
                }

                error.stack = message.error.replace(`http://localhost:${env.server.config.server.port}/@fs`, 'file://')
                return resolve(undefined)
            }
            if (message.name === 'doneEvent') {
                return resolve(message.result)
            }
        })
    })

    /**
     * keep browser session around if a session name is provided
     */
    if (!args.sessionName) {
        await browser.deleteSession()
    }

    if (error) {
        throw error
    }

    return result
}
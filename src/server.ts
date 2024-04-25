import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer, type InlineConfig, type ViteDevServer, type Plugin } from 'vite'

import type { ExecutionEnvironment, ConsoleEvent, Target } from './types.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const virtualModuleId = 'virtual:inline'
const resolvedVirtualModuleId = '\0' + virtualModuleId
const DEFAULT_OPTIONS: InlineConfig = {
    configFile: false,
    server: { host: 'localhost', port: 0 },
    logLevel: 'silent'
}

export class ViteServer {
    #server?: ViteDevServer
    #options: InlineConfig

    constructor(options: InlineConfig) {
        this.#options = {
            ...DEFAULT_OPTIONS,
            ...options,
        }
    }

    async start(target: Target): Promise<ExecutionEnvironment> {
        let onConnectHandler: (value: ViteDevServer) => void = () => { }
        const connectPromise = new Promise<ViteDevServer>((resolve) => {
            onConnectHandler = resolve
        })

        this.#server = await createServer({
            ...this.#options,
            plugins: [await instrument(target, onConnectHandler)]
        })
        await this.#server.listen()
        return {
            url: `http://localhost:${this.#server.config.server.port}`,
            connectPromise,
            server: this.#server
        }
    }

    async stop() {
        await this.#server?.close()
    }
}

async function instrument(target: Target, onConnect: (value: ViteDevServer) => void): Promise<Plugin> {
    const instrumentation = await fs.readFile(path.resolve(__dirname, 'browser', 'index.js'), 'utf-8')
    const sendFinishEvent = `requestAnimationFrame(() => import.meta.hot?.send('bx:event', { name: 'doneEvent' }))`
    return {
        name: 'instrument',
        enforce: 'pre',
        load(id) {
            if (typeof target === 'string' && id === resolvedVirtualModuleId) {
                return target
            }
            if (typeof target === 'function' && id === '/inline.js') {
                return `
                    let result = undefined
                    try {
                        result = await (${target.toString()})()
                    } finally {
                        requestAnimationFrame(() => (
                            import.meta.hot?.send(
                                'bx:event',
                                { name: 'doneEvent', result }
                            )
                        ))
                    }
                `
            }
            return null
        },
        transform: (code, id) => {
            if (id === target) {
                return {
                    code: `${code}\n${sendFinishEvent}`
                }
            }
            return null
        },
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                /**
                 * don't return test page when sourcemaps are requested
                 */
                if (!req.originalUrl || req.originalUrl !== '/' || req.url?.endsWith('.map') || req.url?.endsWith('.wasm')) {
                    return next()
                }

                const code = typeof target === 'string' && (target.startsWith('./') || target.startsWith('/'))
                    ? path.extname(target) === '.html'
                        ? await fs.readFile(target, 'utf-8')
                        : `<script type="module" src="/@fs${path.resolve(process.cwd(), target)}"></script>`
                    : typeof target === 'function'
                        ? `<script type="module" src="/inline.js"></script>`
                        : target
                const template = `
                    <!DOCTYPE html>
                    <html>
                    <script type="module">${instrumentation}</script>
                    ${code}
                    ${typeof target === 'string' && path.extname(target) === '.html'
                        ? `<script type="module">${sendFinishEvent}</script>`
                        : ''
                    }
                `
                res.end(await server.transformIndexHtml(`${req.originalUrl}`, template))
            })

            server.hot.on('connection', onConnect)
            server.hot.on('bx:event', (message: ConsoleEvent) => {
                if (message.name === 'consoleEvent') {
                    return handleConsole(message)
                }
            })
        }
    }
}

function handleConsole(message: ConsoleEvent) {
    console[message.type](...message.args)
}

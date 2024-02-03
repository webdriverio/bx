import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer, type InlineConfig, type ViteDevServer, type Plugin } from 'vite'

import type { ExecutionEnvironment, ConsoleEvent } from './types.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const DEFAULT_OPTIONS: InlineConfig = {
    configFile: false,
    server: { host: 'localhost', port: 0 },
    logLevel: 'silent'
}

export class ViteServer {
    #server?: ViteDevServer
    #options: InlineConfig

    constructor (options: InlineConfig) {
        this.#options = {
            ...DEFAULT_OPTIONS,
            ...options,
        }
    }

    async start (filename: string): Promise<ExecutionEnvironment> {
        let onConnectHandler: (value: unknown) => void = () => {}
        const connectPromise = new Promise((resolve) => {
            onConnectHandler = resolve
        })

        this.#server = await createServer({
            ...this.#options,
            plugins: [instrument(filename, onConnectHandler)]
        })
        await this.#server.listen()
        return {
            url: `http://localhost:${this.#server.config.server.port}`,
            connectPromise
        }
    }

    async stop () {
        await this.#server?.close()
    }
}

function instrument (filename: string, onConnect: (value: unknown) => void): Plugin {
    const instrumenter = path.resolve(__dirname, 'browser', 'index.js')

    return {
        name: 'instrument',
        configureServer (server) {
            server.middlewares.use(async (req, res, next) => {
                /**
                 * don't return test page when sourcemaps are requested
                 */
                if (!req.originalUrl || req.originalUrl !== '/' || req.url?.endsWith('.map') || req.url?.endsWith('.wasm')) {
                    return next()
                }

                const code = path.extname(filename) === '.html'
                    ? await fs.readFile(filename, 'utf-8')
                    : `<script type="module" src="/@fs${filename}"></script>`
                const template = `
                    <!DOCTYPE html>
                    <html>
                    <script type="module" src="/@fs${instrumenter}"></script>
                    ${code}
                `
                res.end(await server.transformIndexHtml(`${req.originalUrl}`, template))
            })

            server.ws.on('connection', onConnect)
            server.ws.on('bx:event', (message: ConsoleEvent) => {
                if (message.name === 'consoleEvent') {
                    return handleConsole(message)
                }
            })
        }
    }
}

function handleConsole (message: ConsoleEvent) {
    console[message.type](...message.args)
}
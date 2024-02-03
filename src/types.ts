import type { ViteDevServer } from 'vite'

export interface RunnerArgs {
    browserName: string
    browserVersion?: string
    headless: boolean
    rootDir: string
}

export interface ExecutionEnvironment {
    url: string
    connectPromise: Promise<ViteDevServer>
    server: ViteDevServer
}

export interface ConsoleEvent {
    name: 'consoleEvent'
    type: 'log' | 'info' | 'warn' | 'debug' | 'error'
    args: unknown[]
}

export interface ErrorEvent {
    name: 'errorEvent'
    filename: string
    message: string
    error: string
}
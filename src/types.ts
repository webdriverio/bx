
export interface RunnerArgs {
    browserName: string
    browserVersion?: string
    headless: boolean
}

export interface ExecutionEnvironment {
    url: string
    connectPromise: Promise<unknown>
}

export interface ConsoleEvent {
    name: 'consoleEvent'
    type: 'log' | 'info' | 'warn' | 'debug' | 'error'
    args: unknown[]
}
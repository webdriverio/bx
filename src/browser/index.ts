/// <reference types="vite/client" />

const CONSOLE_METHODS = ['log', 'info', 'warn', 'error', 'debug'] as const
for (const method of CONSOLE_METHODS) {
    const origCommand = console[method].bind(console)
    console[method] = (...args: unknown[]) => {
        if (args.length === 0 || args[0] === '[vite] connected.') {
            return origCommand(...args)
        }

        import.meta.hot?.send('bx:event', {
            name: 'consoleEvent',
            type: method,
            args: sanitizeConsoleArgs(args)
        })
        origCommand(...args)
    }
}

function sanitizeConsoleArgs (args: unknown[]) {
    return args.map((arg: any) => {
        if (
            arg instanceof HTMLElement ||
            (arg && typeof arg === 'object' && 'then' in arg && typeof arg.then === 'function') ||
            typeof arg === 'function'
        ) {
            return arg.toString()
        }
        if (arg instanceof Error) {
            return arg.stack
        }
        return arg
    })
}

import { ViteServer } from '../server.js'
import { run } from '../runner.js'
import type { RunnerArgs } from '../types.js'

export async function runCommand (script: string, args: RunnerArgs) {
    const server = new ViteServer({ root: args.rootDir })
    
    try {
        const env = await server.start(script)
        await run(env, args)
    } catch (err) {
        console.error('Error:', (err as Error).message)
        process.exit(1)
    } finally {
        await server.stop()
    }
}

export * from './session.js'
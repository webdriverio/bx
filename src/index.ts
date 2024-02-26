import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import commands from './cli/index.js'
import { handler } from './cli/run.js'

export default async function cli () {
    const argv = yargs(hideBin(process.argv))
        .command(commands)
        .help()
        .argv
    
    const cmdNames = commands.map((command: { command: string }) => command.command.split(' ')[0])
    const params = await argv
    if (!cmdNames.includes(`${params['_'][0]}`)) {
        await handler()
    }
}

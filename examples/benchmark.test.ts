import { run } from '../dist/index.js'

async function benchmarkTest() {
    const { Bench } = await import('tinybench');
    const bench = new Bench({ time: 100 });

    bench
        .add('faster task', () => {
            console.log('I am faster')
        })
        .add('slower task', async () => {
            await new Promise(r => setTimeout(r, 1)) // we wait 1ms :)
            console.log('I am slower')
        })

    await bench.run();
    return bench.results;
}

const [fasterTaskChrome, slowerTaskChrome] = await run(benchmarkTest, {
    browserName: 'chrome'
})
const [fasterTaskFirefox, slowerTaskFirefox] = await run(benchmarkTest, {
    browserName: 'firefox'
})

console.log(`Chrome: faster task ${fasterTaskChrome.mean}ms, slower task ${slowerTaskChrome.mean}ms`)
console.log(`Firefox: faster task ${fasterTaskFirefox.mean}ms, slower task ${slowerTaskFirefox.mean}ms`)
import assert from 'node:assert'
import { test } from 'node:test'
import { run } from '../dist/index.js'

async function benchmarkTest() {
    const { Bench } = await import('tinybench');
    const bench = new Bench({ time: 100 });

    bench
        .add('faster task', () => {
            // console.log('I am faster')
        })
        .add('slower task', async () => {
            await new Promise(r => setTimeout(r, 1)) // we wait 1ms :)
            // console.log('I am slower')
        })

    await bench.warmup(); // make results more reliable, ref: https://github.com/tinylibs/tinybench/pull/50
    await bench.run();

    return bench.results;
}

test('benchmark test in Chrome', async () => {
    const results = await run(benchmarkTest, {
        browserName: 'chrome'
    })
    assert.equal(results.length, 2)
    assert.ok(results[0].mean < results[1].mean)
    assert.ok(results[0].mean < 1)
    // mean is around 4.45
    assert.ok(results[1].mean > 4)
    assert.ok(results[1].mean < 5)
})

test('benchmark test in Firefox', async () => {
    const results = await run(benchmarkTest, {
        browserName: 'firefox'
    })
    assert.ok(results[0].mean < 1)
    // mean is around 5
    assert.ok(results[1].mean > 4.5)
    assert.ok(results[1].mean < 5.55)
})

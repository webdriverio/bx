import path from 'node:path'
import Koa from 'koa'

import { run, render, type RunnerArgs } from '../../dist/index.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const app = new Koa()

app.use(async (ctx) => {
    const browserName = ctx.query.browserName || 'chrome'
    const sessionName = ctx.query.sessionName
    const runParams: RunnerArgs = { browserName, rootDir: __dirname }
    if (sessionName) {
        runParams.sessionName = sessionName
    }

    if (ctx.path === '/favicon.ico') {
        return
    }

    /**
     * Example of server side rendering without using an SSR helper
     */
    if (ctx.path === '/render') {
        ctx.body = await render(/*html*/`
            <script type="module" src="/component.ts"></script>
            <simple-greeting></simple-greeting>
        `, runParams)
        return
    }

    /**
     * Example of server side rendering using an SSR helper
     */
    ctx.body = await run(async () => {
        const { render } = await import('@lit-labs/ssr');
        const { html } = await import('lit');
        await import('./component.ts');

        const dom = await render(html`<simple-greeting></simple-greeting>`);
        return Array.from(dom).join('\n')
    }, runParams)
})

app.listen(3000)
console.log('Server running at http://localhost:3000/');

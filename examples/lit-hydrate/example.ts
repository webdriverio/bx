import path from 'node:path'
import Koa from 'koa'

import { run, render } from '../../dist/index.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const app = new Koa()

app.use(async (ctx) => {
    if (ctx.path === '/favicon.ico') {
        return
    }

    if (ctx.path === '/render') {
        ctx.body = await render(/*html*/`
            <script type="module" src="/component.ts"></script>
            <simple-greeting></simple-greeting>
        `, {
            headless: false,
            browserName: 'chrome',
            rootDir: __dirname
        })
        return
    }

    ctx.body = await run(async () => {
        const { render } = await import('@lit-labs/ssr');
        const { html } = await import('lit');
        await import('./component.ts');

        const dom = await render(html`<simple-greeting></simple-greeting>`);
        return Array.from(dom).join('\n')
    }, {
        browserName: 'chrome',
        rootDir: __dirname
    })
})

app.listen(3000)
console.log('Server running at http://localhost:3000/');

import path from 'node:path'
import Koa from 'koa'

import { run } from '../../dist/index.js'

import {render} from '@lit-labs/ssr'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const app = new Koa()

app.use(async (ctx) => {
    if (ctx.path === '/favicon.ico') {
        return
    }

    ctx.body = await run(/*js*/`
        import {render} from '@lit-labs/ssr';
        import {html} from 'lit';
        import './component.ts';

        const dom = await render(html\`<simple-greeting></simple-greeting>\`);
        export default Array.from(dom).join('\\n')
    `, {
        browserName: 'chrome',
        rootDir: __dirname
    })
})

app.listen(3000)
console.log('Server running at http://localhost:3000/');

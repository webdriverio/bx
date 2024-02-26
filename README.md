# 🌐 bx - a browser runner [![CI](https://github.com/webdriverio/bx/actions/workflows/ci.yml/badge.svg)](https://github.com/webdriverio/bx/actions/workflows/ci.yml)

With Node.js, Deno or Bun there are so many JavaScript environments to choose from. However, nothing is as good as the browser environment. `bx` gives you an execution runtime for the browser.

# Install

No install needed, just run it directly via `npx`, e.g.:

```sh
npx bx "console.log(navigator.userAgent)"
```

# Usage

With `bx` you can easily run scripts (JS or TS) within different browser environments:

```sh
> echo "console.log(navigator.userAgent)" &> script.js
> npx bx ./script.js
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36
```

You can easily switch browsers via the `--browserName` parameter:

```sh
> npx bx ./script.js --browserName firefox
Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0
```

It even allows you to run `.html` files, e.g. given this file:

```html
<script type="module">
  console.log(document.querySelector("b").textContent);
</script>
<b>Hello World!</b>
```

Running this with `bx` results in:

```sh
> npx bx ./html.html
Hello World!
```

# Run Programmatically

You can also run `bx` programmatically, e.g. to hydrate components within the browser.

## Hydrate Web Components

For example, to hydrate a [Lit](https://lit.dev/) component through a [Koa](https://koajs.com/) server, you can run this script:

```ts
import path from "node:path";
import Koa from "koa";

import { run } from "bx";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = new Koa();

app.use(async (ctx) => {
  if (ctx.path === "/favicon.ico") {
    return;
  }

  ctx.body = await run(async () => {
    /**
     * runs in the browser
     */
    const { render } = await import("@lit-labs/ssr");
    const { html } = await import("lit");
    await import("./component.ts");

    const dom = await render(html`<simple-greeting></simple-greeting>`);
    return Array.from(dom).join("\n");
  }, {
    browserName: "chrome",
    rootDir: __dirname,
  });
});

app.listen(3000);
console.log("Server running at http://localhost:3000/");
```

## Run Benchmark Tests in Browser

Another interesting use case is running benchmarks within different browsers using tools like Tinybench. For example:

```ts
import { run } from 'bx'

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
```

which prints out:

```
Chrome: faster task 0.015639662257872562ms, slower task 4.015384614467621ms
Firefox: faster task 0.007285443683520326ms, slower task 4.761904761904762ms
```

# Session Management

If you like to speed up your execution, you can create browser sessions on your system and run scripts through them immediately without having to spin up the browser. You can create a session via:

```sh
# create a session with random session name, e.g. "chrome-1"
npx bx session --browserName chrome
# create a session with custom name
npx bx session --browserName chrome --name chrome
```

You can now run scripts faster by providing a session name:

```sh
npx bx ./script.ts --sessionName chrome
```

To view all opened sessions, run:

```sh
npx bx session
```

Kill specific or all sessions via:

```sh
npx bx session --kill chrome
npx bx session --killAll
```

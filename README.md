# 🌐 bx - a browser runner

With Node.js, Deno or Bun there are so many JavaScript environments to choose from. However, nothing is as good as the browser environment. `bx` gives you an execution runtime for the browser.

With `bx` you can easily run this script within different browser environments:

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
  console.log(document.querySelector('b').textContent);
</script>
<b>Hello World!</b>
```

Running this with `bx` results in:

```sh
> npx bx ./html.html
Hello World!
```

## Session Management

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
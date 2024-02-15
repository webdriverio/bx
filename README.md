# 🌐 bx - a browser runner

With Node.js, Deno or Bun there are so many JavaScript environments to choose from. However, nothing is as good as the browser environment. `bx` gives you an execution runtime for the browser.

For example, let's say you have a script like this:

```js
console.log(navigator.userAgent)
```

With `bx` you can easily run this script within different browser environments:

```sh
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
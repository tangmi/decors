# decors

Decors is a tool meant for prototyping Javascript front end web apps.

Assuming you're early in development and your client code is separate from your backend code. Decors serves up a directory containing your web app and will make and return remote calls made to a separate backend endpoint as if they were on the same server (to avoid CORS scripting restrictions).

It will also inject middleware into all HTML pages and reload them whenever a source file is changed.

## Installation

```
npm install -g decors
```


## Explanation

Suppose you have a web service that looks like this

```
http://www.example.com
==> GET    /post/:id
==> POST   /post/add
==> DELETE /post/:id/remove
```

…and you want to build a super cool front end app for it.

So locally you set up this app structure:

```
~/Sites
   /index.html
   /js
      /app.js
   /favicon.ico
```

You then install decors globally and run `decors ~/Sites -w -b http://www.example.com`.

Now, you can develop your app as if your remote backend API is available locally:

```
http://localhost:9000
    / [index.html]    # static files served and reloaded from ~/Sites
    /js
        /app.js
    /favicon.ico

==> GET    /post/:id  # remote API routed through decors and available CORS-free
==> POST   /post/add
==> DELETE /post/:id/remove
```

If you were running jQuery, doing something like this would be totally valid:

```js
$.ajax('/post/1').done(function(data) {
	console.log(data);
});
```

In the background, decors tries to act as a proxy, making the response from `http://www.example.com/post/1` available through `http://localhost:9000/post/1`.

## Usage

```
decors [path] [options]
```

Where `path` is the relative or absolute path to the web app directory and `options` are as below:

```
-w, --watch              reload app and inject css on file save
-b, --backend <baseurl>  have decors make backend requests to eliminate CORS issues
-p, --port <port>        set a custom port (default 9000)
```


## Notes

* decors serves static files via [Connect's static middleware](http://www.senchalabs.org/connect/static.html) (and will display `index.html` when requested a directory)
* decors tries to serve static files before making remote calls. If you want to mock out responses from your backend you can create files in the corresponding path to their remote API calls.
* decors LiveReload middleware [does not work well with the LiveReload browser plugin](https://github.com/intesso/connect-livereload#use), so you may need to disable any plugins before using successfully.
* decors will try its best to avoid infinite loops, but if any are encountered, too bad.
* Although decors is primarily meant to act as a proxy for RESTful APIs, I've added in support for images and theoretically other filetypes, but I'd recommend sticking with JSON (and maybe images), as responses are stored in memory before sent to the client.
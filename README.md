# decors

Decors is a simple, temporary, reusable reverse proxy, with benefits.

It was originally made to help the "extremely rapid iterations" mindset for early (or late) Javascript front-end web app development by bypassing CORS restrictions from browsers.

## Use cases

These are a few ways I've found this software to be useful. See the [usage](#usage) for more technical explanations of features.

### Rapid iterations development

With Decors' `--watch` flag, it can inject LiveReload middleware into each page, initiating a reload on all browsers (even mobile) when a source file changes or a CSS injection when stylesheets are updated.

### Static file server

Decors, by default, will serve static files using the working directory (or specified directory) as a root directory. Having Decors serve static assets, in my experience, is quicker than having the application server, such as Tomcat, serve them (and probably better reflects a production environment where something like NginX or Varnish will be serving static assets, though Decors intentionally does not cache files).

### Lazy app prototyping

With the `--backend <baseurl>` flag, Decors can make a static file server, as described above, look like it has the API to your back-end service available. The back-end flag is intended to allow quick front-end prototyping by allowing a separate front-end app make calls to your API as if they were on the same server/port (thereby bypassing any sort of CORS restrictions). This lets developers create front-end web apps separate from the main back-end service and be able to merge the front- and back-end codebases without configuration changes.

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

…and you want to build a super cool front-end app for it.

So locally you set up this app structure:

```
~/Sites
   /index.html
   /js
      /app.js
   /favicon.ico
```

You then install decors globally and run `decors ~/Sites -w -b http://www.example.com`.

Now, you can develop your app as if your remote back-end API is available locally:

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

If you were running jQuery, doing something like this in `app.js` on `localhost:9000` would be totally valid:

```js
$.ajax('/post/1').done(function(data) {
	console.log(data); // logs the output of http://www.example.com/post/1
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
* decors tries to serve static files before making remote calls. If you want to mock out responses from your back-end you can create files in the corresponding path to their remote API calls.
* decors LiveReload middleware [does not work well with the LiveReload browser plugin](https://github.com/intesso/connect-livereload#use), so you may need to disable any plugins before using successfully.
* decors will try its best to avoid infinite loops, but if any are encountered, too bad.
* Although decors is primarily meant to act as a proxy for RESTful APIs, I've added in support for images and theoretically other filetypes, but I'd recommend sticking with JSON (and maybe images), as responses are stored in memory before sent to the client.
* Watching very large hierarchies of files can be very CPU intensive, so be mindful with the `--watch` flag.
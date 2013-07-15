# decors

Decors is a tool meant for prototyping Javascript front end web apps.

Assuming you're early in development and your client code is separate from your backend code. Decors serves up a directory containing your web app and will make and return remote calls made to a separate backend endpoint as if they were on the same server (to avoid CORS scripting restrictions).

It will also inject middleware into all HTML pages and reload them whenever a source file is changed.

## Installation

Install decors with

```
npm install -g decors
```

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

### Notes: 

#### `--watch`

uses a LiveReload middleware to update the `.js` and `.css` (among others) files every time you save.

#### `<baseurl>`

is either a hostname or a protocol and hostname. It's expected that the web app will call the backend's RESTful API as if the client code were located on the same server as the backend code. For example, if you have your backend server on `www.example.com`, with a REST API `/hello`, we can start decors with `decors -b lwww.example.com`. Whenever you want to access the backend's `/hello` API, just call `http://localhost:9000/hello` and decors will make a request for you to `www.example.com/hello`.

#### `--port`

will change the port on which the decors server is run.
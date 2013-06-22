# decors

This is a response to the frustation from running into CORS issues in cross-domain ajax calls. Decors simply acts as a proxy for you while you begin the development of your webapp (you probably don't want to use this when you go to production).

## Why?

Perhaps if you are co-developing with a partner and he/she is working on the backend. If you are on the same network, you can access their IP address and pick up their changes in real-time. It's like CO-OP development.

Decors also speeds up your development marginally by providing middleware that reloads your page in the browser as you make changes to it.

## How to run

There's two ways of running decors. Go into the `./decors` directory and run `npm install`, then pick one:

 * Run `npm start` (or `./node_modules/.bin/grunt`)
 * Install `grunt-cli`, then run `grunt`.

You'll see your browser open a window pointed at `http://localhost:9000/` and you can start developing your app in `./app`! Whenever you want to make a non-local request, just prepend the url with `/_decors/`.
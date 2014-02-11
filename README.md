# [Dug.js](http://rog.ie/blog/dugjs-a-jsonp-to-html-script)

So you want to display your Dribbble shots, recent pins on Pinterest, 500px or Instagram photos, Github commits, or recently listened to music on your blog or site? Then this chunk of javascript is for you. It was designed to be a lightweight, simple, library-independent script to pull in feeds of content available on the web as JSONP (there's lots of em!) to display on your site.

Read the full explanation over at the [blog post](http://rog.ie/blog/dugjs-a-jsonp-to-html-script).

A JSONP to HTML script

### Usage

With Dug.js, you really only need two things to pull in data from any JSONP endpoint into any HTML page:

1. The api endpoint (jsonp callbacks supported)
2. The HTML template to display the data

### Params

**target**** — the id of an existing DOM element to put the html results in.
**cacheExpire** — # of milliseconds to cache data on the client side (using localstorage). 0 for no caching.
**callbackParam** — the name of the query variable a JSONP service will use for a callback function. Most services just use 'callback=functionName', but sometimes a service will use a different query variable name.
**success** — a function to call when JSONP data is successfully retrieved.
**error** — a function to call when JSONP data is not successfully retrieved.
**beforeRender** @param data — a function called before Dug.js renders the template. Helpful for trimming/changing the data before it renders.
**afterRender** @param data — a function called after Dug.js renders the template.

### Contributing

If you have a great idea for making dug.js better, just fork, and open a pull requests for discussion & development. When in doubt, open the PR early for discussion (prior to actually fully completing the feature) and once we have a chance to discuss whether it's a good idea, then go build that :sparkles:!

### License

Dug.js is 100% free under the **[WTFPL](http://en.wikipedia.org/wiki/WTFPL)** — no link backs or anything needed.
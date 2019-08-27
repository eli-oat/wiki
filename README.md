# wiki
## A static wiki engine. 

`A quick note to start:` this documentation is still a bit of a work in process.

*** 

### What is this thing?
This is a very simple static wiki engine. Data is fed to it, and it turns that data into a navigable, hierarchical website.

I set out to make somethine as light-weight, yet fully features as possible.

### How can I use it?
The data is sourced (currently) from a static `json` file. Here is a quick description of the format of that file.

```json
{
	"title": "Wiki Title",
	"pages": [
		{
			"parentPage": null,
			"slug": "welcome",
			"title": "The first page",
			"body": "# Welcome \nThis is the first page of the wiki."
		},
		{
			"parentPage": "welcome",
			"slug": "childPage",
			"title": "The first page's child",
			"body": "# I am a child \nThis is the first page's child."
		}
	]
}
```

At the moment, the specification for the feeding data is wicked lightweight. In the future some more features may be added, but for the time being what is in place works pretty well. 

- `parentPage` -- either `null` or a reference to another page's `slug`.
- `slug` -- this will become the url for the entry
- `title` -- the entry's title
- `body` -- the content of the page in markdown

### How can I install use this thing?
I would like the instalation story to be prettier down the road. 

For now, there are 2 `.env` variables that need to be configured before the site is deployed. 

The 2 variables are `ROOT_URL` and `DATABASE_URL`.

- `ROOT_URL` describes the base url of the wiki, e.g. `https://wiki.eli.li`
- `DATABASE_URL` describes the location of the `json` database

This repo includes 2 `.env` files, one for staging and one for production. In the future I hope to be able to remove the staging specific one, maybe, but at the moment the router used here requires pretty explicit direction.

After configuring the `.env` variables run the following command to build the site.

``` bash
yarn run build
```

This command will create a new directory named `/dist`. Deploy this to your host.

### What is next for this thing?
There are a number of items that I would like to clean up here, namely: 

- Installation
- Offline support
- Completely static fall-back (no need for JS)

I also hope to port the static wiki engine to a number of languages in the future.

The major missing piece right now is the ability to add/edit content on the fly, without manually editing a `json` file.

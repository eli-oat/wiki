import Navigo from 'navigo';
import $ from 'jquery';
import marked from 'marked';


// Configure markdown parser
marked.setOptions({
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: true,
    langPrefix: 'language-',
    highlight: function (code, lang) {
        if (lang === 'js') {
            return highlighter.javascript(code);
        }
        return code;
    }
});


// Configure and initialize router
const root = process.env.ROOT_URL //localhost:1234'; // root URL is defined with an env variable
const useHash = false;
const hash = null;
const router = new Navigo(root, useHash, hash);


// Get the data
$.ajax({
    url: 'https://luxurious-binder.glitch.me/wiki.json',
    async: true,
    contentType: 'application/json',
    dataType: 'json',
    type: 'GET',
    success: (wikiData) => {

        const wikiTitle = wikiData.title;
        const pageData = allWikiPages(wikiData); // all wiki pages
        const indexPages = findIndexPages(pageData); // top-level index pages

        router
            .on('/', () => {
                // return all index pages
                buildIndex(wikiTitle, indexPages);
            })
            .on('/:slug', (params) => {
                // return a specific page by that page's slug
                let targetPage = findSinglePage(pageData, params.slug);
                let childPages = findChildPages(pageData, params.slug);
                buildDetail(targetPage, childPages);
            })
            .on('/children/:slug', (params) => {
                // return the children of a given slug
                let childPages = findChildPages(pageData, params.slug);
                listPages(childPages); // FIXME: never clears the loading indicator.
            })
            .notFound((query) => {
                console.log('Not found. ' + query);
            })
            .resolve();

    },
    error: (xhr, status, error) => {
        console.log('🚨 There was an error retrieving the data!');
        console.log(status);
        console.log(error);
    }
});


// Utilities for retrieving the data
function allWikiPages(data) {
    let ret;
    if (data.pages) {
        ret = data.pages;
    } else {
        ret = JSON.stringify('No Page Data');
    }
    return ret;
}

function findIndexPages(pageData) {
    let parentPages = [];
    pageData.forEach((page) => {
        if (!page.parentPage) {
            parentPages.push(page);
        }
    });
    return parentPages;
}

function findSinglePage(pageData, pageSlug) {
    let ret = null;
    pageData.forEach((page) => {
        if (page.slug === pageSlug) {
            ret = page;
        }
    });
    return ret;
}

function findChildPages(pageData, parentPage) {
    let childPages = [];
    pageData.forEach((page) => {
        if (page.parentPage === parentPage) {
            childPages.push(page);
        }
    });
    return childPages;
}


// Build pages with the data
function buildIndex(wikiTitle, wikiIndex) {
    $('#wiki').html('<h1>' + wikiTitle + '</h1><main id="indexList"></main>');
    wikiIndex.forEach((page) => {
        $('#indexList').append(
            `<section id="${page.slug}">
                <h2><a href="/${page.slug}">${page.title}</a></h2>
                ${marked(page.body)}
            </section>`
        );
    });
}

function buildDetail(page, pages) {
    let backLink = '/';
    if (page.parentPage) {
        backLink = page.parentPage;
    }
    $('#wiki').html(
        `<nav>
            <p><a href="${backLink}">&laquo; Back</a></p>
        </nav>
        <article id="${page.slug}"></article>
    `);
    $('#' + page.slug).html(
        `<h1>${page.title}</h1>
        ${marked(page.body)}`
    );
    listPages(pages);
}

function listPages(pages) {
    $('#wiki').append(`<ul id="pageList"></ul>`);
    pages.forEach((page) => {
        $('#pageList').append(`<li><a href="/${page.slug}">${page.title}</a></li>`);
    });
}
import Navigo from 'navigo';
import $ from 'jquery';
import marked from 'marked';
import lunr from 'lunr';


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
const root = process.env.ROOT_URL; // root URL is defined with an env variable
const useHash = true;
const hash = '#';
const router = new Navigo(root, useHash, hash);


// Get the data
$.ajax({
    url: 'https://luxurious-binder.glitch.me/wiki.json',
    async: true,
    contentType: 'application/json',
    dataType: 'json',
    type: 'GET',
    success: (data) => {


        if (localStorage.getItem('wikiData')) {
            localStorage.removeItem('wikiData');
        }

        localStorage.setItem('wikiData', JSON.stringify(data));

        const wikiData = JSON.parse(localStorage.getItem('wikiData'));
        const wikiTitle = wikiData.title;
        const pageData = allWikiPages(wikiData); // all wiki pages
        const indexPages = findIndexPages(pageData); // top-level index pages

        router
            .on('/', () => {
                // return all index pages
                buildIndex(wikiTitle, indexPages);
            })
            .on('buscar/:query', (params) => {
                // search results
                let idx = lunr(function () {
                    this.ref('slug');
                    this.field('body');
                    pageData.forEach(function (doc) {
                        this.add(doc)
                    }, this)
                });
                let searchResults = idx.search(params.query);
                $('#wiki').html(
                    `<nav><p id="breadCrumbs"><a href="/"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAFoTx1HAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAAdlJREFUKBVlUj1vFDEQnbF3D2+sHAUVKPQE7lKA6FEQgQjRALoO5fLHyF2HTkCDEHBBqfgF9xUqmkQJTQoOvLvk1mv2+fAqCEvWep/nPc+8GaKL6+XK7DYNaCABci+ZnJDgFwzEqbtFxua0m7Wu1ZSent6vf/b09JHn7enxg5ii74W1X6inJnOgr9Q3xzj01ThN8taq/xmQk0ZPNmPbGBa0+NnNW00EMcRiG30gWW40zI1Zh9j2kvERO3HFMxFVaf8gdnPl9NpC5luXzPoB8HpBJZQDUIQbZAV5o9c3kQNwL7uUJBMJ+TC2apTKX1vaHB5wX01Tx+VZN2tfB+Ncf71JVowWstgWlcATJAH/kGlR2k8oZ9fc+li55+RvfVjVqIY5m2Ny3KzqvFy/iYBUz+6xLd/t5O2VkOQ/35AlLIeF2MH+cBcIvswA4mlUpWzyuerAGTbOwHAHUoj1RKSy9EcNK1NMKvI7qBobZ2CoBTGIhYDvl7D0VlKUFHx+zIIe75j2KCjDlb4eb7iS3keusWapyEpJT/1sdahjMTRs+XVCuok5QwOgDCsTp69mZOZOuue7pr2PltZDgBeg/lfgTUTxqidW/leEZ0vCMgb4fysMCIYlzHDALgb/AQ4a/m3yQy73AAAAAElFTkSuQmCC" alt="Return to the Index."></a>&nbsp;</p></nav>
                     <h1>Search: ${params.query}</h1><ul id="searchResults"></ul>`
                );
                searchResults.forEach((result) => {
                    $('#searchResults').append(`<li><a href="#${result.ref}">#${result.ref}</a></li>`);
                });
            })
            .on('lista', () => {
                // hierarchical display of all pages as a tree/list
                console.log('WIP, lista');
            })
            .on(':slug', (params) => {
                // return a specific page by that page's slug
                let targetPage = findSinglePage(pageData, params.slug);
                let childPages = findChildPages(pageData, params.slug);
                buildDetail(targetPage, childPages, pageData);
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
    let singlePage = null;
    pageData.forEach((page) => {
        if (page.slug === pageSlug) {
            singlePage = page;
        }
    });
    return singlePage;
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

function findParentPage(pageData, currentPageParent) {
    let parentPage = null;
    pageData.forEach((page) => {
        if (page.slug === currentPageParent) {
            parentPage = page;
        }
    });
    return parentPage;
}

function findAllAncestors(pageData, currentParent, familyTree = []) {
    if (currentParent) {
        let parentPage = findParentPage(pageData, currentParent);
        if (parentPage.parentPage) {
            familyTree.push(parentPage);
            findAllAncestors(pageData, parentPage.parentPage, familyTree);
        } else {
            familyTree.push(parentPage);
        }
    }
    return familyTree;
}


// Build UI with the data
function buildIndex(wikiTitle, wikiIndex) {
    $('#wiki').html(
        `<nav><p id="breadCrumbs"><a href="/"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAFoTx1HAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAAdlJREFUKBVlUj1vFDEQnbF3D2+sHAUVKPQE7lKA6FEQgQjRALoO5fLHyF2HTkCDEHBBqfgF9xUqmkQJTQoOvLvk1mv2+fAqCEvWep/nPc+8GaKL6+XK7DYNaCABci+ZnJDgFwzEqbtFxua0m7Wu1ZSent6vf/b09JHn7enxg5ii74W1X6inJnOgr9Q3xzj01ThN8taq/xmQk0ZPNmPbGBa0+NnNW00EMcRiG30gWW40zI1Zh9j2kvERO3HFMxFVaf8gdnPl9NpC5luXzPoB8HpBJZQDUIQbZAV5o9c3kQNwL7uUJBMJ+TC2apTKX1vaHB5wX01Tx+VZN2tfB+Ncf71JVowWstgWlcATJAH/kGlR2k8oZ9fc+li55+RvfVjVqIY5m2Ny3KzqvFy/iYBUz+6xLd/t5O2VkOQ/35AlLIeF2MH+cBcIvswA4mlUpWzyuerAGTbOwHAHUoj1RKSy9EcNK1NMKvI7qBobZ2CoBTGIhYDvl7D0VlKUFHx+zIIe75j2KCjDlb4eb7iS3keusWapyEpJT/1sdahjMTRs+XVCuok5QwOgDCsTp69mZOZOuue7pr2PltZDgBeg/lfgTUTxqidW/leEZ0vCMgb4fysMCIYlzHDALgb/AQ4a/m3yQy73AAAAAElFTkSuQmCC" alt="Return to the Index."></a>&nbsp;</p></nav>
        <h1>${wikiTitle}</h1>
        <main id="indexList"></main>`
    );
    wikiIndex.forEach((page) => {
        $('#indexList').append(
            `<section id="${page.slug}">
                <h2><a href="/#${page.slug}">${page.title}</a></h2>
                ${marked(page.body)}
            </section>`
        );
    });
    buildFooter();
}

function buildDetail(page, childPages, pageData) {
    $('#wiki').html(
        `<nav><p id="breadCrumbs"><a href="/"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAFoTx1HAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAAdlJREFUKBVlUj1vFDEQnbF3D2+sHAUVKPQE7lKA6FEQgQjRALoO5fLHyF2HTkCDEHBBqfgF9xUqmkQJTQoOvLvk1mv2+fAqCEvWep/nPc+8GaKL6+XK7DYNaCABci+ZnJDgFwzEqbtFxua0m7Wu1ZSent6vf/b09JHn7enxg5ii74W1X6inJnOgr9Q3xzj01ThN8taq/xmQk0ZPNmPbGBa0+NnNW00EMcRiG30gWW40zI1Zh9j2kvERO3HFMxFVaf8gdnPl9NpC5luXzPoB8HpBJZQDUIQbZAV5o9c3kQNwL7uUJBMJ+TC2apTKX1vaHB5wX01Tx+VZN2tfB+Ncf71JVowWstgWlcATJAH/kGlR2k8oZ9fc+li55+RvfVjVqIY5m2Ny3KzqvFy/iYBUz+6xLd/t5O2VkOQ/35AlLIeF2MH+cBcIvswA4mlUpWzyuerAGTbOwHAHUoj1RKSy9EcNK1NMKvI7qBobZ2CoBTGIhYDvl7D0VlKUFHx+zIIe75j2KCjDlb4eb7iS3keusWapyEpJT/1sdahjMTRs+XVCuok5QwOgDCsTp69mZOZOuue7pr2PltZDgBeg/lfgTUTxqidW/leEZ0vCMgb4fysMCIYlzHDALgb/AQ4a/m3yQy73AAAAAElFTkSuQmCC" alt="Return to the Index."></a>&nbsp;</p></nav>
        <article id="${page.slug}"></article>`
    );
    buildBreadCrumbs(findAllAncestors(pageData, page.parentPage));
    $('#' + page.slug).html(
        `<h1>${page.title}</h1>
        ${marked(page.body)}`
    );
    buildListOfPages(childPages);
    buildFooter();
}

function buildBreadCrumbs(familyTree) {
    familyTree.reverse().forEach((page) => {
        $('#breadCrumbs').append(`/ <a href="#${page.slug}">#${page.slug}</a> `);
    });
}

function buildListOfPages(pages) {
    $('#wiki').append(`<ul id="pageList"></ul>`);
    pages.forEach((page) => {
        $('#pageList').append(`<li><a href="/#${page.slug}">${page.title}</a></li>`);
    });
}

function buildFooter() {
    $('#wiki').append(`<a href="javascript:void(0);" id="searchButton" class="searchOpen">Search</a>`);
    $('#searchButton').click((event) => {
        const currentPage = window.location.hash.replace('#','');
        $('#wiki').empty().html(`
        <div class="searchContainer">
            <form id="searchForm">
                <label for="searchTerm">Search</label>
                <input id="searchTerm" name="search" type="search" aria-placeholder="Search">
                <input type="submit" value="Search">
            </form>
            <a href="${currentPage}" class="searchClose" data-navigo>Close</a>
        </div>
        `);
        $("#searchForm").on("submit", (event) => {
            const searchTerm = $('#searchTerm').val();
            router.navigate('buscar/' + searchTerm);
            event.preventDefault();
        });
        event.preventDefault();
    });
}
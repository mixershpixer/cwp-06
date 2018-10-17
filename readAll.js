const log = require('./log').log;
let articles = require('./articles.json');
let sortedArticles = {};

module.exports.readAll = function readAll(req, res, payload, cb) {
	if (payload === undefined) payload = { sortField: 'date', sortOrder: 'desc', page: 1, limit: 10, includeDeps: false };
    else {
        if (payload.sortField === undefined) payload.sortField = 'date';
        if (payload.sortOrder === undefined) payload.sortOrder = 'desc';
        if (payload.includeDeps === undefined) payload.includeDeps = false;
    }
    sortedArticles = articles.slice();
    switch(payload.sortField)
    {
        case "id":     sort(payload, (a, b) => { return b.id - a.id; } );
        case "title":  sort(payload, (a, b) => { return a.title.localeCompare(b.title); } );
        case "text":   sort(payload, (a, b) => { return a.text.localeCompare(b.text); } );
        case "date":   sort(payload, (a, b) => { return a.date - b.date; } );
        case "author": sort(payload, (a, b) => { return a.author.localeCompare(b.author); } );
        default:       cb( { error: '400', errorText: 'Invalid request' } );
    }
    if (payload.includeDeps === false) {
        sortedArticles = sortedArticles.map((element) => {
            var obj = Object.assign({}, element);
            delete obj.comments;
            return obj;   
        });
    }

    let articlesResponse = { items : sortedArticles, meta : { page : 1, pages: 0, count: articles.length, limit: 10 } };
    if (payload.page !== undefined) articlesResponse.meta.page = payload.page;
    if (payload.limit !== undefined) articlesResponse.meta.limit = payload.limit;
    articlesResponse.meta.pages = Math.ceil(articlesResponse.meta.count / articlesResponse.meta.limit);
    articlesResponse.items = articlesResponse.items.splice(
    	(articlesResponse.meta.page - 1) * articlesResponse.meta.limit,
    	articlesResponse.meta.limit /* * articlesResponse.meta.page */
    );
    log('/api/articles/readall', payload);
    cb(null, articlesResponse);
}

function sort(payload, func) {
    console.log('sort array');
    sortedArticles = sortedArticles.sort(func);
    if (payload.sortOrder === 'asc') {
        console.log('reverse array');
        sortedArticles.reverse();
    }
}
var link_extractor = require('../link_extractor.js');
var common = require('common');

var containsLink = function (list, value) {
    for (var i = 0; i < list.length; i++) {
        if (value.outerHTML.toLowerCase() == list[i].outerHTML.toLowerCase()) {
            return true;
        }
    }
    return false;
}

var getProductLinks = async (link, product_patterns) => {
    var testHTML = link.outerHTML.toLowerCase();
    if (testHTML.length > 500) {
        return;
    }

    for (var z = 0; z < product_patterns.length; z++) {
        var pattern = JSON.parse(product_patterns[z]);
        if (testHTML.indexOf(pattern.pattern) !== -1 &&
            testHTML.indexOf('email') === -1 &&
            testHTML.indexOf('mailto') === -1) {
            link.pattern = pattern;
            if (link.outerHTML.toLowerCase().indexOf('contact') === -1) {
                return link;
            }
        }
    }
    return;
}


var searchTagType = async (tags, sourceurl, limit) => {
    try {
        var product_links = [];
        var product_patterns = await common.Cache.getProductPatterns();
        var checkpoint = Math.ceil(tags.length / 8);
        var i = 0;
        
        for (let link of tags) {
            if (limit) {
                if (product_links.length >= limit) {
                    return product_links;
                }
            }
            var prodlink = await getProductLinks(link, product_patterns);
            if (prodlink && !containsLink(product_links, prodlink)) {
                product_links.push(prodlink);
            }
        }
        return product_links;
    } catch (err) {
        throw err;
    }
}

function ProductLinkFilter() {
    return new Promise((resolve, reject) => {
        init().then(results => {
            console.info("Product Link Filter Initialized");
            return resolve(this);
        }).catch(err => {
            console.error("Error Initializing Promise Link Filters:", err);
            return reject(err);
        });
    });
}

var filter = async (sourceurl, html, limit) => {
    try {
        var product_links = [];
        var anchors = await link_extractor.getAnchors(sourceurl, html);
        var spans = await link_extractor.getSpans(sourceurl,html);
        
        var all_links = anchors.concat(spans);
        console.info("[PRODUCTS] ALL LINKS",all_links.length )
        
        product_links = await searchTagType(all_links, sourceurl, limit);

        console.info("Product Links found", product_links.length, sourceurl);
        return product_links;
    } catch (err) {
        console.error("Filter Product Links ERROR", err);
        throw err;
    }
}


module.exports.filter = filter;
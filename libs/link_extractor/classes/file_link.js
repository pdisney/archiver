var validUrl = require('valid-url');
var URL = require('url');
const path = require('path');

/**
 * Array of link endings to exclude
 * 
 */
const URL_EXTENTION_TO_INCLUDE = [
    '.txt',
    '.pdf',
    '.ppt',
    '.pptx',
    '.doc',
    '.docx',
    '.csv',
    '.xls',
    '.xlsx',
    '.rar',
    '.zip',
    '.gz',
    '.rtf',
    '.xml',
    '.json'
];


/**
 * Helper funcction to determine if a string ends with a particular value.
 * @param {string} str 
 * @param {string} suffix 
 */
function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/**
 *  Determines if an href's value ends with the desired ending.
 * @param {string} href 
 */
function hrefEndingValid(href) {
    for (var i = 0; i < URL_EXTENTION_TO_INCLUDE.length; i++) {
        var ending = URL_EXTENTION_TO_INCLUDE[i];
        if (endsWith(href, ending)){ 
            return true;
        }else{
            var filename = path.basename(href);
            var url = URL.parse(href);
            if(url.protocol && filename.indexOf('.')===-1 
                && url.protocol.indexOf('ftp')!==-1) {
                return true;
            }   
        }
       
    }
    return false;

}

/**
 * Link Class Definition.
 */
function FileLink() {
    this.id = "";
    this.type = "";
    this.name = '';
    this.value = "";
    this.class = '';
    this.tag_type = '';
    this.title = '';
    this.baseURI = '';
    this.validHref = false;
    this.href = '';
    this.orig_href = '';
    this.outerHTML = '';
    this.innerHTML = '';
    this.uri = '';
    this.selector = '';
    this.pattern = '';
    this.validHrefEnding = false;
}

FileLink.prototype.getValidEndings = function(){
    return URL_EXTENTION_TO_INCLUDE;
}

/**
 * Method updaing tag selector value
 */
FileLink.prototype.updateSelector = function () {
    var selectorVal = this.tag_type;
    if (this.id.length > 0) {
        selectorVal += '[id="' + this.id + '"]';
    }
    if (this.type.length > 0) {
        selectorVal += '[type="' + this.type + '"]';
    }
    if (this.name.length > 0) {
        selectorVal += '[name="' + this.name + '"]';
    }
    if (this.value.length > 0) {
        selectorVal += '[value="' + this.value + '"]';
    }
    if (this.title.length > 0) {
        selectorVal += '[title="' + this.title + '"]';
    }
    if (this.orig_href.length > 0) {
        selectorVal += '[href="' + this.orig_href + '"]';
    } else {
        if (this.href.length > 0) {
            selectorVal += '[href="' + this.href + '"]';
        }
    }
    if (this.class.length > 0) {
        this.class = this.class.replace(/ /g, '.');
        selectorVal += '.' + this.class;
    }

    this.selector = selectorVal;
}

/**
 * Updates Links Href property.
 * @param {string} tag_href 
 * @param {Link} link 
 */
FileLink.prototype.updateHref = async (tag_href, link) => {
    try {
        link.validHrefEnding = hrefEndingValid(tag_href);
        if (link.validHrefEnding) {

            link.href = tag_href;
            link.orig_href = link.href;
            link.validHref = true;

            if (validUrl.isWebUri(link.href)) {
                var uri = URL.parse(link.href);
                link.uri = uri;
               
            } else {
                var combinedUrl = link.href;
                if (link.baseURI && link.href) {
                    combinedUrl = URL.resolve(link.baseURI, link.href);
                }
                if (validUrl.isWebUri(combinedUrl)) {
                    var uri = URL.parse(combinedUrl);
                    link.href = uri.href;
                    link.uri = uri;
                }
            }
        }
        return;
    } catch (err) {
        throw err;
    }
}

/**
 * Method Updating Links Src property.
 * @param {string} tag_src 
 * @param {Link} link 
 */
FileLink.prototype.updateSrc = async (tag_src, link) => {
    try {

        link.validHrefEnding = hrefEndingValid(tag_src);
        if (link.validHrefEnding) {
            link.href = tag_src;
            link.orig_href = link.href;

            if (validUrl.isWebUri(link.href)) {
                var uri = URL.parse(link.href);
                link.uri = uri;
                link.validHref = true;
            } else {
                var combinedUrl = link.href;
                if (link.baseURI && link.href) {
                    combinedUrl = URL.resolve(link.baseURI, link.href);
                }
                if (validUrl.isWebUri(combinedUrl)) {
                    var uri = URL.parse(combinedUrl);
                    link.href = uri.href;
                    link.uri = uri;
                    link.validHref = true;
                }
            }
        }
        return;
    } catch (err) {
        throw err;
    }
}




module.exports = FileLink;

var validUrl = require('valid-url');
var URL = require('url');


/**
 * Array of link endings to exclude
 * 
 */
const URL_EXTENTION_TO_EXCLUDE = [
    '.exe',
    '.txt',
    '.jpg',
    '.jpeg',
    '.gif',
    '.png',
    '.swf',
    '.pdf',
    '.ppt',
    '.pptx',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.rar',
    '.zip',
    '.gz',
    '.rtf',
    '.xml',
    '.mp3',
    '.mp4',
    '.avi'];

/**
 * Array of link endings to exclude
 */
const SRC_URL_EXTENTION_TO_EXCLUDE = [
    '.exe',
    '.txt',
    '.swf',
    '.pdf',
    '.ppt',
    '.pptx',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.rar',
    '.zip',
    '.gz',
    '.rtf',
    '.xml',
    '.mp3',
    '.mp4',
    '.avi'];


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
    for (var i = 0; i < URL_EXTENTION_TO_EXCLUDE.length; i++) {
        var ending = URL_EXTENTION_TO_EXCLUDE[i];
        if (endsWith(href, ending)) {
            //  console.info("INVALID HREF ENDING: " + href);
            return false;
        }
    }
    return true;

}
/**
 * Validate Urls ending is valid. 
 * @param {string} url 
 */
function srcEndingValid(url) {
    for (var i = 0; i < SRC_URL_EXTENTION_TO_EXCLUDE.length; i++) {
        var ending = SRC_URL_EXTENTION_TO_EXCLUDE[i];
        if (endsWith(url, ending)) {
            return false;
        }
    }
    return true;

}



/**
 * Link Class Definition.
 */
function Link() {
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



/**
 * Method updaing tag selector value
 */
Link.prototype.updateSelector = function () {
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
Link.prototype.updateHref = async (tag_href, link) => {
    try {
        link.validHrefEnding = hrefEndingValid(tag_href);
        if (link.validHrefEnding &&
            tag_href !== "" &&
            tag_href !== "\\" &&
            tag_href !== '/' 
        ) {
            link.href = tag_href;
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

/**
 * Method Updating Links Src property.
 * @param {string} tag_src 
 * @param {Link} link 
 */
Link.prototype.updateSrc = async (tag_src, link) => {
    try {

        link.validHrefEnding = srcEndingValid(tag_src);
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




module.exports = Link;

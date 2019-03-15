const validUrl = require('valid-url');
const Link = require('./classes/link.js');
const FileLink = require('./classes/file_link.js');
const URL = require('url');
const cheerio = require('cheerio');
const franc = require('franc');

const ANCHOR = 'a';
const INPUT = 'input';
const BUTTON = 'button';
const FORM = 'form';
const SPAN = 'span';
const SELECT = 'select';
const TEXTAREA = 'textarea';
const IMAGES = 'img';

const BODY = 'body';
const DIV = 'div';
const PARAGRAPH = 'p';



/**
 * Function retruning relevent Select Links from source HTML
 * @param {string} source_url 
 * @param {string} html 
 */
var getSelectLinks = async (source_url, html) => {
    try {
        var doc_url = URL.parse(source_url);
        $ = cheerio.load(html);
        var baseURI = source_url;
        var base = $('base');
        if (base) {
            var basehref = base.attr('href');
            if (basehref) {
                if (validUrl.isWebUri(basehref))
                    baseURI = basehref;
            }
        }
        var all_selects = $(SELECT);
        var links = await processTags(SELECT, all_selects, baseURI);

        return links;
    } catch (err) {
        throw err;
    }

}
/**
 * Function returning relevent Image Links from source HTML
 * @param {string} source_url 
 * @param {string} html 
 */
var getImageLinks = async (source_url, html) => {
    try {
        var doc_url = URL.parse(source_url);
        $ = cheerio.load(html);
        var baseURI = source_url;
        var base = $('base');
        if (base) {
            var basehref = base.attr('href');
            if (basehref) {
                if (validUrl.isWebUri(basehref))
                    baseURI = basehref;
            }
        }
        var all_images = $(IMAGES);
        var links = await processTags(IMAGES, all_images, baseURI);

        return links;
    } catch (err) {
        throw err;
    }

}

/**
 * Function returning relevent Anchor Links from source HTML
 * @param {string} source_url 
 * @param {string} html 
 */
var getAnchors = async (source_url, html) => {
    try {
        var doc_url = URL.parse(source_url);
        $ = cheerio.load(html);
        var baseURI = source_url;
        var base = $('base');
        if (base) {
            var basehref = base.attr('href');
            if (basehref) {
                if (validUrl.isWebUri(basehref))
                    baseURI = basehref;
            }
        }
        var all_anchors = $(ANCHOR);
        var links = await processTags(ANCHOR, all_anchors, baseURI);

        return links;
    } catch (err) {
        throw err;
    }

}
/**
 * Function returning relevent Span Links from source HTML
 * @param {string} source_url 
 * @param {string} html 
 */
var getSpans = async (source_url, html) => {
    try {
        var doc_url = URL.parse(source_url);
        $ = cheerio.load(html);
        var baseURI = source_url;
        var base = $('base');
        if (base) {
            var basehref = base.attr('href');
            if (basehref) {
                if (validUrl.isWebUri(basehref))
                    baseURI = basehref;
            }
        }
        var all_spans = $(SPAN);
        var links = await processTags(SPAN, all_spans, baseURI);

        return links;
    } catch (err) {
        throw err;
    }

}
/**
 * Function returning relevent Input Links from source HTML
 * @param {string} source_url 
 * @param {string} html 
 */
var getInputs = async (source_url, html) => {
    try {
        var doc_url = URL.parse(source_url);
        $ = cheerio.load(html);
        var baseURI = source_url;
        var base = $('base');
        if (base) {
            var basehref = base.attr('href');
            if (basehref) {
                if (validUrl.isWebUri(basehref))
                    baseURI = basehref;
            }
        }
        var all = $(INPUT);
        var links = await processTags(INPUT, all, baseURI);
        return links;
    } catch (err) {
        throw err;
    }
}
/**
 * Function returning relevent Button Links from source HTML
 * @param {string} source_url 
 * @param {string} html 
 */
var getButtons = async (source_url, html) => {
    try {
        var doc_url = URL.parse(source_url);
        $ = cheerio.load(html);
        var baseURI = source_url;
        var base = $('base');
        if (base) {
            var basehref = base.attr('href');
            if (basehref) {
                if (validUrl.isWebUri(basehref))
                    baseURI = basehref;
            }
        }
        var all = $(BUTTON);
        var links = await processTags(BUTTON, all, baseURI);
        return links;
    } catch (err) {
        throw err;
    }
}
/**
 * Function returning relevent Form Submit Links from source HTML
 * @param {string} source_url 
 * @param {string} html 
 */
var getSubmitForms = async (source_url, html) => {
    try {
        var doc_url = URL.parse(source_url);
        $ = cheerio.load(html);
        var baseURI = source_url;
        var base = $('base');
        if (base) {
            var basehref = base.attr('href');
            if (basehref) {
                if (validUrl.isWebUri(basehref))
                    baseURI = basehref;
            }
        }
        var all = $(FORM);
        var links = await processTags(FORM, all, baseURI);
        return links;
    } catch (err) {
        throw err;
    }
}


/**
 * Function returning all relevent Links from source HTML
 * @param {string} source_url 
 * @param {string} html 
 */
var getLinks = async (source_url, html) => {
    try {
       
        $ = cheerio.load(html);
    
        var baseURI = source_url;
        var base = $('base');
        if (base) {
            var basehref = base.attr('href');
            if (basehref) {
                if (validUrl.isWebUri(basehref))
                    baseURI = basehref;
            }
        }

        var form_ins = $(FORM + '[action]');
        var text_ins = $(INPUT + '[type="text"]');
        var text_img = $(INPUT + '[type="image"]');
        var password_ins = $(INPUT + '[type="password"]');
        var search_ins = $(INPUT + '[type="search"]');
        var submit_ins = $(INPUT + '[type="submit"]');
        var submit_btns = $(BUTTON + '[type="submit"]');
        var submit_anchor = $(ANCHOR + '[onclick]');
        var all_anchors = $(ANCHOR);
        var all_inputs = $(INPUT);
        var all_buttons = $(BUTTON);
        var all_spans = $(SPAN);
        var all_selects = $(SELECT);
        var all_textareas = $(TEXTAREA);
        var all_images = $(IMAGES);





        var results = await Promise.all([processTags(INPUT, text_ins, baseURI),
        processTags(INPUT, search_ins, baseURI),
        processTags(INPUT, submit_ins, baseURI),
        processTags(ANCHOR, submit_anchor, baseURI),
        processTags(BUTTON, submit_btns, baseURI),
        processTags(FORM, form_ins, baseURI),
        processTags(INPUT, all_inputs, baseURI),
        processTags(BUTTON, all_buttons, baseURI),
        processTags(ANCHOR, all_anchors, baseURI),
        processTags(SPAN, all_spans, baseURI),
        processTags(SELECT, all_selects, baseURI),
        processTags(INPUT, password_ins, baseURI),
        processTags(TEXTAREA, all_textareas, baseURI),
        processTags(INPUT, text_img, baseURI),
        processTags(IMAGES, all_images, baseURI)]);



        var text_inputs = results[0];
        var search_inputs = results[1];
        var submit_inputs = results[2];
        var submit_anchors = results[3];
        var submit_buttons = results[4];
        var submit_forms = results[5];
        var inputs = results[6];
        var buttons = results[7];
        var anchors = results[8];
        var spans = results[9];
        var selects = results[10];
        var password_inputs = results[11];
        text_inputs = text_inputs.concat(results[12]);
        text_inputs = text_inputs.concat(results[13]);
        var images = results[14];
        var file_links = await getFileLinks(source_url, html);
        var output = {
            'submit_anchors': submit_anchors,
            'search_inputs': search_inputs,
            'text_inputs': text_inputs,
            'password_inputs': password_inputs,
            'submit_inputs': submit_inputs,
            'submit_buttons': submit_buttons,
            'submit_forms': submit_forms,
            'all_inputs': inputs,
            'all_buttons': buttons,
            'all_anchors': anchors,
            'all_spans': spans,
            'all_selects': selects,
            'all_images': images,
            'file_links': file_links
        };
        return output;
    } catch (err) {
        throw err;
    }
}

/**
 * Function returning all relevent Links containing file extensions from source HTML
 * @param {string} source_url 
 * @param {string} html 
 */
var getFileLinks = async (source_url, html) => {
    try {
        $ = cheerio.load(html);
        var baseURI = source_url;
        var base = $('base');
        if (base) {
            var basehref = base.attr('href');
            if (basehref) {
                if (validUrl.isWebUri(basehref))
                    baseURI = basehref;
            }
        }

        var all_anchors = $(ANCHOR);

        var all_spans = $(SPAN);

        var results = await Promise.all([
            processFileTags(ANCHOR, all_anchors, baseURI),
            processFileTags(SPAN, all_spans, baseURI),
        ]);

        var anchors = results[0];
        var spans = results[1];

        var output = anchors.concat(spans);
        return output;
    } catch (err) {
        throw err;
    }
}

/**
 * Returns an array of Link objects
 * 
 * {id, type, name, value, class, outerHTML, link_type, title, baseURI, href}
 * 
 * @param {string} type 
 * @param {array} tags 
 * @param {string} baseURI 
 */
var processTags = async (type, tags, baseURI) => {
    try {
        var length = tags.length;
        if (length > 5000) {
            length = 5000;
        }
        var valid_tags = [];
        for (var i = 0; i < length; i++) {
            var link = new Link();
            if (link.outerHTML.indexOf('mailto') === -1) {
                link.tag_type = type;
                link.baseURI = baseURI;
                var tag = tags[i];
                var tagAttributes = $(tag).attr();
                if (tagAttributes.id)
                    link.id = tagAttributes.id;
                if (tagAttributes.type)
                    link.type = tagAttributes.type;
                if (tagAttributes.title)
                    link.title = tagAttributes.title;
                if (tagAttributes.value)
                    link.value = tagAttributes.value;
                if (tagAttributes.name)
                    link.name = tagAttributes.name;
                if (tagAttributes.class)
                    link.class = tagAttributes.class;
                if (tagAttributes.href) {
                    await link.updateHref(tagAttributes.href, link);
                }
                if (tagAttributes.src) {
                    await link.updateSrc(tagAttributes.src, link);
                }
                link.outerHTML = "'" + $(tag) + "'";
                link.innerHTML = $(tag).html();
                link.updateSelector();
                if (!containsLink(valid_tags, link)) {
                    //  if ((link.href && type === 'a') || type !== 'a') {
                    valid_tags.push(link);
                    //   }

                }
            }
        }
        return valid_tags;
    } catch (err) {
        throw err;
    }
}



/**
 * Returns an array of FileLink objects
 * 
 * {id, type, name, value, class, outerHTML, link_type, title, baseURI, href}
 * 
 * @param {string} type 
 * @param {array} tags 
 * @param {string} baseURI 
 */
var processFileTags = async (type, tags, baseURI) => {
    try {
        var length = tags.length;
        if (length > 5000) {
            length = 5000;
        }
        var valid_tags = [];
        for (var i = 0; i < length; i++) {
            var link = new FileLink();
            if (link.outerHTML.indexOf('mailto') === -1) {
                link.tag_type = type;
                link.baseURI = baseURI;
                var tag = tags[i];
                var tagAttributes = $(tag).attr();
                if (tagAttributes.id)
                    link.id = tagAttributes.id;
                if (tagAttributes.type)
                    link.type = tagAttributes.type;
                if (tagAttributes.title)
                    link.title = tagAttributes.title;
                if (tagAttributes.value)
                    link.value = tagAttributes.value;
                if (tagAttributes.name)
                    link.name = tagAttributes.name;
                if (tagAttributes.class)
                    link.class = tagAttributes.class;
                if (tagAttributes.href) {
                    await link.updateHref(tagAttributes.href, link);
                }
                if (tagAttributes.src) {
                    await link.updateSrc(tagAttributes.src, link);
                }
                link.outerHTML = "'" + $(tag) + "'";
                link.innerHTML = $(tag).html();
                link.updateSelector();
                if (link.validHref && !containsLink(valid_tags, link)) {
                    //  if ((link.href && type === 'a') || type !== 'a') {
                    valid_tags.push(link);
                    //   }

                }
            }
        }
        return valid_tags;
    } catch (err) {
        throw err;
    }
}


/**
 * Returns true or false if the passed in array contains the value.
 * @param {array} list 
 * @param {string} value 
 */
var containsLink = function (list, value) {
    for (var i = 0; i < list.length; i++) {
        if (value.outerHTML === list[i].outerHTML) {
            return true;
        }
    }
    return false;
}

/**
 * Returns inner HTML text for each tag.
 * @param {array} tags 
 */
var getInnerText = (tags) => {
    var text = '';
    for (var i = 0; i < tags.length; i++) {
        var tag = $(tags[i]);
        var html = $(tag).html();
        tag.replaceWith(html);
        text += " " + tag.html();
    }
    return text;
}
/**
 * Returns a text sample form the input HTML of a length equal to the length parameter
 * @param {string} html 
 * @param {numeric} length 
 */
var getTextSample = (html, length) => {
    try {
        if (!length) {
            length = 10000
        }
        $ = cheerio.load(html);
        var textOnly = "";
        textOnly += getInnerText($(DIV));
        if (textOnly.length < length)
            textOnly += getInnerText($(SPAN));
        if (textOnly.length < length)
            textOnly += getInnerText($(PARAGRAPH));
        if (textOnly.length < length)
            textOnly += getInnerText($(ANCHOR));

        textOnly = textOnly.replace(/<\/?[^>]+(>|$)/g, " ");
        textOnly = textOnly.replace(/(?:\r\n|\r|\n|\t)/g, " ");

        textOnly = unescape(textOnly);
        textOnly = textOnly.trim();

        return textOnly;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

var getLanguages = async (html) => {
    var lang_out = [];
    var textSample = getTextSample(html);
    console.info("TEXT SAMPLE", textSample.substring(0, 50));
    if (textSample && textSample !== "") {
      var detected_languages = await franc.all(textSample);
      //example output [['eng',1],['por',.821]]
      for (var i = 0; i < detected_languages.length; i++) {
        var lang = detected_languages[i];
        if (lang_out.length > 2) {
          break;
        }
        var lang_val = lang[0];
        lang_out.push(lang_val);
      }
    }
    if (lang_out.length === 0) {
      lang_out.push('eng');
    }
    return lang_out;
  }



/**
 * Returns Search Specific HTML tags.  
 * Ex.  <input type='search'  
 *      <a href='search.html'
 *      <input type='submit' > search
 * @param {*} tags 
 */
var getSearchInputAndSubmitLinks = function (tags) {

    var search_input = new Link();
    var search_submit = new Link();
    var contains_text_input = false;
    var contains_submit = false;
  
    //get input
    if (tags.search_inputs.length > 0) {
      search_input = tags.search_inputs[0];
      contains_text_input = true;
    } else {
      if (tags.text_inputs.length > 0) {
        search_input = tags.text_inputs[0];
        contains_text_input = true;
      }
    }
  
    //get submit
    if (tags.submit_forms.length > 0) {
      search_submit = tags.submit_forms[0];
      contains_submit = true;
    } else {
      if (tags.submit_inputs.length > 0) {
        search_submit = tags.submit_inputs[0];
        contains_submit = true;
      } else {
        if (tags.submit_buttons.length > 0) {
          search_submit = tags.submit_buttons[0];
          contains_submit = true;
        } else {
          if (tags.submit_anchors.length > 0) {
            search_submit = tags.submit_anchors[0];
            console.log(search_submit);
            contains_submit = true;
          }
        }
      }
    }
  
  
    var output = {
      'contains_input': contains_text_input,
      'contains_submit': contains_submit,
      'text_input': search_input,
      'submit_input': search_submit
    }
    // console.info(output.submit_input);
    return output;
  }

var searchLinkFilter = require('./tag_filters/filter_search_links.js');

module.exports.searchLinks = searchLinkFilter;
module.exports.getAllLinks = getLinks;

module.exports.getSelectLinks = getSelectLinks;
module.exports.getImageLinks = getImageLinks;
module.exports.getAnchors = getAnchors;
module.exports.getSpans = getSpans;
module.exports.getInputs = getInputs;
module.exports.getButtons = getButtons;
module.exports.getSubmitForms = getSubmitForms;
module.exports.getTextSample = getTextSample;
module.exports.getLanguages = getLanguages;
module.exports.getSearchInputAndSubmitLinks = getSearchInputAndSubmitLinks;

module.exports.getFileLinks = getFileLinks;
module.exports.FileLink = FileLink;
module.exports.Link = Link;
var link_extractor = require('../link_extractor.js');



var filter = async (sourceurl, html) => {
    try {
        var all_tags = link_extractor.getAllLinks(sourceurl, html);
        var output = {
            'search_inputs': all_tags.search_inputs,
            'text_inputs': all_tags.text_inputs,
            'submit_inputs': all_tags.submit_inputs,
            'submit_buttons': all_tags.submit_buttons,
            'submit_anchors': all_tags.submit_anchors,
            'submit_forms': all_tags.submit_forms
        };
        return output;
    } catch (err) {
        console.error("Filter Select Links ERROR",err);
        throw err;
    }
}


module.exports.filter = filter;

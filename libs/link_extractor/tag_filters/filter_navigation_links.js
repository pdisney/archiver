var link_extractor = require('../link_extractor.js');




var filter = async (sourceurl, html) => {
    try {
        var all_tags = await link_extractor.getAnchors(sourceurl, html);

        var letter_anchors = [];    //A,B
        var pagination_nav = [];   //NEXT, PREV
        var productgroup_nav = [];   //bestsellers, etc...
        var system_links = [];

        var letterRegex = new RegExp(/^[A-Z|0-9]$/i);

        all_tags.forEach((anchor, i)=>{
            var testHTML = anchor.innerHTML;
            if (letterRegex.test(testHTML)) {
                anchor.pattern = anchor.innerHTML;
                letter_anchors.push(anchor);
            }
            var nav = false;
            if (testHTML.toLowerCase().indexOf('next') !== -1) {
                anchor.pattern = 'next';
                nav = true;
            }
            if (testHTML.toLowerCase().indexOf('prev') !== -1) {
                anchor.pattern = 'prev';
                nav = true;
            }
            if (nav)
                pagination_nav.push(anchor);

            var groupNav = false;
            if (!groupNav && testHTML.toLowerCase().indexOf('bestseller') !== -1) {
                anchor.pattern = 'bestseller';
                groupNav = true;
            }
            if (!groupNav && testHTML.toLowerCase().indexOf('site') !== -1 &&
                testHTML.toLowerCase().indexOf('map') !== -1) {
                anchor.pattern = 'sitemap';
                groupNav = true;
            }
            if (!groupNav && anchor.outerHTML.toLowerCase().indexOf('category') !== -1) {
                anchor.pattern = 'category';
                groupNav = true;
            }
            if (groupNav)
                productgroup_nav.push(anchor);

        });


        var output = {
            'letter_anchors': letter_anchors,
            'pagination_nav': pagination_nav,
            'group_nav': productgroup_nav
        };
        console.info("Navigation Link Search Complete for", sourceurl);
        return output;
    } catch (err) {
        console.error("Filter Navigation Links ERROR",err);
        throw err;
    }
}



module.exports.filter = filter;
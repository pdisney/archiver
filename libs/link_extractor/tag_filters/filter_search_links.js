var link_extractor = require('../link_extractor.js');

/*
<input type="text" 
name="posted_data[substring]" 
size="16" value="" 
style="left:12px; width:157px; height:25px; border:#c0def4 solid 1px; position:absolute; top:12px;">

*/



var filter = async (sourceurl, html) => {
    try {
       // console.info(sourceurl, html.substring(0,100));
        var all_tags = await link_extractor.getAllLinks(sourceurl, html);
       // console.info("ALL TAGS", all_tags);
        var search_inputs = [];
        var text_inputs = [];
        var submit_inputs = [];
        var submit_buttons = [];
        var submit_anchors = [];
        var submit_forms = [];

        for (var i = 0; i < all_tags.search_inputs.length; i++) {
            var input = all_tags.search_inputs[i];
            if (input.outerHTML.toLowerCase().indexOf('placeholder=') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('search') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('keyword') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('Marcador de posición=') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('buscar') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('palabra clave') !== -1) {
                search_inputs.push(input);
            }
        }

        for (var i = 0; i < all_tags.text_inputs.length; i++) {
            var input = all_tags.text_inputs[i];
            if (input.outerHTML.toLowerCase().indexOf('placeholder=') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('search') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('keyword') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('Marcador de posición=') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('buscar') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('palabra clave') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('products') !== -1 ||
                input.id === 'q' ||
                input.name === 'q' ||
                input.id === 's' ||
                input.name === 's') {
                text_inputs.push(input);
            }
        }
        if (text_inputs.length === 0) {
            for (var i = 0; i < all_tags.all_inputs.length; i++) {
                var input = all_tags.all_inputs[i];
                if (input.outerHTML.toLowerCase().indexOf('placeholder=') !== -1 ||
                    input.outerHTML.toLowerCase().indexOf('search') !== -1 ||
                    input.outerHTML.toLowerCase().indexOf('keyword') !== -1 ||
                    input.outerHTML.toLowerCase().indexOf('Marcador de posición=') !== -1 ||
                    input.outerHTML.toLowerCase().indexOf('buscar') !== -1 ||
                    input.outerHTML.toLowerCase().indexOf('palabra clave') !== -1 ||
                    input.outerHTML.toLowerCase().indexOf('products') !== -1 ||
                    input.id === 'q' ||
                    input.name === 'q' ||
                    input.id === 's' ||
                    input.name === 's' ||
                    input.outerHTML.toLowerCase().indexOf('data[') !== -1) {
                    text_inputs.push(input);
                }
            }
        }

        for (var i = 0; i < all_tags.submit_inputs.length; i++) {
            var input = all_tags.submit_inputs[i];
            if (input.outerHTML.toLowerCase().indexOf('search') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('find') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('go') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('query') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('quick') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('buscar') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('encontrar') !== -1) {
                submit_inputs.push(input);
            }
        }

        for (var i = 0; i < all_tags.all_buttons.length; i++) {
            var input = all_tags.all_buttons[i];
            if (input.outerHTML.toLowerCase().indexOf('search') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('find') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('quick') !== -1) {
                submit_inputs.push(input);
            }
        }

        for (var i = 0; i < all_tags.submit_buttons.length; i++) {
            var input = all_tags.submit_buttons[i];
            if (input.outerHTML.toLowerCase().indexOf('search') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('find') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('quick') !== -1) {
                submit_inputs.push(input);
            }
        }

        for (var i = 0; i < all_tags.submit_anchors.length; i++) {
            var input = all_tags.submit_anchors[i];
            if (input.outerHTML.toLowerCase().indexOf('search') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('find') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('quick') !== -1) {
                submit_inputs.push(input);
            }
        }

        for (var i = 0; i < all_tags.submit_forms.length; i++) {
            var form = all_tags.submit_forms[i];
            if (form.outerHTML.toLowerCase().indexOf('search') !== -1 ||
                form.outerHTML.toLowerCase().indexOf('find') !== -1 ||
                form.outerHTML.toLowerCase().indexOf('quick') !== -1) {
                submit_forms.push(form);
            }
        }



        for (var i = 0; i < all_tags.all_anchors.length; i++) {
            var input = all_tags.all_anchors[i];
            if (input.outerHTML.toLowerCase().indexOf('search') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('find') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('quick') !== -1) {
                submit_anchors.push(input);
            }
        }


        // console.info("text inputs" + JSON.stringify(text_inputs));
        //console.info("submit_inputs" + JSON.stringify(submit_inputs));

        var output = {
            'search_inputs': search_inputs,
            'text_inputs': text_inputs,
            'submit_inputs': submit_inputs,
            'submit_buttons': submit_buttons,
            'submit_anchors': submit_anchors,
            'submit_forms': submit_forms
        };

        return output;
    } catch (err) {
        console.error("Filter Search Links ERROR",err);
        throw err;
    }
}


module.exports.filter = filter;
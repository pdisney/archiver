var link_extractor = require('../link_extractor.js');


var filter = async (sourceurl, html) => {
    try {
        var all_tags = await link_extractor.getAllLinks(sourceurl, html);
        var output = {};
        var username = [];
        var password = all_tags.password_inputs;
        var login = [];
      
        
        for (var i = 0; i < all_tags.text_inputs.length; i++) {
            var input = all_tags.text_inputs[i];
            if (input.outerHTML.toLowerCase().indexOf('user') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('username') !== -1
            ) {
                username.push(input);
            }
        }
        for (var i = 0; i < all_tags.submit_inputs.length; i++) {
            var input = all_tags.submit_inputs[i];
            if (input.outerHTML.toLowerCase().indexOf('sign-in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('signin') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('sign in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('log in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('log-in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('login') !== -1
            ) {
                login.push(input);
            }
        }
        for (var i = 0; i < all_tags.submit_anchors.length; i++) {
            var input = all_tags.submit_anchors[i];
            if (input.outerHTML.toLowerCase().indexOf('sign-in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('signin') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('sign in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('log in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('log-in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('login') !== -1
            ) {
                login.push(input);
            }
        }
        for (var i = 0; i < all_tags.submit_buttons.length; i++) {
            var input = all_tags.submit_buttons[i];
            if (input.outerHTML.toLowerCase().indexOf('sign-in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('signin') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('sign in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('log in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('log-in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('login') !== -1
            ) {
                login.push(input);
            }
        }
        for (var i = 0; i < all_tags.submit_forms.length; i++) {
            var input = all_tags.submit_forms[i];
            if (input.outerHTML.toLowerCase().indexOf('sign-in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('signin') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('sign in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('log in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('log-in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('login') !== -1
            ) {
                login.push(input);
            }
        }
        for (var i = 0; i < all_tags.all_inputs.length; i++) {
            var input = all_tags.all_inputs[i];
            if (input.outerHTML.toLowerCase().indexOf('sign-in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('signin') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('sign in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('log in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('log-in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('login') !== -1
            ) {
                login.push(input);
            }
        }
        for (var i = 0; i < all_tags.all_anchors.length; i++) {
            var input = all_tags.all_anchors[i];
            if (input.outerHTML.toLowerCase().indexOf('sign-in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('signin') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('sign in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('log in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('log-in') !== -1 ||
                input.outerHTML.toLowerCase().indexOf('login') !== -1
            ) {
                login.push(input);
            }
        }
        output.login = login;
        output.password = password;
        output.username = username;
       
        return output;
    } catch (err) {
        console.error("Filter Login Links ERROR",err);
        throw err;
    }
}


module.exports.filter = filter;

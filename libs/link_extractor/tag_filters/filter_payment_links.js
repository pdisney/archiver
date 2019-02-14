
var URL = require('url');
var link_extractor = require('../link_extractor.js');
var common = require('common');

var containsBuyKeyword = function (link, buy_patterns) {
	for (var i = 0; i < buy_patterns.length; i++) {
		var payment_pattern = JSON.parse(buy_patterns[i]);
		if (link.outerHTML.toLowerCase().indexOf(payment_pattern.pattern) !== -1) {
			link.pattern = payment_pattern;
			return true;
		}
	}
	return false;
}
var containsAddKeyword = function (link, add_patterns) {
	for (var i = 0; i < add_patterns.length; i++) {
		var payment_pattern = JSON.parse(add_patterns[i]);
		if (link.outerHTML.toLowerCase().indexOf(payment_pattern.pattern) !== -1) {
			link.pattern = payment_pattern;
			return true;
		}
	}
	return false;
}
var containsCartKeyword = function (link, cart_patterns) {
	for (var i = 0; i < cart_patterns.length; i++) {
		var payment_pattern = JSON.parse(cart_patterns[i]);
		if (link.outerHTML.toLowerCase().indexOf(payment_pattern.pattern) !== -1) {
			link.pattern = payment_pattern;
			return true;
		}
	}
	return false;
}
var containsBasketKeyword = function (link, basket_patterns) {
	for (var i = 0; i < basket_patterns.length; i++) {
		var payment_pattern = JSON.parse(basket_patterns[i]);
		if (link.outerHTML.toLowerCase().indexOf(payment_pattern.pattern) !== -1) {
			link.pattern = payment_pattern;
			return true;
		}
	}
	return false;
}
var containsCheckoutKeyword = function (link, checkout_patterns) {
	for (var i = 0; i < checkout_patterns.length; i++) {
		var payment_pattern = JSON.parse(checkout_patterns[i]);
		if (link.outerHTML.toLowerCase().indexOf(payment_pattern.pattern) !== -1) {
			link.pattern = payment_pattern;
			return true;
		}
	}
	return false;
}

var containsAllBuyKeyword = function (link, allbuy_patterns) {
	for (var i = 0; i < allbuy_patterns.length; i++) {
		var payment_pattern = JSON.parse(allbuy_patterns[i]);
		if (link.outerHTML.toLowerCase().indexOf(payment_pattern.pattern) !== -1) {
			link.pattern = payment_pattern;
			return true;
		}
	}
	return false;
}
var containsAllOrderKeyword = function (link, allorder_patterns) {
	for (var i = 0; i < allorder_patterns.length; i++) {
		var payment_pattern = JSON.parse(allorder_patterns[i]);
		if (link.outerHTML.toLowerCase().indexOf(payment_pattern.pattern) !== -1) {
			link.pattern = payment_pattern;
			return true;
		}
	}
	return false;
}
var containsAllGeneralKeyword = function (link, allgeneral_patterns) {
	for (var i = 0; i < allgeneral_patterns.length; i++) {
		var payment_pattern = JSON.parse(allgeneral_patterns[i]);
		if (link.outerHTML.toLowerCase().indexOf(payment_pattern.pattern) !== -1) {
			link.pattern = payment_pattern;
			return true;
		}
	}
	return false;
}


var containsLink = function (list, link) {
	for (var i = 0; i < list.length; i++) {
		if (link.outerHTML.toLowerCase() === list[i].outerHTML.toLowerCase() ||
			link.href.toLowerCase() === list[i].href.toLowerCase()) {
			return true;
		}
	}
	return false;
}

var getLinkTypes = function (tagList, selectedLinks, patternList) {

	for (var i = 0; i < tagList.length; i++) {
		var link = tagList[i];
		if (containsBuyKeyword(link, patternList.buy_patterns)) {
			selectedLinks.buy.push(link);
		}
		if (containsAddKeyword(link, patternList.add_patterns)) {
			selectedLinks.add.push(link);
		}
		if (containsCartKeyword(link, patternList.cart_patterns)) {
			selectedLinks.cart.push(link);
		}
		if (containsBasketKeyword(link, patternList.basket_patterns)) {
			selectedLinks.basket.push(link);
		}
		if (containsCheckoutKeyword(link, patternList.checkout_patterns)) {
			selectedLinks.checkout.push(link);
		}
		if (containsAllBuyKeyword(link, patternList.allbuy_patterns)) {
			selectedLinks.allbuy.push(link);
		}
		if (containsAllOrderKeyword(link, patternList.allorder_patterns)) {
			selectedLinks.allorder.push(link);
		}
		if (containsAllGeneralKeyword(link, patternList.allgeneral_patterns)) {
			selectedLinks.allgeneral.push(link);
		}
	}
}


var filterLinks = async (url, html, patternList) => {
	try {
		var selectedLinks = {
			buy: [],
			add: [],
			cart: [],
			basket: [],
			checkout: [],
			allbuy: [],
			allorder: [],
			allgeneral: []
		};

		var anchors = await link_extractor.getAnchors(url, html);
		var inputs = await link_extractor.getInputs(url, html);
		var buttons = await link_extractor.getButtons(url, html);
		var forms = await link_extractor.getSubmitForms(url, html);

		getLinkTypes(anchors, selectedLinks, patternList);
		getLinkTypes(inputs, selectedLinks, patternList);
		getLinkTypes(buttons, selectedLinks, patternList);
		getLinkTypes(forms, selectedLinks, patternList);

		return selectedLinks;
	} catch (err) {
		console.error(err);
		throw err;
	}
}



function PaymentLinkFilter() {
	return new Promise((resolve, reject) => {
		init().then(results => {
			console.info("Payment Link Filter Initialized");
			return resolve(this);
		}).catch(err => {
			console.error("Error Initializing Payment Link Filter:", err);
			return reject(err);
		});
	});
}

var filter = async (sourceUrl, html) => {
	try {
		var patternList = {};

		var buy = await common.Cache.getKeywordBuyPatterns();
		var add = await common.Cache.getKeywordAddPatterns();
		var cart = await common.Cache.getKeywordCartPatterns();
		var basket = await common.Cache.getKeywordBasketPatterns();
		var checkout = await common.Cache.getKeywordCheckoutPatterns();
		var allbuy = await common.Cache.getKeywordAllBuyPatterns();
		var allorder = await common.Cache.getKeywordAllOrderPatterns();
		var allgeneral = await common.Cache.getKeywordAllGeneralPatterns();

		patternList.buy_patterns = buy;
		patternList.add_patterns = add;
		patternList.cart_patterns = cart;
		patternList.basket_patterns = basket;
		patternList.checkout_patterns = checkout;
		patternList.allbuy_patterns = allbuy;
		patternList.allorder_patterns = allorder;
		patternList.allgeneral_patterns = allgeneral;

		var filteredLinks = await filterLinks(sourceUrl, html, patternList);

		return filteredLinks;
	} catch (err) {
		console.error("Filter Payment Links ERROR", err);
		throw err;
	}
}

module.exports.filter = filter;












/*






var URL = require('url');
var async = require('async');
var process_helper = require("./common/process_helper.js");
var link_retrieve_select = require('./link_retrieve_select.js');


var init = function (callback) {
	link_retrieve_select.init(callback);
}

var containsProduct = function (attribute_value) {
	console.debug("PRODUCT CHECK" + attribute_value);
	for (var i = 0; i < link_retrieve_select.get_link_extractor().product_patterns.length; i++) {
		var product = link_retrieve_select.get_link_extractor().product_patterns[i];
		if (attribute_value.toLowerCase().indexOf(product.pattern.toLowerCase()) !== -1) {
			console.debug("----------PRODUCT FOUND------------" + attribute_value + '  ' + product.pattern);
			return true;
		}
	}
	console.debug("PRODUCT CHECK+return false");
	return false;
}

var containsBuyKeyword = function (attribute_value) {
	for (var i = 0; i < link_retrieve_select.get_link_extractor().buy_payment_patterns.length; i++) {
		var buy_payment_patterns = link_retrieve_select.get_link_extractor().buy_payment_patterns[i];
		if (attribute_value.toLowerCase().indexOf(buy_payment_patterns.pattern) !== -1) {
			return true;
		}
	}
	return false;
}

var containsSecondaryBuyKeyword = function (attribute_value) {

	for (var i = 0; i < link_retrieve_select.get_link_extractor().buy_payment_secondary_patterns.length; i++) {
		var buy_payment_secondary_patterns = link_retrieve_select.get_link_extractor().buy_payment_secondary_patterns[i];
		if (attribute_value.toLowerCase().indexOf(buy_payment_secondary_patterns.pattern) !== -1) {
			return true;
		}
	}
	return false;
}

var containsAddCartKeyword = function (attribute_value) {
	for (var i = 0; i < link_retrieve_select.get_link_extractor().add_cart_payment_patterns.length; i++) {
		var add_cart_payment_patterns = link_retrieve_select.get_link_extractor().add_cart_payment_patterns[i];
		if (attribute_value.toLowerCase().indexOf(add_cart_payment_patterns.pattern) !== -1) {
			return true;
		}
	}
	return false;
}
var containsCartKeyword = function (attribute_value) {
	for (var i = 0; i < link_retrieve_select.get_link_extractor().cart_payment_patterns.length; i++) {
		var cart_payment_patterns = link_retrieve_select.get_link_extractor().cart_payment_patterns[i];
		if (attribute_value.toLowerCase().indexOf(cart_payment_patterns.pattern) !== -1) {
			return true;
		}
	}
	return false;
}
var containsBasketKeyword = function (attribute_value) {
	for (var i = 0; i < link_retrieve_select.get_link_extractor().basket_payment_patterns.length; i++) {
		var basket_payment_patterns = link_retrieve_select.get_link_extractor().basket_payment_patterns[i];
		if (attribute_value.toLowerCase().indexOf(basket_payment_patterns.pattern) !== -1) {
			return true;
		}
	}
	return false;
}
var containsCheckoutKeyword = function (attribute_value) {
	for (var i = 0; i < link_retrieve_select.get_link_extractor().checkout_payment_patterns.length; i++) {
		var checkout_payment_patterns = link_retrieve_select.get_link_extractor().checkout_payment_patterns[i];
		if (attribute_value.toLowerCase().indexOf(checkout_payment_patterns.pattern) !== -1) {
			return true;
		}
	}
	return false;
}

var addProductBuyLink = function (productBuyLinks, outerHTML, link) {
	var containProduct = containsProduct(outerHTML);
	var containBuyKeyword = containsBuyKeyword(outerHTML);
	var containSecondaryBuyKeyword = containsSecondaryBuyKeyword(outerHTML);
	if (containProduct || containBuyKeyword) {
		productBuyLinks.push({ 'link': link, 'containsProduct': containProduct, 'containsBuyKeyword': containBuyKeyword, 'containsSecondaryBuyKeyword': containSecondaryBuyKeyword });
	}
}

var addAddCartLink = function (addCartLinks, outerHTML, link) {
	var containProduct = containsProduct(outerHTML);
	var containAddCartKeyword = containsAddCartKeyword(outerHTML);
	var containCartKeyword = containsCartKeyword(outerHTML);
	var containBasketKeyword = containsBasketKeyword(outerHTML);
	if (containProduct || containAddCartKeyword || containCartKeyword || containBasketKeyword) {
		addCartLinks.push({
			'link': link,
			'containsProduct': containProduct,
			'containsAddCartKeyword': containAddCartKeyword,
			'containsCartKeyword': containCartKeyword,
			'containsBasketKeyword': containBasketKeyword
		});
	}
}

var addCheckoutLink = function (checkoutLinks, outerHTML, link) {
	var containCheckoutKeyword = containsCheckoutKeyword(outerHTML);
	var containCartKeyword = containsCartKeyword(outerHTML);
	if (containCheckoutKeyword) {
		checkoutLinks.push({ 'link': link, 'containsCheckoutKeyword': containCheckoutKeyword, 'containsCartKeyword': containCartKeyword });
	}
}



var filterLinks = function (all_links) {
	var productBuyLinks = [];
	var addCartLinks = [];
	var checkoutLinks = [];

	for (var i = 0; i < all_links.anchors.length; i++) {
		var link = all_links.anchors[i];
		var outerHTML = link.outerHTML;
		var anchor_uri = URL.parse(link.href);

		//replace hostname if it presents a false positive
		if (anchor_uri.hostname !== null) {
			if (containsBuyKeyword(anchor_uri.hostname)) {
				outerHTML = outerHTML.replace(new RegExp(anchor_uri.hostname, 'g'), 'test.com');
			}
			if (containsProduct(anchor_uri.hostname)) {
				outerHTML = outerHTML.replace(new RegExp(anchor_uri.hostname, 'g'), 'test.com');
			}
		}

		addProductBuyLink(productBuyLinks, outerHTML, link);
		addAddCartLink(addCartLinks, outerHTML, link);
		addCheckoutLink(checkoutLinks, outerHTML, link);
	}

	for (var i = 0; i < all_links.inputs.length; i++) {
		var link = all_links.inputs[i];
		var outerHTML = link.outerHTML;
		addProductBuyLink(productBuyLinks, outerHTML, link);
		addAddCartLink(addCartLinks, outerHTML, link);
		addCheckoutLink(checkoutLinks, outerHTML, link);
	}

	for (var i = 0; i < all_links.buttons.length; i++) {
		var link = all_links.buttons[i];
		var outerHTML = link.outerHTML;
		addProductBuyLink(productBuyLinks, outerHTML, link);
		addAddCartLink(addCartLinks, outerHTML, link);
		addCheckoutLink(checkoutLinks, outerHTML, link);
	}

	return { 'productBuyLinks': productBuyLinks, 'addCartLinks': addCartLinks, 'checkoutLinks': checkoutLinks };
}



var returnPrioritizedLinks = function (domainInfo, all_links, documentURL, attempt, callback) {
	var filteredLinks = filterLinks(all_links);
	var productBuyLinks = filteredLinks.productBuyLinks;
	var addCartLinks = filteredLinks.addCartLinks;
	var checkoutLinks = filteredLinks.checkoutLinks;

	console.info("FILTERED PRODUCT LINKS: " + productBuyLinks.length);
	console.info("FILTERED CART LINKS: " + addCartLinks.length);
	console.info("FILTERED CHECKOUT LINKS: " + checkoutLinks.length);

	//prioritize links

	async.parallel([
		function (callback) {
			var selectedLinks = [];
			async.each(checkoutLinks, function (link, next) {
				var selected_link = { 'link': "", 'containsLink': false, 'selector': "" };
				if (!link.containsCartKeyword) {
					selected_link.link = link.link;
					selected_link.containsLink = true;
					selected_link.selector = link_retrieve_select.getSelector(link.link);
					selectedLinks.push(selected_link);
				}
				next();
			}, function (err) {
				if (selectedLinks.length === 0) {
					async.each(checkoutLinks, function (link, next) {
						var selected_link = { 'link': "", 'containsLink': false, 'selector': "" };
						selected_link.link = link.link;
						selected_link.containsLink = true;
						selected_link.selector = link_retrieve_select.getSelector(link.link);
						selectedLinks.push(selected_link);
						next();
					}, function (err) {
						callback(null, selectedLinks);
					});
				} else {
					callback(null, selectedLinks);
				}
			});
		},
		function (callback) {
			var selectedLinks = [];
			async.each(addCartLinks, function (link, next) {
				var selected_link = { 'link': "", 'containsLink': false, 'selector': "" };
				if (link.containsAddCartKeyword && link.containsProduct) {
					selected_link.link = link.link;
					selected_link.containsLink = true;
					selected_link.selector = link_retrieve_select.getSelector(link.link);
					selectedLinks.push(selected_link);
				}
				next();
			}, function (err) {
				if (selectedLinks.length === 0) {
					async.each(addCartLinks, function (link, next) {
						var selected_link = { 'link': "", 'containsLink': false, 'selector': "" };
						if (link.containsAddCartKeyword) {
							selected_link.link = link.link;
							selected_link.containsLink = true;
							selected_link.selector = link_retrieve_select.getSelector(link.link);
							selectedLinks.push(selected_link);
						}
						next();
					}, function (err) {
						callback(null, selectedLinks);
					});
				} else {
					callback(null, selectedLinks);
				}
			});
		}, function (callback) {
			var selectedLinks = [];
			async.each(productBuyLinks, function (link, next) {
				var selected_link = { 'link': "", 'containsLink': false, 'selector': "" };
				if (link.containsProduct && link.containsBuyKeyword) {
					console.debug("---------PRODUCT BUY LINK && EVAL------------" + JSON.stringify(link));
					selected_link.link = link.link;
					selected_link.containsLink = true;
					selected_link.selector = link_retrieve_select.getSelector(link.link);
					selectedLinks.push(selected_link);
				}
				next();
			}, function (err) {
				if (selectedLinks.length === 0) {
					async.each(productBuyLinks, function (link, next) {
						var selected_link = { 'link': "", 'containsLink': false, 'selector': "" };
						if (link.containsProduct && link.containsSecondaryBuyKeyword) {
							console.debug("---------PRODUCT BUY LINK || EVAL------------" + JSON.stringify(link));
							selected_link.link = link.link;
							selected_link.containsLink = true;
							selected_link.selector = link_retrieve_select.getSelector(link.link);
							selectedLinks.push(selected_link);
						}
						next();
					}, function (err) {
						if (selectedLinks.length === 0) {
							async.each(productBuyLinks, function (link, next) {
								var selected_link = { 'link': "", 'containsLink': false, 'selector': "" };
								if (link.containsProduct || link.containsBuyKeyword || link.containsSecondaryBuyKeyword) {
									console.debug("---------PRODUCT BUY LINK || EVAL------------" + JSON.stringify(link));
									selected_link.link = link.link;
									selected_link.containsLink = true;
									selected_link.selector = link_retrieve_select.getSelector(link.link);
									selectedLinks.push(selected_link);
								}
								next();
							}, function (err) {
								callback(null, selectedLinks);
							});
						} else {
							callback(null, selectedLinks);
						}
					});
				} else {
					callback(null, selectedLinks);
				}
			});
		},
		function (callback) {
			var selectedLinks = [];
			async.each(addCartLinks, function (link, next) {
				var selected_link = { 'link': "", 'containsLink': false, 'selector': "" };
				if (link.containsProduct && (link.containsCartKeyword || link.containsBasketKeyword)) {
					selected_link.link = link.link;
					selected_link.containsLink = true;
					selected_link.selector = link_retrieve_select.getSelector(link.link);
					selectedLinks.push(selected_link);
				}
				next();
			}, function (err) {
				if (selectedLinks.length === 0) {
					async.each(addCartLinks, function (link, next) {
						var selected_link = { 'link': "", 'containsLink': false, 'selector': "" };
						if (link.containsProduct) {
							selected_link.link = link.link;
							selected_link.containsLink = true;
							selected_link.selector = link_retrieve_select.getSelector(link.link);
							selectedLinks.push(selected_link);
						}
						next();
					}, function (err) {
						if (selectedLinks.length === 0) {
							async.each(addCartLinks, function (link, next) {
								var selected_link = { 'link': "", 'containsLink': false, 'selector': "" };
								if (link.containsCartKeyword) {
									selected_link.link = link.link;
									selected_link.containsLink = true;
									selected_link.selector = link_retrieve_select.getSelector(link.link);
									selectedLinks.push(selected_link);
								}
								next();
							}, function (err) {
								callback(null, selectedLinks);
							});
						} else {
							callback(null, selectedLinks);
						}
					});
				} else {
					callback(null, selectedLinks);
				}
			});
		}
	], function (err, results) {
		var selected_checkout_links = results[0];
		var addcart_checkout_links = results[1];
		var productbuy_checkout_links = results[2];
		var cart_checkout_links = results[3];
		link_retrieve_select.getLink(domainInfo, selected_checkout_links, 'payment', function (err, selected_link) {
			if (!selected_link.containsLink || attempt === 1) {
				link_retrieve_select.getLink(domainInfo, addcart_checkout_links, 'payment', function (err, selected_link) {
					if (!selected_link.containsLink) {
						link_retrieve_select.getLink(domainInfo, productbuy_checkout_links, 'payment', function (err, selected_link) {
							if (!selected_link.containsLink) {
								link_retrieve_select.getLink(domainInfo, cart_checkout_links, 'payment', function (err, selected_link) {
									callback(null, selected_link);
								});
							} else {
								callback(null, selected_link);
							}
						});
					} else {
						callback(null, selected_link);
					}
				});
			} else {

				callback(null, selected_link);
			}
		});

	});


}

var getPrioritizedSelector = function (domainInfo, documentURL, html, attempt) {
	return new Promise(function (result, reject) {
		var all_links = link_retrieve_select.getAllTags(documentURL, html, attempt);
		returnPrioritizedLinks(domainInfo, all_links, documentURL, attempt, function (err, selector) {
			return result(selector);
		});
	});
}

var containsLinkFilters = function (value) {
	return link_retrieve_select.containsLinkFilters(value);
}

module.exports.containsLinkFilters = containsLinkFilters;
module.exports.init = init;
module.exports.getPrioritizedSelector = getPrioritizedSelector;
*/
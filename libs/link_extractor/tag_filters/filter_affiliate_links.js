var URL = require('url');
var link_extractor = require('../link_extractor.js');
var common = require('common');




var containsAffiliateKeyword = function (link, affiliate_patterns) {
	for (var i = 0; i < affiliate_patterns.length; i++) {
		var affiliate_pattern = JSON.parse(affiliate_patterns[i]);
		if (link.outerHTML.toLowerCase().indexOf(affiliate_pattern.pattern) !== -1) {
			link.pattern = affiliate_pattern;
			return true;
		}
	}
	return false;
}

var containsContactKeyword = function (link, contact_patterns) {
	for (var i = 0; i < contact_patterns.length; i++) {
		var contact_pattern = JSON.parse(contact_patterns[i]);
		if (link.outerHTML.toLowerCase().indexOf(contact_pattern.pattern) !== -1) {
			link.pattern = contact_pattern;
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

var getLinkTypes = function (tagList, selectedLinks, affiliate_patterns, contact_patterns) {
	for (var i = 0; i < tagList.length; i++) {
		var link = tagList[i];
		if (containsAffiliateKeyword(link, affiliate_patterns)) {
			if (!containsLink(selectedLinks, link)) {
				selectedLinks.affiliate.push(link);
			}
		}
		if (containsContactKeyword(link, contact_patterns)) {
			if (!containsLink(selectedLinks, link)) {
				selectedLinks.contact.push(link);
			}
		}
	}
}


var filterLinks = async (url, html, affiliate_patterns, contact_patterns) => {
	try {
		var selectedLinks = { affiliate: [], contact: [] };

		var anchors = await link_extractor.getAnchors(url, html);
		var inputs = await link_extractor.getInputs(url, html);
		var buttons = await link_extractor.getButtons(url, html);
		getLinkTypes(anchors, selectedLinks, affiliate_patterns, contact_patterns);
		getLinkTypes(inputs, selectedLinks, affiliate_patterns, contact_patterns);
		getLinkTypes(buttons, selectedLinks, affiliate_patterns, contact_patterns);
		return selectedLinks;
	} catch (err) {
		console.error("Filter Affiliate Links ERROR", err);
		throw err;
	}
}


function AffiliateLinkFilter() {
	return new Promise((resolve, reject) => {
		init().then(results => {
			console.info("Affliate Link Filter Initialized");
			return resolve(this);
		}).catch(err => {
			console.error("Error Initializing Affliate Link Filter:", err);
			return reject(err);
		});
	});
}

var filter = async (sourceUrl, html) => {
	try {
		var affiliate_patterns = await common.Cache.getKeywordAffiliatePatterns();
		var contact_patterns = await common.Cache.getKeywordContactPatterns();

		var filteredLinks = await filterLinks(sourceUrl, html, affiliate_patterns, contact_patterns);
		return filteredLinks;
	} catch (err) {
		console.error("Filter Affiliate Links ERROR",err);
		throw err;
	}
}


module.exports.filter = filter;



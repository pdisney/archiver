
var URL = require('url');
var link_extractor = require('../link_extractor.js');
var common = require('common');





var containsChatKeyword = function (link, chat_patterns) {
	for (var i = 0; i < chat_patterns.length; i++) {
		var chat_pattern = JSON.parse(chat_patterns[i]);
		if (link.outerHTML.toLowerCase().indexOf(chat_pattern.pattern) !== -1) {
			link.pattern = chat_pattern;
			return true;
		}
	}
	return false;
}

var containsSystemKeyword = function (link, system_patterns) {
	for (var i = 0; i < system_patterns.length; i++) {
		var sys_pattern = JSON.parse(system_patterns[i]);
		if (link.outerHTML.toLowerCase().indexOf(sys_pattern.pattern) !== -1) {
			link.pattern = sys_pattern;
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
		if (containsChatKeyword(link, patternList.chat_patterns)) {
			if (!containsLink(selectedLinks, link)) {
				selectedLinks.chat.push(link);
			}
		}
		if (containsSystemKeyword(link, patternList.system_patterns)) {
			if (!containsLink(selectedLinks, link)) {
				selectedLinks.system.push(link);
			}
		}

	}
}



var filterLinks = async (url, html, patternList) => {
	try {
		var selectedLinks = { chat: [], system: [] };

		var anchors = await link_extractor.getAnchors(url, html);
		var inputs = await link_extractor.getInputs(url, html);
		var buttons = await link_extractor.getButtons(url, html);
		getLinkTypes(anchors, selectedLinks, patternList);
		getLinkTypes(inputs, selectedLinks, patternList);
		getLinkTypes(buttons, selectedLinks, patternList);
		return selectedLinks;
	} catch (err) {
		console.error("Filter Chat Links ERROR", err);
		throw err;
	}
}




var filter = async (sourceUrl, html) => {
	try {
		var patternList = {};
		patternList.chat_patterns = await common.Cache.getKeywordChatPatterns();
		patternList.system_patterns = await common.Cache.getKeywordSystemPatterns();


		var filteredLinks = await filterLinks(sourceUrl, html, patternList);
		return filteredLinks;
	} catch (err) {
		console.error("Filter Chat Links ERROR", err);
		throw err;
	}

}


module.exports.filter = filter;








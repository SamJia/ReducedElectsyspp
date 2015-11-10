function getDomainFromUrl(url) {
	if (typeof url == "undefined" || null == url)
		return "null";
	var host = "null";
	var regex = /.*\:\/\/(.*?)\/.*/;
	var match = url.match(regex);
	if (typeof match != "undefined" && null != match)
		host = match[1];
	return host;
}

function checkForValidUrl(tabId, changeInfo, tab) {
	if (changeInfo.status == "complete") {
		if (getDomainFromUrl(tab.url).toLowerCase() == "electsys.sjtu.edu.cn") {
			chrome.pageAction.show(tabId);
		}
	}
};


chrome.tabs.onUpdated.addListener(checkForValidUrl);
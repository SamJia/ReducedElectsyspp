jQuery.get(
	chrome.extension.getURL("manifest.json"),
	function(data){
		document.getElementById("version_span").innerHTML = data["version"];
	},
	"json"
);

// document.addEventListener('DOMContentLoaded', function(){
// 	// var version = null;
// 	// document.getElementById("version_span").innerHTML=version;
// });
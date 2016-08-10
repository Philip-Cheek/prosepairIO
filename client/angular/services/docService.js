angular.module('prosePair').service('docService', function(){

	var service = {};

	service.enableHighlightTracking = function(callback){
		function passHighlight(){
			callback(trackHighlight())
		}

		document.onmouseup = passHighlight;
		document.onkeyup = passHighlight;
	}

	service.disableHighlightTracking = function(){
		document.onmouseup = null;
		document.onkeyup = null;
	}

	function trackHighlight(){
		var highlightText = '';

		if (typeof window.getSelection != "undefined") {
            highlightText = window.getSelection().toString();
        } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
            highlightText = document.selection.createRange().text;
        }
        
        console.log('HIGHLIGHT TEXT', highlightText)
        return highlightText;
	}

	return service;
});
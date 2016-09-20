angular.module('prosePair').service('docService', function(){

	var service = {};
	var timers = {};

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

	service.docTitleExclaim = function(eBool){
		var exclaim = "(!)"
		var currentTitle = document.title;

		if (!eBool && currentTitle.length > exclaim.length && currentTitle.substring(0,exclaim.length) == exclaim){
			document.title = currentTitle.substring(exclaim.length + 1, currentTitle.length);
		}else if (eBool && currentTitle.length > exclaim.length && currentTitle.substring(0,exclaim.length) != exclaim){
			document.title = exclaim + " " + currentTitle;
		}
	}

	service.scrollToBottom = function(divID){
		var div = document.getElementById(divID);

		if (div.offsetHeight >= div.scrollHeight){
			return;
		}

		var height = div.scrollHeight

		if ('scroll' in timers){
			clearInterval(timers.scroll);
			delete timers.scroll;
		}

		timers.scroll = setInterval(function(){
			var change = div.scrollTop + 2;
			if (change >= height){
				div.scrollTop = height;
				clearInterval(timers.scroll);
				delete timers.scroll;
			}else{
				div.scrollTop = change;
			}
		}, 17);
	}

	service.adjustDOM = function(id, nStyle, value){
		document.getElementById(id).style[nStyle] = value;
	}

	function trackHighlight(){
		var highlightText = '';

		if (typeof window.getSelection != "undefined") {
            highlightText = window.getSelection().toString();
        } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
            highlightText = document.selection.createRange().text;
        }
        
        return highlightText;
	}

	return service;
});
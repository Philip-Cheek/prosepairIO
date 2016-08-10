angular.module('prosePair').service('docService', function(){

	var service = {};

	service.enableHighlightTracking = function(callback){

		var highlightText = '';

		function gText(e){
			highlightText = (document.all) ? document.selection.createRange().text : document.getSelection();
			callback(highlightText);
		}

		document.onmouseup = gText;

		if (!document.all){
			document.captureEvents(Event.MOUSEUP);
		}
	}

	service.disableHighlightTracking = function(){
		document.onmouseup = null;
	}

	return service;
});
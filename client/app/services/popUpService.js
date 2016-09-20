angular.module('prosePair').service('popUpService', function(){

	var modal = {
		'status': false
	}

	var service = {};

	service.getContent = function(){
		if ('content' in modal){
			return modal.content;
		}
	}
	service.showDialog = function(info){
		var infoModal = info;
		infoModal.status = true;
		modal = infoModal;
	}

	service.closeModal = function(callback){
		var modal = {
			'status': false
		}

		callback();
	}

	service.showOmniModal = function(){
		return modal;
	}

	return service;
});
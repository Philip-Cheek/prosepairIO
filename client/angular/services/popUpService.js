angular.module('prosePair').service('popUpService', function(){

	var modal = {
		'status': false
	}

	var service = {};

	service.showDialog = function(info){
		console.log('dialog called!', info)
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
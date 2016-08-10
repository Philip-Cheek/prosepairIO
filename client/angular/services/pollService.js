angular.module('prosePair').service('pollService', function(){

	var pollTimer;
	var currentPoll;
	var timeLeft;
	var service = {};

	service.setCurrentPoll = function(current){
		currentPoll = current;
	}

	service.showCurrentPoll = function(){
		return currentPoll
	}


	service.handlePollResult = function(confirm, callback){

		var tempPoll = currentPoll;
		currentPoll = "";

		
		if (confirm){

 			if (tempPoll == 'title'){
 				callback(confirmTitle());
 			}

 		}else{

 			if (tempPoll == 'title'){
 				console.log('we should reject title');
	 			callback(rejectTitle());

	 		}else if (tempPoll == 'fin'){
	 			console.log('we should reject fin');
	 			callback(rejectFin());
	 		}

 		}
	}

	function confirmTitle(){
		var answerKey = {
			'titleConfirm': true,
			'titlAllowed': false
		};

 		return answerKey;
	}

	function rejectTitle(){
		var answerKey = {
			'title': "",
			'titleAllowed': true,
	 		'openPoll': false,
	 		'titleOwner': false
		};

		console.log(answerKey);
	 	return answerKey;
	}

	function rejectFin(){
		var answerKey = {
			'openPoll': false
		}

		return answerKey;
	}
	return service;
});
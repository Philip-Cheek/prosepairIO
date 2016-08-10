angular.module('prosePair').service('pollService', function(){

	var pollTimer;
	var currentPoll;
	var timeLeft;
	var z = 0;
	var service = {};

	service.setCurrentPoll = function(current){
		console.log('SHOWING CURRENT POLL', currentPoll)
		currentPoll = current;
	}

	service.showCurrentPoll = function(){
		return currentPoll
	}


	service.handlePollResult = function(confirm, callback){
		console.log('THE FUCK POLL', currentPoll)

		var tempPoll = currentPoll;
		currentPoll = "";
		z++;

		console.log('pollService handlePollResult has been called' + z + 'times')
		console.log('tempPoll', tempPoll);

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
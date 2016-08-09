angular.module('prosePair').service('pollService', function($interval){

	var pollTimer;
	var currentPoll;
	var timeLeft;

	var service = {};

	service.initPollTimer = function(scopeTime, timeRanOut){
		timeLeft = 12;
		scopeTime(timeLeft);

		pollTimer = $interval(function(){
			
			if (timeLeft < 1){
				timeRanOut();
				$interval.cancel(pollTimer);
			}

			timeLeft--;
			scopeTime(timeLeft);
		}, 1000);
	};

	service.setCurrentPoll = function(current){

		currentPoll = current;
	}

	service.showCurrentPoll = function(){
		return currentPoll
	}

	service.endPollTimer = function(){
		$interval.cancel(pollTimer)
	}

	service.handlePollResult = function(confirm, callback){
		$interval.cancel(pollTimer);

		var tempPoll = currentPoll;
		currentPoll = "";

		if (confirm){

 			if (tempPoll == 'title'){
 				callback(confirmTitle());
 			}

 		}else{

 			if (tempPoll == 'title'){
	 			callback(rejectTitle());
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
	 		'openBool': false,
	 		'titleOwner': false
		};

	 	return answerKey;
	}

	return service;
});
angular.module('prosePair').service('pollService', function($interval){

	var pollTimer;
	var currentPoll;
	var timeLeft;

	var service = {};

	service.initPollTimer = function(scopeTime, timeRanOut){
		timeLeft = 12;
		scopeTime(timeLeft);

		$interval.cancel(pollTimer);
		pollTimer = $interval(function(){
			
			if (timeLeft < 1){
				console.log('time rand out');
				console.log('polTimerBefore', pollTimer);
				$interval.cancel(pollTimer);
				console.log('polltimerAfert', pollTimer);
				timeRanOut();
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
		console.log(pollTimer)

		var tempPoll = currentPoll;
		currentPoll = "";

		console.log('tempPoll', tempPoll);

		if (confirm){

 			if (tempPoll == 'title'){
 				callback(confirmTitle());
 			}

 		}else{

 			if (tempPoll == 'title'){
 				console.log('we should reject title')
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
	 		'openPoll': false,
	 		'titleOwner': false
		};

		console.log(answerKey);
	 	return answerKey;
	}

	return service;
});
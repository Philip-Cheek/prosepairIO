angular.module('prosePair').service('pollService', function(peerService){

	var currentPoll = voterDefault();
	var timeLeft;

	var service = {};

	service.setCurrentPoll = function(current, person){
		currentPoll.title = current;
		currentPoll.instigator = person;
	}

	service.isPollCurrent = function(){
		return 'title' in currentPoll;
	}

	service.showCurrentPoll = function(){
		return currentPoll.title
	}

	service.pollInstigator = function(){
		if ('instigator' in currentPoll){
			return currentPoll.instigator;
		}
	}

	service.handlePollResult = function(confirm, voter, callback){

		console.log("here is an honest look at currentPoll", currentPoll);
		if ('title' in currentPoll){
			var pollStatus = handleTally(confirm, voter);

			if (pollStatus != 'stillPoll'){
				
				var tempPoll = currentPoll.title;
				var instigator = currentPoll.instigator;

				currentPoll = voterDefault();

				console.log('lets look at hopefully reset', currentPoll);

			
				if (pollStatus == 'pass'){

		 			if (tempPoll == 'title'){
		 				callback({'status': 'Confirm', 'instigator': instigator, 'answerKey': confirmTitle()});
		 			

		 			}else if (tempPoll == 'fin'){
		 				callback({'status': 'Confirm', 'instigator': instigator, 'answerKey': confirmFin()})
		 			}

		 		}else{

		 			if (tempPoll == 'title'){
		 				console.log('we should reject title');
			 			callback({'status': 'Rejection', 'instigator': instigator, 'answerKey': rejectTitle()});

			 		}else if (tempPoll == 'fin'){
			 			console.log('we should reject fin');
			 			callback(rejectFin());
			 		}

		 		}
		 	}else{
		 		callback({'status': 'stillPoll'})
		 	}
		}
	}

	function handleTally(affirm, voter){

		if (firstVote(voter)){
			currentPoll.tally.voteCount += 1;

			if (affirm){
				currentPoll.tally.voteStand += 1
			}

			var peerLen = peerService.getPeers().length;
			var vCount = currentPoll.tally.voteCount;
			var aVotes = currentPoll.tally.voteStand;

			if ((aVotes/peerLen) > 0.5){
				return 'pass';
			}else if ((vCount - aVotes) >= peerLen/2){
				return 'fail'
			}else{
				return 'stillPoll'
			}

		}else{
			return 'stillPoll'
		}
	}

	function firstVote(person){
		var voters = currentPoll.tally.voters;

		for (var i = 0; i < voters.length; i++){
			if (voters[i] == person){
				return false;
			}
		}

		currentPoll.tally.voters.push(person);
		return true;
	}

	function confirmTitle(){
		var answerKey = {
			'titleConfirm': true,
			'titlAllowed': false
		};

 		return answerKey;
	}

	function confirmFin(){
		var answerKey = {
			'samplePick' : true,
			'myTurn': false,
			'sampleText': ""
		};

		return answerKey
	}

	function voterDefault(){
		return {
			'tally': {
				'voteCount': 0,
				'voteStand': 0,
				'voters': []
			}
		}
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
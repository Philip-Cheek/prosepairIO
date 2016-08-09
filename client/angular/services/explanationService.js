angular.module('prosePair').service('explanationService', function($timeout, peerService){

	var service = {};
	var explanationPromise;
	var overlapText;


	service.setExplanationText = function(reason, setScope, info){
		$timeout.cancel(explanationPromise);

		switch(reason){
			case 'turn':

				setScope(determineTurnText());

				if (overlapText && overlapText.length > 0){
					handleTimeStampOverlap(setScope);
				}

				break;

			case 'time':
				setScope("Time limit reached");

				if (overlapText && overlapText.length > 0){
					handleTimeStampOverlap(setScope);
				}else{
					this.resetExplanationLater(setScope);
				};

				break;

			case 'error':
				console.log('we an error')
				setScope(info);
				break;
				
			case 'titleChange':
				setScope(info + " is trying a Title.");
				this.resetExplanationLater(setScope);
				break;
			case 'titlePoll':
				overlapText = info.person + " would like to change the title to " + info.title;
				setScope(overlapText);
				break;
			case 'otherTyping':
				console.log('wooHoo!!')
				setScope(peerService.whoseTurn() + " is typing.");
				this.resetExplanationLater(setScope);
				break;
			case 'time':
				setScope('Timelimit reached');
				this.resetExplanationLater(setScope);
				break;
			case 'privatePoll':
				setScope(determinePrivateText('title'));
				this.resetExplanationLater(setScope);
			case 'finSubmit':
				setScope(determinePrivateText('conclusion'));
				this.resetExplanationLater(setScope);
				break;
			case 'titleConfirm':
				setScope('Title has been confirmed');
				this.resetExplanationLater(setScope);
				break;
			case 'finConfirm':
				setScope('Congratulations! This book is finished!');
				break;
			case 'finRejection':
				setScope(determineCancelText("end the story"));
				this.resetExplanationLater(setScope);
				break;
			case 'titleRejection':
				setScope(determineCancelText("your title"));
				this.resetExplanationLater(setScope);
				break;
		}
	};


	service.resetExplanationLater = function(setScope, specInterval, callback){
		$timeout.cancel(explanationPromise);
		
		if (!specInterval || specInterval == 'default'){
			specInterval = 1600;
		}

		if (callback){
			explanationPromise = $timeout(function(){
				callback(setScope);
			}, specInterval)
		}else{
			explanationPromise = $timeout(function(){
				service.setExplanationText('turn', setScope);
			}, specInterval)
		}
	};


	function determinePrivateText(pollType){
		var explan = ["Polling other "," on " + pollType]
		return explan.join(determinePeerTitle());
	}


	function determinePeerTitle(){
		var peerList = peerService.getPeers();

		if (peerList.length < 2){
			return (peerList[0]);
		}else{
			return ("prose partners");
		}
	}


	function determinePeerPlural(){
		return peerService.getPeers().length > 1
	}


	function determineCancelText(cancel){
		var p = determinePeerTitle();
		var txt = " not agree to "

		if (determinePeerPlural){
			return p + " does" + txt + cancel;
		}else{
			return p + " do"
		}
	}

	function handleTimeStampOverlap(setScope){
		currentTimeStamp = new Date();

		service.resetExplanationLater(setScope, 'default', function(){

			var futureTimeStamp = new Date();

			var timeDiff = (futureTimeStamp - currentTimeStamp)
			timeDiff /= 1000;

			var seconds = Math.round(timeDiff % 60);

			console.log('seconds elapsed', seconds);

			if (seconds < 12){
				console.log('overlapText', overlapText);
				setScope(overlapText);
				var overlapTime = (12 - seconds) * 1000
				service.resetExplanationLater(setScope, overlapTime);
			}else{
				service.setExplanationText('turn');
			};

			overlapText = "";
		});
	}

	function determineTurnText(){
		var turnDefault = ["It is ", " turn"];

		if (peerService.isMyTurn()){
			return turnDefault.join("your")
		}else{
			return turnDefault.join(peerService.whoseTurn() + "'s")
		}
	}

	return service;
});
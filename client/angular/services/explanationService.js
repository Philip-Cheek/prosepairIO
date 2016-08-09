angular.module('prosePair').service('explanationService', function($timeout, peerService){

	var service = {};
	var explanationPromise;


	service.setExplanationText = function(reason, setScope, info){
		$timeout.cancel(explanationPromise);

		switch(reason){
			case 'turn':
				setScope(determineTurnText());
				break;
			case 'time':
				setScope("Time limit reached");
				this.resetExplanationLater(setScope);
				break;
			case 'error':
				console.log('we an error')
				setScope(info);
				break;
			case 'titlePoll':
				setScope(info.person + " would like to change the title to " + info.title);
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


	service.resetExplanationLater = function(setScope, specInterval, specText, callback){
		$timeout.cancel(explanationPromise);
		
		if (!specInterval){
			specInterval = 1600;
		}

		if (callback){
			explanationPromise = $timeout(function(){
				if (specText != false){
					setScope(specText);
					callback();
				}else{
					service.setExplanationText('turn', setScope);
				}
			}, specInterval)
		}else{
			explanationPromise = $timeout(function(){
				console.log('we are called at all')
				if (specText){
					setScope(specText);
				}else{
					service.setExplanationText('turn', setScope);
				}
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


	function determineTurnText(){
		var turnDefault = ["It is ", " turn"];

		if (peerService.isMyTurn()){
			return turnDefault.join("your")
		}else{
			return turnDefault.join(peerService.whoseTurn())
		}
	}

	return service;
});
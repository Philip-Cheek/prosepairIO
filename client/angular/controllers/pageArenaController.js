angular.module('prosePair').controller('proseArenaController', function($scope, $location, $routeParams, $interval, $timeout, peerService, bookFactory, sentenceService, socketFactory){
	//Initialize Arena App


	var countDown;
	var explanationPromise;
	var pollTimer;

	initArena();




	//Listen for Socket Emition From Server

	socketFactory.on('turnChange', function(info){
		$timeout.cancel(explanationPromise);

		if (info.person == peerService.revealMyself()){
			$scope.myTurn = true;
		}else{
			$scope.myTurn = false;
		}

		docTitleExclaim();
		setTimeLeftFromTop();

		if ($scope.bookText.length > 270 && !$scope.titleAllowed){
			$scope.titleAllowed = true; 
		}

		if (info.reason != "ranOutOfTime" || info.text != peerService.revealMyself()){
			var textToAdd = info.text;

			if ($scope.myTurn){
				$scope.explanationText = "It is your turn.";
			}else{
				$scope.explanationText = "It is " + info.person + "'s turn.";
			}

			if ($scope.bookText.length > 1 && textToAdd[0] != " "){
				textToAdd = " " + textToAdd;
			}

			$scope.bookText += textToAdd;

		}else if (!$scope.myTurn && peerService.revealMyself() == info.text){
			$scope.$apply(function(){
				$timeout(function(){
					$scope.explanationText = "It is " + info.person + "'s turn.";
				}, 1600);
			});
		}

	});

	socketFactory.on("otherUserIsTyping", function(){
		var personTyping;

		if ($scope.mode == 'pair' && !$scope.myTurns){
			personTyping = $scope.peer;
		}

		if (!$scope.myTurn){
			var text = "It is " + $scope.peer + "'s turn"
			resetExplanationLater(text);
			$scope.explanationText = personTyping + " is typing."
		}
	});


	socketFactory.on("titleBeingChanged", function(info){
		$scope.title = info.text;
		$scope.titleAllowed = false;
		determineExplanationText('titleBeingChanged', info.person);
	});

	socketFactory.on('peerLeft'), function(peerName){
		peerService.peerLeft(peerName);
	}

	socketFactory.on('pollTitle', function(info){
		if (info.submitStatus){
			$scope.openPoll = true;
			$scope.pollTime = 12;

			pollTimer = $interval(function(){
				if ($scope.pollTime <= 0){
					$scope.openPoll = false;

					var person;

					if ($scope.mode == 'pair'){
						if ($scope.myTurn){
							person = peer.revealMyself();
						}else{
							person = $scope.peer + "'s";
						}

					}

					$interval.cancel(pollTimer);
					$scope.explanationText = "It is " + person + " turn.";
				}

				$scope.pollTime--;
			}, 1000);

			determineExplanationText('titlePoll', info)
		}else{
			determineExplanationText('turn')
			$scope.openPoll = false; 
			$scope.title = ""
		}
	})



	//Functions Triggered By DOM


	$scope.userTyping = function(){
		socketFactory.emit("userType", peerService.showTag());
		validateSentence(true);
	};


	$scope.submitTextChunk = function(){
		validateSentence(false);
		if ($scope.validEntry){
			concedeTurn('sentenceSubmit', $scope.userSentence)
		}
	}


	$scope.submitBook = function(){
		validateSentence(false);

		if ($scope.validEntry){
			if (!$scope.title || $scope.title.length < 5){
				var titleErr;
				if (!$scope.title){
					titleErr = "There must be an agreed upon title"
				}else if ($scope.title.length < 5){
					"The title is too short."
				}
				determineExplanationText('error', $scope.userSentence)
			}

		};
	}

 	$scope.titleChanging = function(){
 		var info = {
 			'titleText': $scope.title,
 			'tag': peerService.showTag(),
 			'person': peerService.revealMyself()
 		}

 		$scope.privatePoll = true;
 		socketFactory.emit("titleBeingChanged", info)
 	}


 	$scope.titlePoll = function(submit){
 		if (!submit){
 			$scope.title = "";
 		}else{
	 		info = {
	 			'submitStatus': submit,
	 			'person': peerService.revealMyself(),
	 			'tag': peerService.showTag()
	 		}

	 		socketFactory.emit('titleUpdate', info);
	 	}
 	}

 	$scope.pollAnswer = function(answer){
 		socketFactory.emit('')
 	}




 	//Worker Functions


	function validateSentence(midWayStatus){
		var mostPressingError;

		if ($scope.userSentence.length > 115){
			$scope.userSentence = $scope.userSentence.slice(0, 115);
			return;
		}

		$scope.charLeft = 115 - $scope.userSentence.length
		if ($scope.charLeft == 0){
			$scope.validEntry = false;
			$scope.mostPressingError = ['Maximum character limit reached'];
			return;
		}

		var validCheck = sentenceService.isValid($scope.userSentence, midWayStatus);
		$scope.validEntry = validCheck.status;
		if (!$scope.validEntry){
			if (!mostPressingError){
				mostPressingError = validCheck.errors[validCheck.errors.length - 1]
			}

			determineExplanationText('error', mostPressingError)
		}else{
			determineExplanationText('turn')
		}
	}


	function initArena(){
		setTimeLeftFromTop();

		$scope.mode = $routeParams.mode;
		$scope.myTurn = peerService.getMyInitTurn();
		$scope.charLeft = 115;
		$scope.bookText = "";

		$scope.titleByOther = false;
		$scope.privatePoll = false;
		$scope.openPoll = false;

		getPeers();
		determineExplanationText('turn')
	}


	function getPeers(){
		var peers =  peerService.getPeers()
		if (peers.length == 0){
			$location.path('/connect')
		}else if ($routeParams.mode == 'pair'){
			$scope.peer = peers[0]
		}
	}


	function setTimeLeftFromTop(time){
		if (countDown){
			$interval.cancel(countDown);
		}

		if (!time){
			time = 5;
		}

		$scope.timeLeft = time;

		countDown = $interval(function(){
			if ($scope.timeLeft > 0){
				$scope.timeLeft -= 1;
			}else{
				$interval.cancel(countDown);

				if ($scope.myTurn == true){
					concedeTurn('ranOutOfTime');
				};
			}

		}, 1000)
	}


	function docTitleExclaim(){
		var exclaim = "(!)"
		var currentTitle = document.title;

	
		if (!$scope.myTurn && currentTitle.length > exclaim.length && currentTitle.substring(0,exclaim.length) == exclaim){
			document.title = currentTitle.substring(exclaim.length + 1, currentTitle.length);
		}else if ($scope.myTurn && currentTitle.length > exclaim.length && currentTitle.substring(0,exclaim.length) != exclaim){
			document.title = exclaim + " " + currentTitle;
		}

	}


	function resetExplanationLater(specText, specInterval, callback){
		if (explanationPromise){
			$timeout.cancel(explanationPromise);
		}
		if (!specInterval){
			specInterval = 1600;
		}

		if (!specText){
			specText = $scope.explanationText;
		}

		if (callback){
			explanationPromise = $timeout(function(callback){
				if (specText != false){
					$scope.explanationText = specText;
					callback()
				}else{
					$scope.determineExplanationText('turn');
				}
			}, specInterval)
		}else{
			explanationPromise = $timeout(function(){
				if (specText != false){
					$scope.explanationText = specText;
				}else{
					$scope.determineExplanationText('turn');
				}
			}, specInterval)
		}
	}


	function determineExplanationText(reason, info){
		var turnDefault = ["It is ", " turn"];
		var person;

		if ($scope.mode == 'pair'){
			person = $scope.peer;
		};


		if (reason == "turn"){
			if ($scope.myTurn){
				$scope.explanationText = turnDefault.join("your")
			}else if ($scope.mode == 'pair'){
				$scope.explanationText = turnDefault.join(person + "'s");
			}
		}else if (reason == 'time'){
			$scope.explanationText = "Time limit reached";
		}else if (reason == 'error'){
			$scope.explanationText = info;
		}else if (reason == 'titleBeingChanged'){
			resetExplanationLater(turnDefault.join(person + "'s"), 600, function(){
				$scope.titleByOther = false;
			});

			$scope.explanationText = info + " is entering a title";
		}
	}


	function concedeTurn(reason, text, notMe){
		$scope.myTurn = false;

		if (reason == 'ranOutOfTime'){
			determineExplanationText('time')
			text = peerService.revealMyself();
		}

		peerService.turnChange(function(personForTurn, roomTag){
			var info = {
				'person': personForTurn,
				'tag': roomTag,
				'text': text,
				'reason': reason
			}

			socketFactory.emit("trigger next turn", info);
		})
	}
});
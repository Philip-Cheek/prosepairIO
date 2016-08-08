angular.module('prosePair').controller('proseArenaController', function($scope, $location, $routeParams, $interval, $timeout, peerService, bookFactory, sentenceService, socketFactory){


	//Controller-wide timers and bool


	var countDown;
	var explanationPromise;
	var pollTimer;
	var titleConfirm = false;




	//Initialize Arena App;


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

		if ($scope.bookText.length > 10 && !$scope.titleAllowed && !titleConfirm){
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

	$scope.$watch('openPoll', function(){
		console.log($scope.openPoll);
	})

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


	socketFactory.on("titleChangedByOther", function(info){
		$scope.titleAllowed = false;
		$scope.title = info.titleText;
		$scope.explanationText = info.person + " is trying out a Title.";

		$timeout.cancel(explanationPromise);
		explanationPromise = $timeout(function(){
			determineExplanationText('turn');
			$scope.titleAllowed = true;
		},1500)
	});

	socketFactory.on('peerLeft'), function(peerName){
		peerService.peerLeft(peerName);
	}

	socketFactory.on('pollTitle', function(info){
		var otherPerson = info.person != peerService.revealMyself();
		$scope.titleOwner = !otherPerson;

		if (info.submitStatus){

			if (otherPerson){
				$timeout.cancel(explanationPromise);
				determineExplanationText('titlePoll', info);
			}
			
			setPolltimer(otherPerson);
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
			if (!$scope.title || $scope.title.length < 50){
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

 		if ($scope.title.length > 30){
 			$scope.title = $scope.title.slice(0,30);
 		}

 		$scope.titleLeft = 30 - $scope.title.length;
 
 		if ($scope.titleAllowed){
			var info = {
				'titleText': $scope.title,
				'tag': peerService.showTag(),
				'person': peerService.revealMyself()
			}

			$scope.privatePoll = true;
			socketFactory.emit("titleBeingChanged", info)
		}else{
			console.log('title is not allowed for whatever reason!')
		}
 	}


 	$scope.finPoll = function(submit){
 		determineExplanationText('finSubmit');
 	}


 	$scope.titlePoll = function(submit){
 		$scope.privatePoll = false;
 		$scope.titleAllowed = false;

 		console.log('what is submit', submit)
 		if (!submit){
 			$scope.title = "";
 		}else{
 			determineExplanationText('privatePoll')
 		};

  		info = {
 			'submitStatus': submit,
 			'person': peerService.revealMyself(),
 			'tag': peerService.showTag()
 		}

 		socketFactory.emit('titleUpdate', info);
 	}

 	$scope.pollAnswer = function(confirm){
 		if (confirm){
 			$scope.titleConfirm = true;
 			$scope.titleAllowed = false;
 		}else{
 			var bool = !$scope.titleOwner;
 			rejectTitle(bool);
 			$scope.titleOwner = false;
 		}
 		
 	}




 	//Worker Functions


	function validateSentence(midWayStatus){
		var mostPressingError;

		if ($scope.userSentence.length > 115){
			$scope.userSentence = $scope.userSentence.slice(0, 115);
			return;
		}

		$scope.charLeft = 115 - $scope.userSentence.length
		if ($scope.charLeft < 0){
			$scope.validEntry = false;
			$scope.mostPressingError = ['Maximum character limit exceeded'];
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
		$scope.titleLeft = 30;

		$scope.titleAllowed = false;
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


	function setPolltimer(otherPerson){
		$scope.openPoll = otherPerson;
		$scope.pollTime = 12;

		pollTimer = $interval(function(){
			
			if ($scope.pollTime < 1){
				rejectTitle(otherPerson)
				$interval.cancel(pollTimer);
			}

			$scope.pollTime--;
		}, 1000);
	}


	function rejectTitle(otherPerson){
		$scope.title = ""

		if (otherPerson){
			$scope.openPoll = false;
			$scope.explanationText = "It is " + personWhoseTurn(true) + " turn.";
		}else{
			$scope.title = ""

			if ($scope.mode == 'pair'){
				$scope.explanationText = "Title rejected by " + $scope.peer;
			}else{
				$scope.explanationText = "Title rejected by partners";
			}

			explanationPromise = $timeout(function(){
				$scope.explanationText = "It is " + personWhoseTurn(true) + " turn.";
			}, 1600);
		}
	}

	function personWhoseTurn(turnTime){
		if ($scope.mode == 'pair'){
			if ($scope.myTurn){
				if (!turnTime){
					return peerService.revealMyself();
				}else{
					return "your"
				}
			}else{
				if (!turnTime){
					return $scope.peer
				}else{
					return $scope.peer + "'s"
				}
			}
		}
	}

	function setTimeLeftFromTop(time){
		if (countDown){
			$interval.cancel(countDown);
		}

		if (!time){
			time = 75;
		}

		$scope.timeLeft = time;

		countDown = $interval(function(){
			if ($scope.timeLeft > 0){
				$scope.timeLeft -= 1;
			}else{
				$interval.cancel(countDown);

				console.log("what is going on")
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

		if (callback){
			explanationPromise = $timeout(function(callback){
				if (specText != false){
					$scope.explanationText = specText;
					callback()
				}else{
					determineExplanationText('turn');
				}
			}, specInterval)
		}else{
			console.log('this should work')
			explanationPromise = $timeout(function(){
				console.log('we are called at all')
				if (specText){
					$scope.explanationText = specText;
				}else{
					determineExplanationText('turn');
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

		}else if (reason == 'titlePoll'){
			$scope.explanationText = info.person + " would like to change the title to " + $scope.title;

		}else if (reason == 'privatePoll'){

			var explan = ["Polling other "," on Title"]

			if ($scope.mode == 'pair'){
				$scope.explanationText = explan.join($scope.peer);
			}else{
				$scope.explanationText = explan.join("prose partners");
			}

			resetExplanationLater();

		}else if (reason == 'finSubmit'){
			var explan = ["Polling other "," on conclusion"];
			
			if ($scope.mode == 'pair'){
				$scope.explanationText = explan.join($scope.peer);
			}else{
				$scope.explanationText = explan.join("prose partners");
			}
			
			resetExplanationLater();
		}
	}


	function concedeTurn(reason, text, notMe){
		$scope.myTurn = false;
		$scope.userSentence = "";

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
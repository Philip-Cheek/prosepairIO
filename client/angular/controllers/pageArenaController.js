angular.module('prosePair').controller('proseArenaController', function($scope, $location, $routeParams, $interval, $timeout, explanationService, peerService, pollService, bookFactory, sentenceService, socketFactory){


	//Controller-wide timers and bool


	var countDown;
	var explanationPromise;
	var pollTimer;
	var titleConfirm = false;
	var currentPoll;




	//Initialize Arena App;


	initArena();



	//Listen for Socket Emition From Server

	socketFactory.on('turnChange', function(info){

		$scope.myTurn = peerService.setNextTurn(info.person);

		docTitleExclaim();
		setTimeLeftFromTop();
		setBookText(info);

		if ($scope.bookText.length > 10 && !$scope.titleAllowed && !titleConfirm){
			$scope.titleAllowed = true; 
		}

		if (info.reason != "ranOutOfTime" || info.text != peerService.revealMyself()){
			setExplanationScope('turn');
		}
	});

	socketFactory.on("otherUserIsTyping", function(){

		setExplanationScope('otherTyping');
	});


	socketFactory.on('pollResults', function(info){
		handlePollResult(info.vote, true);
	})

	socketFactory.on("titleChangedByOther", function(info){
		$scope.titleAllowed = false;
		$scope.title = info.titleText;
		setExplanationScope('titleChange', info.person);
	});


	socketFactory.on('peerLeft', function(peerName){
		peerService.peerLeft(peerName);
	});


	socketFactory.on('pollingFin'), function(info){
		var otherPerson = info.person != peerService.revealMyself()
		var currentPoll = 'fin'
		pollService.setCurrentPoll('fin')

		if (otherPerson){
			$scope.openPoll = true;
			$scope.explanationText = info.person + " wants to conclude this book.";
		}

		setPollTimer(otherPerson, function(){
			handlePollResult;
		});
	}


	socketFactory.on('pollTitle', function(info){
		var otherPerson = info.person != peerService.revealMyself();
		pollService.setCurrentPoll('title');
		currentPoll = 'title'

		info.title = $scope.title;
		$scope.titleOwner = !otherPerson;

		if (info.submitStatus){

			if (otherPerson){
				setExplanationScope('titlePoll', info);
			}
			
			console.log('aboutTo set a timer');
			setPollTimer(otherPerson, function(){
				console.log('hi!')
				handlePollResult(false, !otherPerson);
			});
			
		}else{
			setExplanationScope('turn');
			$scope.openPoll = false; 
			$scope.title = "";
		}
	})



	//Functions Triggered By DOM


	$scope.userTyping = function(){

		var info = {
			'memo': 'otherUserIsTyping',
			'tag': peerService.showTag()
		}

		socketFactory.emit("memoBroadcast", info);
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
				setExplanationScope('error', $scope.userSentence)
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
				'memo': 'titleChangedByOther',
				'tag': peerService.showTag(),
				'body': {
					'titleText': $scope.title,
					'person': peerService.revealMyself()
				}
			}

			$scope.privatePoll = true;
			socketFactory.emit('memoBroadcast', info)

		}else{

			console.log('title is not allowed for some reason!')
		}
 	}


 	$scope.finSubmit = function(){

 		setExplanationText('finSubmit');
 		currentPoll = "fin"

 		var info = {
 			'memo': 'pollingFin',
 			'tag': peerService.showTag(),
 			'body': {
 				'person': peerService.revealMyself()
 			}
 		}

 		socketFactory.emit('memoAll', info);
 	}


 	$scope.titlePoll = function(submit){

 		$scope.privatePoll = false;
 		$scope.titleAllowed = false;

 		pollService.setCurrentPoll('title');

 		if (!submit){
 			$scope.title = "";
 		}else{
 			setExplanationScope('privatePoll');

			info = {
				'memo': 'pollTitle',
				'tag': peerService.showTag(),
				'body': {
					'submitStatus': submit,
					'person': peerService.revealMyself()
				}
			}

			socketFactory.emit('memoAll', info);
		};
 	}


 	$scope.pollAnswer = function(confirm){

 		$scope.openPoll = false;
 		setExplanationScope('turn');

 		var info = {
 			'memo': 'pollResults',
 			'tag': peerService.showTag(),
 			'body': {
 				'vote': confirm
 			}
 		}

 		socketFactory.emit('memoBroadcast', info);
 		handlePollResult(confirm)
 	}




 	//Worker Functions


 	function handlePollResult(confirm, recipient){
 		console.log("why is there a bug here");
 		if (recipient && confirm){
			setExplanationScope(pollService.showCurrentPoll() + 'Confirm')
		}else if (recipient){
			setExplanationScope(pollService.showCurrentPoll() + 'Rejection')
		}else{
			setExplanationScope('turn')
		}

 		pollService.handlePollResult(confirm, function(answerKey){
			for (var part in answerKey){
				$scope[part] = answerKey[part];
			}
		});
 	}

 	function setBookText(info){
 		if (info.reason != "ranOutOfTime"){
 			var textToAdd = info.text;

			if ($scope.bookText.length > 1 && textToAdd[0] != " "){
				textToAdd = " " + textToAdd;
			}

			$scope.bookText += textToAdd;
		};
 	}


 	function setExplanationScope(reason, info){
 		if (!info){
 			info = false;
 		}

 		explanationService.setExplanationText(reason, function(eText){
 			$scope.explanationText = eText;
 		}, info);
 	};


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

			setExplanationScope('error', mostPressingError);
		}else{
			setExplanationScope('turn');
		}
	}


	function initArena(){
		setTimeLeftFromTop();

		$scope.mode = $routeParams.mode;
		$scope.myTurn = peerService.getMyInitTurn();
		$scope.charLeft = 115;
		$scope.bookText = "";
		$scope.titleLeft = 30;

		$scope.titleAllowed = true;
		$scope.privatePoll = false;
		$scope.openPoll = false;

		getPeers();
		setExplanationScope('turn');
	}


	function getPeers(){
		var peers =  peerService.getPeers()
		if (peers.length == 0){
			$location.path('/connect')
		}else if ($routeParams.mode == 'pair'){
			$scope.peer = peers[0]
		}
	}


	function setPollTimer(otherPerson, callback){
		console.log('setPollTimer called');
		$scope.openPoll = otherPerson;

		pollService.initPollTimer(function(time){
			$scope.pollTime = time;
		}, function(){
			callback();
		});
	}



	function setTimeLeftFromTop(time){
		if (countDown){
			$interval.cancel(countDown);
		}

		if (!time){
			time = 10;
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

	function concedeTurn(reason, text, notMe){

		$scope.myTurn = false;
		$scope.userSentence = "";

		if (reason == 'ranOutOfTime'){
			setExplanationScope('time')
			text = peerService.revealMyself();
		}

		peerService.turnChange(function(personForTurn, roomTag){
			var info = {
				'memo': 'turnChange',
				'tag': roomTag,
				'body': {
					'person': personForTurn,
					'text': text,
					'reason': reason
				}
			}

			socketFactory.emit("memoAll", info);
		})
	}
});
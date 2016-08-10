angular.module('prosePair').controller('proseArenaController', function($scope, $location, $routeParams, explanationService, intervalFactory, peerService, pollService, bookFactory, sentenceService, socketFactory){



	//Initialize Arena App;

	var titleConfirm = false;
	initArena();



	//Listen for Socket Emition From Server

	socketFactory.on('turnChange', function(info){

		$scope.myTurn = peerService.setNextTurn(info.person);

		docTitleExclaim();
		setTimeLeftFromTop();
		setBookText(info);

		if ($scope.bookText.join(' ').length > 10 && !$scope.titleAllowed && !titleConfirm){
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
		setExplanationScope('titleConfirm');
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



	//Functions Triggered By User


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
 		setExplanationScope('answerPoll');

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
 		$scope.paragraph = false;

 		if (info.reason != "ranOutOfTime"){
 			var textToAdd = info.text;

 			if (info.paragraph || $scope.bookText.length < 1){
				textToAdd = "     " + textToAdd;
				$scope.bookText.push(textToAdd);
			}else{
				lastP = $scope.bookText.length - 1;
				if($scope.bookText[lastP].length > 1 && textToAdd[0] != " "){
					$scope.bookText[lastP] += " " + textToAdd
				}
			}
			
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
		$scope.bookText = [];
		$scope.titleLeft = 30;

		$scope.titleAllowed = true;
		$scope.privatePoll = false;
		$scope.openPoll = false;

		if ($scope.myTurn){
			$scope.paragraph = true;
		}else{
			$scope.paragraph = false;
		}

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
		$scope.openPoll = otherPerson;
		$scope.pollTime = 12;

		intervalFactory.setCountDown('pollLeft', 12, function(tLeft){
			$scope.pollTime= tLeft;
		}, function(){
			callback();
		});
	}

	function setTimeLeftFromTop(time){
		if (!time){
			time = 75;
		}

		intervalFactory.setCountDown('turnLeft', time, function(tLeft){
			$scope.timeLeft = tLeft;
		}, function(){
			if ($scope.myTurn){
				concedeTurn('ranOutOfTime');
			};
		});
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

			if (reason != "ranOutOfTime"){
				info.body.paragraph = $scope.paragraph;
			}

			socketFactory.emit("memoAll", info);
		})
	}
});
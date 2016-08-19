angular.module('prosePair').controller('proseArenaController', function($scope, $location, $routeParams, explanationService, intervalFactory, peerService, pollService, bookFactory, sentenceService, socketFactory, docService){



	//Initialize Arena App;

	var titleConfirm = false;
	$scope.guess = {};

	initArena();

	$scope.book = {};
	$scope.guess = {};



	//Listen for Socket Emition From Server


	socketFactory.on('turnChange', function(info){

		$scope.myTurn = peerService.setNextTurn(info.person);

		docService.docTitleExclaim($scope.myTurn);
		setTimeLeftFromTop();
		setBookText(info);

		if ($scope.bookText.join(' ').length > 10 && !$scope.titleAllowed && !titleConfirm){
			$scope.titleAllowed = true; 
		}

		if (info.reason != "ranOutOfTime" || info.text != peerService.revealMyself()){
			setExplanationScope('turn');
		}
	});

	socketFactory.on('updateSample', function(info){
		$scope.sampleText = info;
	});

	socketFactory.on("otherUserIsTyping", function(){
		setExplanationScope('otherTyping');
	});


	socketFactory.on('pollResults', function(info){
		console.log('we were hit up with a fuckin poll result')
		handlePollResult(info.vote, false);
	})

	socketFactory.on("titleChangedByOther", function(info){
		$scope.titleAllowed = false;
		$scope.title = info.titleText;
		setExplanationScope('titleChange', info.person, function(){
			$scope.titleAllowed = true;
		});
	});


	socketFactory.on('peerLeft', function(peerName){
		peerService.peerLeft(peerName);
	});


	socketFactory.on('pollAtFin', function(info){
		var otherPerson = info.person != peerService.revealMyself();
		pollService.setCurrentPoll('fin', info.person);

		if (otherPerson){
			$scope.openPoll = true;
			setExplanationScope('finPoll', info.person);
		};

		setPollTimer(otherPerson, function(){
			if (pollService.pollIsCurrent()){
				pollToAnswer(false);
			}
		});
	});


	socketFactory.on('pollTitle', function(info){

		if (info.submitStatus){
			$scope.titleAllowed = false;
			
			peerService.setSampleFair(info.person);
			pollService.setCurrentPoll('title', info.person);
			setExplanationScope('titlePoll', info);

			setPollTimer(true, function(){
				pollToAnswer(false);
			});

		}else{
			$scope.title = "";
			$scope.titleAllowed = true;
		}
	});



	//Functions Triggered By User


	$scope.userTyping = function(){

		var info = {
			'memo': 'otherUserIsTyping',
			'tag': peerService.showTag()
		}

		socketFactory.emit("memoBroadcast", info);

		if ($scope.mode == "Pair"){
			validateSentence(true);
		}else{
			validateWord();
		}
	};


	$scope.submitTextChunk = function(){

		validateSentence(false);

		if ($scope.validEntry){
			concedeTurn('sentenceSubmit', $scope.book.sentence)
		}
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

			if ($scope.title.length > 0){
				$scope.privatePoll = true;
			}

			socketFactory.emit('memoBroadcast', info)

		}
 	}


 	$scope.finSubmit = function(){
		if (!titleConfirm){
			setExplanationScope('expireError', 'Their must be an agreed upon title.');
		}else{
			setExplanationScope('finSubmit');
			pollService.setCurrentPoll('fin')

			var info = {
				'memo': 'pollAtFin',
				'tag': peerService.showTag(),
				'body': {
					'person': peerService.revealMyself()
				}
			}

			socketFactory.emit('memoAll', info);
		}
 	}

 	$scope.nextConnect = function(){
		$location.path('/connect/' + $routeParams.mode)
	}

 	$scope.titlePoll = function(submit){

 		$scope.privatePoll = false;
 		console.log('titlepollreached')
 		if (submit){
 			pollService.setCurrentPoll('title', peerService.revealMyself());
			setExplanationScope('privatePoll');
			$scope.titleAllowed = false;
			$scope.titleOwner = true;
		}else{
			$scope.titleAllowed = true;
			$scope.title = "";
		}

		info = {
			'memo': 'pollTitle',
			'tag': peerService.showTag(),
			'body': {
				'person': peerService.revealMyself(),
				'submitStatus': submit
			}
		}

		socketFactory.emit('memoBroadcast', info);
 	}

 	$scope.submitBook = function(){
 		var authorList = peerService.getPeers();
 		authorList.push(peerService.revealMyself());
 		docService.disableHighlightTracking();

 		var info = {
 			'sampleBody': $scope.sample,
 			'title': $scope.title,
 			'textBody': $scope.bookText,
 			'authors': authorList,
 			'modeRedirect': $scope.mode 
 		}

 		bookFactory.saveBook(info);
 	}

 	$scope.pollAnswer = function(confirm){
 		if (pollService.isPollCurrent()){
 			pollToAnswer(confirm);
 		}
 	}




 	//Worker Functions


 	function pollToAnswer(confirm){
 		$scope.openPoll = false;
 		setExplanationScope('answerPoll');

 		var info = {
 			'memo': 'pollResults',
 			'tag': peerService.showTag(),
 			'body': {
 				'vote': confirm,
 				'voter': peerService.revealMyself()
 			}
 		}

 		socketFactory.emit('memoBroadcast', info);
 		handlePollResult(confirm, true);
 	}

 	function handlePollResult(confirm, answer){

 		var poll = pollService.showCurrentPoll();

 		if (answer){
 			$scope.openPoll = false;
 		}

 		pollService.handlePollResult(confirm, function(pInfo){
 			if (answer || pInfo.status != 'stillPoll'){
 				console.log('this needs to happend')
 				intervalFactory.cancelTimer('pollLeft');
 			}

 			console.log('pInfo chek', pInfo);

 			if (pInfo.status != "stillPoll"){

 				if (peerService.revealMyself() == pInfo.instigator || ($scope.mode != 'pair' || pInfo.status != "Rejection")){
 					setExplanationScope(poll + pInfo.status);
 				} else{
 					setExplanationScope('turn');
 				}

 				var aKey = pInfo.answerKey
 				console.log('AKEYasfd', aKey);
 				for (var part in aKey){
					$scope[part] = aKey[part];
				}

				if (poll == 'title'){
					if  (pInfo.status == "Rejection"){
						peerService.clearFair();
					}else if (pInfo.status == "Confirm"){
						titleConfirm = true;
					}
				}else if (poll == 'fin' && pInfo.status == "Confirm"){
					setSampleStage();
				}
 			}
 		});
 	}

 	function setSampleStage(){
 		if (titleConfirm){

 			console.log('we are going to need to have a few things straight');
 			console.log('sample fair', peerService.showSampleFair());
 			console.log('my own damn self', peerService.revealMyself(''));

	 		var sampleBearer = peerService.showSampleFair() == peerService.revealMyself('');
	 		setExplanationScope('initSample');

	 		if (sampleBearer){

	 			docService.enableHighlightTracking(function(sample){

	 				console.log('what even is sample!', sample)
	 				if (sample && sample.length > 0){
			 			if (sentenceService.validSample($scope.bookText, sample)){

			 				$scope.sampleText = sample;

			 				var info = {
			 					'memo': 'updateSample',
			 					'tag': peerService.showTag(),
			 					'body': sample
			 				}

			 				socketFactory.emit('memoBroadcast', info);

			 			}else{

			 				setExplanationScope('error', 'Please only highlight text within the prose.');
			 			}
			 		};
	 			});
	 		}
	 	}
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


 	function setExplanationScope(reason, info, callback){
 		if (!info){
 			info = false;
 		}

 		explanationService.setExplanationText(reason, function(eText){
 			$scope.explanationText = eText;

 			if (callback){
 				callback();
 			}
 		}, info);
 	};


	function validateSentence(midWayStatus){
		var mostPressingError;
		checkLen(115);

		var validCheck = sentenceService.isValid($scope.book.sentence, midWayStatus);
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
		console.log($scope.mode)
		$scope.myTurn = peerService.getMyInitTurn();

		if ($scope.mode == 'pair'){
			$scope.charLeft = 115
		}else{
			$scope.charLeft = 15;
		}

		$scope.bookText = [];
		$scope.titleLeft = 30;

		$scope.titleAllowed = true;
		$scope.privatePoll = false;
		$scope.openPoll = false;
		$scope.titleConfirm = false;

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
		}else if ($routeParams.mode == 'lightning'){
			$scope.peers = peers;
			console.log('PEER CHECK CHECK CHECK', $scope.peers)
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
			if ($routeParams.mode == 'pair'){
				time = 75;
			}else if ($routeParams.mode == 'lightning'){
				time = 12;
			}
		}

		intervalFactory.setCountDown('turnLeft', time, function(tLeft){
			$scope.timeLeft = tLeft;
		}, function(){
			if ($scope.myTurn){
				concedeTurn('ranOutOfTime');
			};
		});
	}


	function validateWord(){
		checkLen(15);

		var validWord = sentenceService.checkWord($scope.book.sentence);
		$scope.validEntry = validWord.status;

		if (!$scope.validEntry){
			var mostPressingError = validWord.errors[validWord.errors.length - 1]

			setExplanationScope('error', mostPressingError);
		}else{
			setExplanationScope('turn');
		}
	}

	function checkLen(len){
		if ($scope.book.sentence.length > len){
			$scope.book.sentence = $scope.book.sentence.splice(0, len);
		}

		$scope.charLeft = len - $scope.book.sentence.length;
	}

	function concedeTurn(reason, text, notMe){

		$scope.myTurn = false;
		$scope.book.sentence = "";

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
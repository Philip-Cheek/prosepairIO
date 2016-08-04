angular.module('prosePair').controller('proseArenaController', function($scope, $location, $routeParams, $interval, $timeout, peerService, sentenceService, socketFactory){
	var countDown;
	initArena();

	socketFactory.on('turnChange', function(userOnTurn){
		if (userOnTurn == peerService.revealMyself()){
			$scope.myTurn = true;
		}

		docTitleExclaim();

		if ($scope.mode == 'pair' && $scope.myTurn){
			$scope.explanationText = "It's your turn! Add a sentences!"
		}
	})



	$scope.validateMidway = function(){
		if ($scope.userSentence.length > 115){
			$scope.userSentence = $scope.userSentence.slice(0, 115);
			return;
		}

		$scope.charLeft = 115 - $scope.userSentence.length
		if ($scope.charLeft == 0){
			$scope.validEntry = false;
			$scope.errorList = ['Maximum character limit reached'];
			return;
		}

		var validCheck = sentenceService.isValid($scope.userSentence, true);
		console.log('this will be valid check',validCheck)
		$scope.validEntry = validCheck.status;
		if (!$scope.validEntry){
			$scope.errorList = validCheck.errors;
		}
	}

	function initArena(){
		setTimeLeftFromTop();

		$scope.mode = $routeParams.mode;
		$scope.myTurn = peerService.getMyInitTurn();
		$scope.charLeft = 115;

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
				concedeTurn(true);
			}

		}, 1000)
	}

	function docTitleExclaim(){
		var exclaim = "(!)"
		var currentTitle = document.title

		if (!$scope.myTurn && currentTitle.length > exclaim.length && currentTitle.substring(0,exclaim.length) == exclaim){
			document.title = currentTitle.substring(exclaim.length + 1, currentTitle.length);
		}else if ($scope.myTurn){
			document.title = exclaim + " " + currentTitle
		}

	}


	function concedeTurn(ranOutOfTime){
		setTimeLeftFromTop();

		var personForTurn;
		var itIsThisPeersTurn = ["It is ", "'s turn"];

		if ($scope.mode == 'pair'){
			personForTurn = $scope.peer;
			itIsThisPeersTurn = itIsThisPeersTurn.join(personForTurn);
		}

		if (ranOutOfTime){
			$scope.explanationText = "Time limit reached";

			if ($scope.mode == 'pair'){
				$timeout(function(){
					$scope.explanationText = itIsThisPeersTurn;
				}, 1300)
			}
		}else{
			$scope.explanationText = itIsThisPeersTurn;
		}

		$scope.myTurn = false;
		peerService.turnChange(function(personForTurn, roomTag){
			var info = {
				'person': personForTurn,
				'tag': roomTag
			}

			socketFactory.emit("trigger next turn", info)
		})
	}
});
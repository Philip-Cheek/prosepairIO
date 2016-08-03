angular.module('prosePair').controller('proseArenaController', function($scope, $location, $routeParams, peerService, sentenceService){
	$scope.mode = $routeParams.mode;
	$scope.charLeft = 115;
	$scope.$watch(function(){
		return peerService.getPeers();
	}, function(newVal){
		if ($scope.mode == 'pair'){
			$scope.peer = newVal[0];
		}else{
			$scope.peers = newVal;
		}
	});

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
});
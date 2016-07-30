angular.module('prosePair').controller('proseArenaController', function($scope, $location, $routeParams, peerService){
	$scope.mode = $routeParams.mode;
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
		var validCheck =  sentenceService.isValid($scope.userSentence, true);
		$scope.validEntry = validCheck.status;
		if (!$scope.validEntry){
			$scope.errorList = validCheck.errors;
		}
	}
});
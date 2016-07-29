angular.module('prosePair').controller('omniOptionsController', function($scope, $location){
	var menuItems = {
		"p": "prosePaire"
	};

	$scope.modalShown = false;

	$scope.omniSwitch = function(letter){
		$location.path("/connect")
	};

	$scope.testModal = function(){
		console.log("coool!")
    	$scope.modalShown = !$scope.modalShown;
	};
});
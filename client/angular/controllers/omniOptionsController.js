angular.module('prosePair').controller('omniOptionsController', function($scope, $location){
	var menuItems = {
		"p": "prosePaire"
	}

	$scope.omniSwitch = function(letter){
		$location.path("/connect")
	}
});
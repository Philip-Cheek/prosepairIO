angular.module('prosePair').controller('omniOptionsController', function($scope, $location, popUpService, intervalFactory){
	var menuItems = {
		"p": "prosePair"
	};

	$scope.modalShown = false;
	$scope.modalContent = {};
	$scope.modalButtons = [];

	$scope.$watch(function(){

		return popUpService.showOmniModal();

	}, function(newVal, oldVal){

		console.log('well it\'s called but we are having trouble with the bool');
		if (newVal != oldVal){

			console.log("I want to know newVal, popupservice", newVal)
			$scope.modalContent = newVal.content;
			$scope.modalButtons = newVal.buttons
			$scope.modalShown = newVal.status;
			$scope.loading = newVal.loading

			if ('loading' in $scope.loading && $scope.loading.status){

				intervalFactory.setLoadingEllipsis($scope.modalContent.loading.text, function(str){
					$scope.loading.text = str;
				}, function(){
					return $scope.loading.text;
				});

			}else{
				intervalFactory.cancelTimer('ellipsis');
			}
		}
	})

	$scope.omniSwitch = function(letter){
		$location.path("/connect")
	};

	$scope.testModal = function(){
		console.log("coool!")
    	$scope.modalShown = !$scope.modalShown;
	};

	function setNewModalContent(){

	}
});
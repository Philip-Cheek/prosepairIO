angular.module('prosePair').controller('omniOptionsController', function($scope, $location, popUpService, intervalFactory){
	var menuItems = {
		"p": "/connect",
		"pr": "/prompt"
	};

	$scope.modalShown = false;
	$scope.modalContent = {};
	$scope.buttons = [];

	$scope.$watch(function(){

		return popUpService.showOmniModal();

	}, function(newVal, oldVal){

		if (newVal != oldVal){

			console.log("I want to know newVal, popupservice", newVal)
			$scope.modalContent = newVal.content;
			$scope.buttons = newVal.buttons;
			$scope.modalButton = newVal.modalButton
			$scope.modalShown = newVal.status;
			$scope.loading = newVal.loading;

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

	$scope.omniSwitch = function(userPut){
		$location.path(menuItems[userPut]);
	};

	$scope.testModal = function(){
		console.log("coool!")
    	$scope.modalShown = !$scope.modalShown;
	};

	function setNewModalContent(){

	}

	$scope.dialogButtonClicked = function(path){
		$location.path(path);
	}
});
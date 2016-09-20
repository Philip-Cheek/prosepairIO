angular.module('prosePair').controller('omniOptionsController', function($scope, $location, bookFactory, popUpService, intervalFactory, docService){
	var menuItems = {
		"p": "/connect",
		"pr": "/prompt",
		"l": "/",
	};

	$scope.modalShown = false;
	$scope.modalContent = {};
	$scope.buttons = [];
	$scope.location = $location.url();
	$scope.info = {
		'welcome':true,
		'location':$location.url()
	}

	$scope.close = function(){
		console.log('welcome')
		$scope.$apply = function(){
			$scope.welcome = false;
		}
	}

	$scope.$watch(function(){

		return popUpService.showOmniModal();

	}, function(newVal, oldVal){

		if (newVal != oldVal){
			$scope.modalContent = newVal.content;
			$scope.buttons = newVal.buttons;
			$scope.modalButton = newVal.modalButton
			$scope.modalShown = newVal.status

			if ('loading' in newVal){
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
		}
	})

	$scope.pageFlip = function(page){
		bookFactory.turnPage(page);
	}

	$scope.omniSwitch = function(userPut){
		$scope.location = menuItems[userPut];
		$location.path(menuItems[userPut]);
	};

	$scope.testModal = function(){
    	$scope.modalShown = !$scope.modalShown;
	};

	$scope.offset = function(){
		docService.adjustDOM('partial', 'position', 'absolute');
		docService.adjustDOM('partial', 'top', '5.5em');
	}

	$scope.dialogButtonClicked = function(path){
		if (path == 'recentSuccess'){
			bookFactory.viewRecentSuccess();
			$location.path('/');
		}else{
			$location.path(path);
		}
	}
});
angular.module('prosePair').controller('connectOptionsController', function($scope, $location, $interval, $routeParams, intervalFactory, socketFactory, peerService, promptFactory){

	$scope.options = {
		'nicknameEnter': false,
		'loading': false,
		'prosepair': true
	};
	
	initConnection();
	$scope.explanationText = "Select a Mode";
	$scope.errInfo = {
		'isError': false,
		'error': ''
	};

	$scope.lesConnect = function(){
		if (!$scope.options.nickname){
			$scope.options.nicknameEnter = true;
			$scope.explaationText = "Enter a Nickname";
		}else{
			peerService.informMyself($scope.options.nickname);
			getConnecting();
		}
	};

	$scope.isRepeat = function(){
		var nickname = $scope.options.nickname;

		if (nickname.length > 1){
			socketFactory.emit('repeatNickname', nickname)
		}
	}

	socketFactory.on('nicknameRepeat', function(result){
		var errorText = ""

		if (result.isError){
			errorText += result.error;
		}

		$scope.$apply(function(){
			$scope.errInfo.isError = result.isError;
			$scope.errInfo.error = errorText;
		});
	});

	socketFactory.on('successConnect', function(info){
		intervalFactory.cancelTimer('ellipsis');
		peerService.setRoomStage(info.nameList, info.tag, info.mode);
		promptFactory.giveArenaPrompt(info.prompt);
		$location.path('/prose/' + info.mode)

	});

	socketFactory.on('queued', function(roomList){
		var partner;
		if (!$scope.prosepair){
			partner = 'partners';
		}else{
			partner = 'partner';
		}

		var loadingString = "Placed in queue. Awaiting " + partner;
		setLoadingText(loadingString);
	});

	function initConnection(){
		var me = peerService.revealMyself();
	
		if ($routeParams.mode && me){
			$scope.options.nickname = me;
			$scope.options.prosepair = $routeParams.mode == 'pair';
			getConnecting();
		}
	}

	function getConnecting(){
		$scope.options.loading = true;

		data = {
			'name': $scope.options.nickname
		};

		if ($scope.options.prosepair == false){
			data.type = 'lightning'
		}else{
			data.type = 'pair'
		}

		socketFactory.emit('connectProse', data)
		setLoadingText('connecting')
	}

	function setLoadingText(loadingString){
		$scope.options.loading = true;

		intervalFactory.setLoadingEllipsis(loadingString, function(text){
			$scope.loadingText = text;
		}, function(){
			return $scope.loadingText;
		})
	}
});
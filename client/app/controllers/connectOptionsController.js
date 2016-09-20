angular.module('prosePair').controller('connectOptionsController', function($scope, $location, $interval, $routeParams, intervalFactory, socketFactory, peerService, promptFactory){
	
	initConnection();

	$scope.select = function(){
		$scope.explanationText = "Enter a Nickname"
	}

	$scope.isRepeat = function(){
		var nickname = $scope.options.nickname;

		if (nickname.length > 1){
			socketFactory.emit('repeatNickname', nickname)
		}
	}

	$scope.lesConnect = function(){
		peerService.informMyself($scope.options.nickname);
		if ($scope.options.nickname){
			getConnecting();
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

		console.log('success!', info)
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
		$scope.explanationText = "Select a Mode";
		$scope.errInfo = {
			'isError': false,
			'error': ''
		};

		$scope.options = {
			'nicknameEnter': false,
			'loading': false,
			'prosepair': false,
			'lightning': false
		};
	
		if ($routeParams.mode && me){
			$scope.options.nickname = me;
			$scope.options.prosepair = $routeParams.mode == 'pair';
			$scope.options.lightning = !$scope.options.prosepair
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
		intervalFactory.setLoadingEllipsis(loadingString, function(text){
			$scope.loadingText = text;
		}, function(){
			return $scope.loadingText;
		})
	}
});
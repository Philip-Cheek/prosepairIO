angular.module('prosePair').controller('connectOptionsController', function($scope, $location, $interval, $routeParams, intervalFactory, socketFactory, peerService){
	console.log('cool!')

	$scope.options = {
		'nicknameEnter': false,
		'loading': false,
		'prosepair': true
	};
	initConnection();
	$scope.explanationText = "Select a Mode";

	$scope.lesConnect = function(){
		if (!$scope.options.nickname){
			$scope.options.nicknameEnter = true;
			$scope.explanationText = "Enter a Nickname"
		}else{
			peerService.informMyself($scope.options.nickname);
			getConnecting();
		}
	};

	socketFactory.on('successConnect', function(info){
		console.log('success connect butletsjust', info.nameList)
		intervalFactory.cancelTimer('ellipsis');
		console.log('modeCHECK', info.mode)
		peerService.setRoomStage(info.nameList, info.tag, info.mode);
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
		console.log('we should be connecting!')
		$scope.options.loading = true;

		data = {
			'name': $scope.options.nickname
		};

		if ($scope.options.prosepair == false){
			data.type = 'lightning'
		}else{
			data.type = 'pair'
		}

		console.log("very important this is correct", data)
		socketFactory.emit('connectProse', data)
		setLoadingText('connecting')
	}

	$scope.$watch('options.prosepair', function(){
		console.log('prosepair check', $scope.options.prosepair)
	})
	function setLoadingText(loadingString){
		$scope.options.loading = true;

		intervalFactory.setLoadingEllipsis(loadingString, function(text){
			$scope.loadingText = text;
		}, function(){
			return $scope.loadingText;
		})
	}
});
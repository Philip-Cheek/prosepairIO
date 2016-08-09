angular.module('prosePair').controller('connectOptionsController', function($scope, $location, $interval, intervalFactory, socketFactory, peerService){
	$scope.prosepair = true;
	$scope.explanationText = "Select a Mode";
	$scope.options = {
		'nicknameEnter': false,
		'loading': false
	};

	$scope.lesConnect = function(){
		if (!$scope.options.nickname){
			$scope.options.nicknameEnter = true;
			$scope.explanationText = "Enter a Nickname"
		}else{
			data = {
				'name': $scope.options.nickname
			};

			peerService.informMyself(data.name)

			if (!$scope.prosepair){
				data.type = 'lightning'
			}else{
				data.type = 'pair'
			}

			socketFactory.emit('connectProse', data)
			setLoadingText('connecting')
		}
	};

	socketFactory.on('successConnect', function(info){
		console.log('success connect butletsjust', info.nameList)
		intervalFactory.cancelTimer('ellipsis');

		var url;

		if (!$scope.prosepair){
			url = 'lightning'
		}else{
			url = "pair"
		}

		peerService.addPeersNTag(info.nameList, info.tag)
		$location.path('/prose/' + url)

	});

	socketFactory.on('queued', function(roomList){
		var partner;
		if (!$scope.prosePair){
			partner = 'partners';
		}else{
			partner = 'partner';
		}

		var loadingString = "Placed in queue. Awaiting " + partner;
		setLoadingText(loadingString);
	});

	function setLoadingText(loadingString){
		$scope.options.loading = true;

		intervalFactory.setLoadingEllipsis(loadingString, function(text){
			$scope.loadingText = text;
		}, function(){
			return $scope.loadingText;
		})
	}
});
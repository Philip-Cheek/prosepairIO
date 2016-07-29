angular.module('prosePair').controller('connectOptionsController', function($scope, $location, $interval, socketFactory, peerService){
	var optionsTimer;

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
	}

	socketFactory.on('successConnect', function(roomList){
		if (optionsTimer){
			$interval.cancel(optionsTimer);
		}
		var url;

		if (!$scope.prosePair){
			url = 'lightning'
		}else{
			url = "pair"
		}

		peerService.addPeers

	});

	socketFactory.on('queued', function(roomList){
		var partner;
		if (!$scope.prosePair){
			partner = 'partners';
		}else{
			partner = 'partner';
		}

		var loadingString = "Place in queue. Awaiting " + partner;
		setLoadingText(loadingString);
	});

	function setLoadingText(loadingString, intervalLength){
		if (!intervalLength){
			intervalLength = 400;
		}

		$scope.options.loading = true;

		if (optionsTimer){
			$interval.cancel(optionsTimer);
		}

		$scope.loadingText = loadingString;

		optionsTimer = $interval(function(){
			var idx = $scope.loadingText.length - 1;
			while ($scope.loadingText[idx] == "." && idx > $scope.loadingText.length - 4){
				idx--;
			}

			console.log("loadingText", $scope.loadingText)
			if (idx == $scope.loadingText.length - 4){
				$scope.loadingText = $scope.loadingText.slice(0, idx + 1)
			}else{
				$scope.loadingText += "."
			}

		}, intervalLength);
	}
});
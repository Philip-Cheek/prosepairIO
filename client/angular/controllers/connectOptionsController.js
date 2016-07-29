angular.module('prosePair').controller('connectOptionsController', function($scope, $location, socketFactory, peerService){
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
			clearInterval(optionsTimer);
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

	function setLoadingText(loadingString, interval){
		if (!interval){
			interval = 400;
		}

		$scope.options.loading = true;

		if (optionsTimer){
			clearInterval(optionsTimer);
		}

		$scope.loadingText = loadingString;

		optionsTimer = setInterval(function(){
			var idx = $scope.loadingText.length - 1;
			while ($scope.loadingText[idx] == "." && idx > $scope.loadingText.length - 4){
				idx--;
			}

			if (idx == $scope.loadingText.length - 4){
				$scope.loadingString.slice(0, idx)
			}else{
				$scope.loadingString += "."
			}

		}, interval);
	}
});
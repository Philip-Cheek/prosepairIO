angular.module('prosePair').factory('intervalFactory', function($interval, $rootScope) {

	var promiseTimers = {};
	var factory = {};

	factory.setCountDown = function(promise, timeLeft, setScope, timeRanOut){
		if (promise in promiseTimers){
			$interval.cancel(promiseTimers[promise]);
		}

		promiseTimers[promise] = $interval(function(){
			
			if (timeLeft < 1){
				$interval.cancel(promiseTimers[promise]);
				timeRanOut();
			}

			setScope(timeLeft);
			timeLeft--;
		}, 1000);
	};

	factory.setLoadingEllipsis = function(loadingString, setScope, getScope, intervalLength){
		if ('ellipsis' in promiseTimers){
			$interval.cancel(promiseTimers.ellipsis);
		}

		if (!intervalLength){
			intervalLength = 400;
		}

		setScope(loadingString);

		promiseTimers.ellipsis = $interval(function(){
			var loadingText = getScope();

			var idx = loadingText.length - 1;
			while (loadingText[idx] == "." && idx > loadingText.length - 4){
				idx--;
			}

			if (idx == loadingText.length - 4){
				loadingText = loadingText.slice(0, idx + 1);
			}else{
				loadingText += ".";
			}

			setScope(loadingText);

		}, intervalLength);
	};

	factory.cancelTimer = function(promise){
		$interval.cancel(promiseTimers[promise]);

		if (promise in promiseTimers){
			delete promiseTimers[promise];
		}
	};

	return factory;

});

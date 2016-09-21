angular.module('prosePair', ['ngRoute'])
	.config(['$httpProvider','$routeProvider', function($httpProvider, $routeProvider){
		$routeProvider
            .when('/',{
                templateUrl: 'app/partials/library.html'
            })
        	.when('/connect/:mode?',{
            	templateUrl: 'app/partials/connect.html'
    		})
    		.when('/prose/:mode',{
    			templateUrl: 'app/partials/proseArena.html'
    		})
    		.when('/prompt/', {
    			templateUrl: 'app/partials/prompt.html'
    		})
	}]);
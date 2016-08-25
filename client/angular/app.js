angular.module('prosePair', ['ngRoute'])
	.config(['$httpProvider','$routeProvider', function($httpProvider, $routeProvider){
		$routeProvider
            .when('/',{
                templateUrl: 'angular/partials/library.html'
            })
        	.when('/connect/:mode?',{
            	templateUrl: 'angular/partials/connect.html'
    		})
    		.when('/prose/:mode',{
    			templateUrl: 'angular/partials/proseArena.html'
    		})
    		.when('/prompt/', {
    			templateUrl: 'angular/partials/prompt.html'
    		})
	}]);
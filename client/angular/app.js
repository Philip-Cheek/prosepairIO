angular.module('prosePair', ['ngRoute'])
	.config(['$httpProvider','$routeProvider', function($httpProvider, $routeProvider){
		$routeProvider
        	.when('/connect/:mode?',{
            	templateUrl: 'angular/partials/connect.html'
    		})
    		.when('/prose/:mode',{
    			templateUrl: 'angular/partials/proseArena.html'
    		})
	}]);
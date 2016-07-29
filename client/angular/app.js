angular.module('prosePair', ['ngRoute'])
	.config(['$httpProvider','$routeProvider', function($httpProvider, $routeProvider){
		$routeProvider
        	.when('/connect',{
            	templateUrl: 'angular/partials/connect.html'
    		})
	}]);
angular.module('prosePair').factory('socketFactory', ['$rootScope', function ($rootScope) {
  var socket = io.connect();
	var factory = {};

	factory.on = function(eventName, callback){
			socket.on(eventName, callback);
	}

	factory.emit = function(eventName, data){
			socket.emit(eventName, data);
	}

  return factory;

}]);
angular.module('prosePair').factory('bookFactory', ['$http', function ($http){
	var bookFactory = {};

	bookFactory.saveBook = function(bookInfo, peerList, callback){
		var info = {
			'bookInfo': bookInfo,
			'authors': peerList
		}

		$http.post('/saveBookEntry', info).success(function(result, callback){
			callback(result);
		})
	};

	return bookFactory;
}]);

angular.module('prosePair').controller('libraryController', function($scope, bookFactory){

	init();

	$scope.viewBook = function(book){
		bookFactory.viewBook(book);
	};

	$scope.sortBy = function(method){
		if (method == $scope.sortInfo.method){

			var sending = 'ascending';

			if ($scope.sortInfo.way == 'ascending'){
				sending = 'descending'
			}

			$scope.sortInfo.way = sending;
		}else{
			$scope.sortInfo.way = 'descending'

			$scope.sortInfo.method = method;
		}

		getBooks();
	};

	$scope.turnPage = function(dir){
		bookFactory.switchPage(function(books, min, max){
			$scope.books = books;
			$scope.min = min;
			$scope.max = max;
		});
	};

	$scope.giveFeedback = function(book, positive){
		if (book._id != "user"){
			bookFactory.registerFeedback(book, positive, function(lInt){
				book.likeTally += lInt;
				book.liked = positive;
				book.disliked = !positive;
			}, function(){
				removeBook(book._id)
			});
		}
	}

	function init(){
		$scope.min = true;
		$scope.max = false;

		$scope.sortInfo = {
			method: 'Date Added',
			way: 'descending'
		}

		getBooks();
	}

	function showBooks(page){
		$scope.books = bookList[$scope.page];
	}

	function getBooks(){
		bookFactory.getBooks(function(books, min, max){
			$scope.books = books;
			$scope.min = min;
			$scope.max = max;
		},0, $scope.sortInfo.method, $scope.sortInfo.way == 'ascending')
	}

	function getSkipVal(){
		var skip = 0;

		for (var i = 0; i < bookList.length; i++){
			skip += bookList[i].length;
		}

		return skip;
	}

	function removeBook(id){
		for (var i = 0; i < $scope.books.length; i++){
			if ($scope.books[i]._id == id){
				break;
			}
		}

		if ($scope.books.length > 0 && i < $scope.books.length){
			$scope.books.splice(i, 1)
		}
	}
	function setBookList(books){
		var index = 0;

		if (bookList.length > 0){

			while (bookList[bookList.length - 1].length < 25 && index < books.length){
				bookList[bookList.length - 1].push(books[index]);
				index++;
			}
		}

		while (index < books.length){
			var arr = [];

			while (arr.length < 25 && index < books.length){
				arr.push(books[index]);
				index++;
			}

			if (arr.length > 0){
				bookList.push(arr);
			}
		}
	}
});
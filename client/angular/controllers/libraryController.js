angular.module('prosePair').controller('libraryController', function($scope, bookFactory){
	$scope.min = true;
	$scope.max = false;

	getBooks();

	$scope.viewBook = function(book){
		bookFactory.viewBook(book);
	}

	$scope.turnPage = function(dir){
		bookFactory.switchPage(function(books, min, max){
			$scope.books = books;
			$scope.min = min;
			$scope.max = max;
		});
	}

	function showBooks(page){
		$scope.books = bookList[$scope.page];
	}

	function getBooks(){
		bookFactory.getBooks(function(books, min, max){
			$scope.books = books;
			$scope.min = min;
			$scope.max = max;
		})
	}

	function getSkipVal(){
		var skip = 0;

		for (var i = 0; i < bookList.length; i++){
			skip += bookList[i].length;
		}

		return skip;
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
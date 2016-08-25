angular.module('prosePair').controller('libraryController', function($scope, bookFactory){
	var bookList = [];

	$scope.page = 0;
	$scope.books = [];

	getBooks(true);
	console.log(bookList);

	$scope.turnPage = function(n){
		$scope.page += n
		console.log($scope.page)

		if ($scope.page < 0){
			$scope.page = 0;
		}else if ($scope.page >= bookList.length){
			getBooks(true);
		}else{
			showBooks();
		}
	}

	function showBooks(page){
		console.log(bookList)
		$scope.books = bookList[$scope.page];
	}

	function getBooks(show){
		var skip = getSkipVal();

		bookFactory.getBooks(function(books){
			setBookList(books);
			if (show){
				console.log('i wonder where this shows up')
				showBooks();
			}
		}, skip);
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

		console.log(books, books.length)
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
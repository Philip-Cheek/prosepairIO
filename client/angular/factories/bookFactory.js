angular.module('prosePair').factory('bookFactory', ['$http', 'popUpService', 'listService', function ($http, popUpService, listService){
	var factory = {};
	var characterCap = 1540;

	factory.getBooks = function(callback, skip, sortType, ascending, newVal){
		if (!skip){
			skip = 0;
		}
		
		if (!newVal){
			newVal = true;
		}

		if (!sortType || sortType == 'Date Added'){
			sortType = 'createdAt'
		}else if (sortType == 'Points'){
			sortType = 'likeTally'
		}

		var asc = "+";
		if (ascending){
			asc = "-";
		}

		$http.get('/latestBooks/' + skip + '/' + sortType + '/' + asc).success(function(result){
			if (result.status){
				formatBookList(newVal, result.books, result.count, callback);
			}
		});
	}


	factory.switchPage = function(callback, dir, sortInfo){
		if (!dir){
			dir = 'start';
		}

		listService.getCache('books', dir, function(books){
			var minMax = listService.getMinMax;
			callback(books, minMax.min, minMax.max);
		},function(){
			var skipVal = listService.getSkipVal('books')
			this.getBooks(callback, skipVal, sortInfo.sortType, sortInfo.way, false);
		});

	};

	factory.nextList = function(dir, callback){
		listService.getCache('books', dir, callback, function(){
			var skip = listService.getSkipVal();
			receiveBooks(callback, skip);
		});
	};


	factory.saveBook = function(inputInfo, init){
		var mode = inputInfo.modeRedirect;
		delete inputInfo.modeRedirect
		formatBookDoneModal(inputInfo, function(modalInfo){
			if (init){
				$http.post('/saveBookEntry', inputInfo).success(function(result){
					informModalSuccess(modalInfo, mode);
				});
			}else{
				informModalSuccess(modalInfo, mode);
			}
		});
	};

	factory.viewRecentSuccess = function(){
		var book = popUpService.getContent();
		formatViewFromDone(book);
	};

	factory.viewBook= function(book){
		formatViewFromObject(book);
	}


	factory.turnPage = function(page){
		var book = popUpService.getContent();
		book.page += page;
		var sum = 0
		for (var i =0; i < book.currentBody.length; i++){
			sum += book.currentBody[i].length;
		}
		console.log('THIS IS OUR WHAT SHOULD BE SKIPPED',sum);
		book.currentBody = getCurrentBody(book.page, book.textBody).page;
	};

	function getAuthorString(book){
		if (book.authors.length < 3){
			return book.authors.join(" and ");
		}else{
			var authorString = '';

			for (var i = 0; i < book.authors.length - 1; i++){
				authorString += book.authors[i] + ', '
			}
			return authorString + "and " + book.authors[i];
		}
	}

	function receiveBooks(callback, skip){
		if (!skip){
			skip = 0;
		}

		$http.get('/latestBooks').success(function(result){
			if (result.status){
				formatBookList(result.books, callback);
			}
		});
	}

	function getCurrentBody(page, content, cCap){
		if (!cCap){
			cCap = characterCap;
		}	

		var cLeft = cCap;
		var currentPage = [];
		var skipAmount = page * cCap;

		for (var i = 0; i < content.length && cLeft > 0; i++){
			if (skipAmount > 0){
				if (skipAmount < content[i].length){
					var appropriate = false;
					while (!appropriate && skipAmount > 0){
						var app = [" ", ".", "?", "!", '"', "'"];
					
						for (var x = 0; x < app.length; x++){
							appropriate = content[i][skipAmount] == app[x];
							if (appropriate){
								break;
							}
						}
					
						skipAmount--;
					}
					if (skipAmount + 1 < content[i].length){
						var sum = 0;
						for (var x = 0; x < i; x++){
							sum += content[x].length;
						}
						
						var leftP = content[i].substring(skipAmount + 1, skipAmount + 1 + cLeft);
						currentPage.push(leftP);
						cLeft -= leftP.length;
					}

					skipAmount = 0;
				}else{
					skipAmount -= content[i].length;
				}
			}else{
				if (cLeft < content[i].length){
					var appropriate = false;

					while (!appropriate && cLeft > 0){
						var app = [" ", ".", "?", "!", '"', "'"];
						
						for (var x = 0; x < app.length; x++){
							appropriate = content[i][cLeft] == app[x];
							if (appropriate){
								break;
							}
						}
						cLeft--;
					}
				}

				var newP = content[i].substring(0, cLeft + 1);

				if (newP.length > 0){
					currentPage.push(newP);
				}				
				
				cLeft -= newP.length;
			}
		}

		var cap = Math.ceil(content.join(' ').length/characterCap);
	 	return {'page': currentPage, 'cap': cap}
	}

	function getSplitPages(text, wordCap){

		if (!wordCap){
			wordCap = 10;
		}

		var words = text.split(' ');
		var start = 0;
		var pages = [];

		var pageCap = Math.ceil(words.length / wordCap);

		while (start < words.length){
			var sub  = words.slice(start, wordCap);
			start += sub.length;
			
			pages.push(sub.join(' '));
		}

		return {'pages': pages, 'cap': pageCap}
	}

	function formatViewFromObject(book){
		var bookText = getCurrentBody(0, book.textBody)
		var authorText = 'by ' + getAuthorString(book);

		book = {
			'content': {
				'message': 'You are viewing: ',
				'format': 'view',
				'title': book.title,
				'authorString': authorText,
				'points': 0,
				'textBody': book.textBody,
				'self': true,
				'page': 0,
				'currentBody': bookText.page,
				'cap': bookText.cap,
				'width': '33em',
				'height': '38em'
			},
			'modalButton': false,
			'status': true,
			'buttons': []
		}

		popUpService.showDialog(book);
	}

	function formatViewFromDone(modContent){
		var currentContent = getCurrentBody(0, modContent.mContent);

		book = {
			'content': {

				'message': 'You are viewing: ',
				'format': 'view',
				'title': modContent.title,
				'authorString': 'by ' + modContent.body[modContent.body.length - 1].text,
				'points': 0,
				'textBody': modContent.mContent,
				'self': true,
				'page': 0,
				'currentBody': currentContent.page,
				'cap': currentContent.cap,
				'width': '33em',
				'height': '38em'
			},
			'modalButton': false,
			'status': true,
			'buttons': []
		}

		popUpService.showDialog(book);
	}

	function formatBookList(newVal, books, count, callback){
		for (var i = 0; i < books.length; i++){
			books[i].liked = false;
			books[i].disliked = false;
			books[i].authorString = getAuthorString(books[i]);

			if(!('createdAt' in books[i])){
				books[i].dateAdded = listService.cleanDate(false);
			}else{
				books[i].dateAdded = listService.cleanDate(books[i].createdAt);
			}
		}

		sendBooksToCache(newVal, count, books, callback);
	}

	function sendBooksToCache(newVal, count, books, callback){
		listService.addCache(newVal, 'books', 15, books, count, function(list){
			var minMax = listService.getMinMax('books');
			callback(list, minMax.min, minMax.max);
		})
	}

	function informModalSuccess(oldModalInfo, mode, id){
		var duplInfo = {};

		for (var key in oldModalInfo){
			var newKey = key.toString()
			switch (newKey){
				case 'modalButton':
					duplInfo[newKey] = true;
					break;
				case 'loading':
					duplInfo[newKey] = {
						'status': false,
					};
					break;
				case 'buttons':
					duplInfo[newKey] = [
						{'name': 'Home', 'path': "/"},
						{'name': 'View', 'path': oldModalInfo.content.id},
						{'name': 'Next', 'path': "/connect/" + mode}
					];
				default: 
					if (newKey != "buttons"){
						duplInfo[newKey] = oldModalInfo[key];
					}
			}
		}

		popUpService.showDialog(duplInfo);

	}

	function cleanDate(date){
		if (!date){
			var d = new Date();
    		var curr_date = d.getDate();
    		var curr_month = d.getMonth() + 1; 
    		var curr_year = d.getFullYear();

    		return curr_date + "-" + curr_month + "-" + curr_year;

		}else{
			var parts = date.toString().split('T')[0].split('-')
    		return parts[1] + "-" + parts[2] + "-" + parts[0];
		}
    	
	}

	function formatBookDoneModal(bookInfo, callback){

		var authorString = bookInfo.authors.join(', ');
		
		var content = {

			'message': "Congratulations! You successfully saved:",
			'title': bookInfo.title,
			'format': 'done',
			'id': 'recentSuccess',
			'body': [
				{'text': 'Summary', 'ital': true}, 
				{'text': bookInfo.sampleBody, 'ital': false},
				{'text': 'Authors', 'ital': true},
				{'text': authorString, 'ital': false}
			],
			'mContent': bookInfo.textBody,
			'width': '20em',
			'height': '30em'
		}

		var modalInfo = {
			'loading': {'status': true, 'text': 'Saving'},
			'modalButton': false,
			'buttons': [],
			'content': content,
		}

		popUpService.showDialog(modalInfo);

		if (callback){
			callback(modalInfo);
		}
	}

	factory.registerFeedback = function(book, positive, updateScope, removeScope){
		var info = {
			'bookID': book._id,
			'disChange': 0,
			'likeChange': 0
		}

		if (positive && !prompt.liked){
			if (prompt.disliked){
				info.disChange = -1;
				updateScope(2);
			}else{
				info.disChange = 0;
				updateScope(1);
			}

			info.likeChange = 1;

		}else if (!positive && !prompt.disliked){
			if (prompt.liked){
				info.likeChange = -1;
				updateScope(-2);
			}else{
				info.likeChange = 0;
				updateScope(-1);
			}

			info.disChange = 1;
		}

		$http.post('/addBookFeedback', info).success(function(result){
			if (result.removed){
				removeScope();
			}
		});
	}

	return factory;
}]);

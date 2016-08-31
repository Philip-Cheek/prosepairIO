angular.module('prosePair').factory('bookFactory', ['$http', 'popUpService', 'listService', function ($http, popUpService, listService){
	var factory = {};

	factory.getBooks = function(callback, skip){
		if (!skip){
			skip = 0;
		}

		$http.get('/latestBooks/' + skip).success(function(result){
			if (result.status){
				formatBookList(result.books, result.count, callback);
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
			factory.getBooks(callback, skipVal);
		});

	}

	factory.nextList = function(dir, callback){
		listService.getCache('books', dir, callback, function(){
			var skip = listService.getSkipVal();
			receiveBooks(callback, skip);
		});
	}


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
		console.log("les take a real hard look at book", book)
		book.page += page;
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

	function getCurrentBody(page, content, wordCap){
		if (!wordCap){
			wordCap = 500;
		}

		var wSkip = page * wordCap;
		var wLeft = wordCap;
		var currentPage = [];
		
		for (var i = 0; i < content.length && wLeft > 0; i++){
			var words = content[i].split(' ');
			var start = wSkip;
			
			if (wSkip > 0){
				if (wSkip - words.length < 0){
					wSkip = 0;
				}else{
					wSkip -= words.length;
				}
			}
			
			if (wSkip === 0){
				var par = words.slice(start, start + wLeft)
				if (par.length > 0){
					wLeft -= par.length;
					currentPage.push(par.join(' '))
				}
			}
		}

		var cap = Math.ceil(content.join(' ').split(' ').length/wordCap);
		return {'page': currentPage, 'cap': cap}
	}

	function getSplitPages(text, wordCap){

		if (!wordCap){
			wordCap = 650;
		}

		var words = text.split(' ');
		var start = 0;
		var pages = [];

		var pageCap = Math.ceil(words.length / 650);

		while (start < words.length){
			var sub  = words.slice(start, wordCap);
			start += sub.length;
			
			pages.push(sub.join(' '));
		}

		return {'pages': pages, 'cap': pageCap}
	}

	function formatViewFromObject(book){
		console.log('is this a book', book)
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

	function formatBookList(books, count, callback){
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

		sendBooksToCache(count, books, callback);
	}

	function sendBooksToCache(count, books, callback){
		listService.addCache('books', 15, books, count, function(list){
			console.log('what?!')
			var minMax = listService.getMinMax;
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

	return factory;
}]);

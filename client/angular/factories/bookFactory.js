angular.module('prosePair').factory('bookFactory', ['$http', 'popUpService', function ($http, popUpService){
	var bookFactory = {};
	var bookList = [];

	bookFactory.getBooks = function(callback, skip){
		if (!skip){
			skip = 0;
		}

		$http.get('/latestBooks').success(function(result){
			if (result.status){
				callback(result.books)
			}
		});
	}

	bookFactory.saveBook = function(inputInfo, init){
		console.log('save book reached');
		var mode = inputInfo.modeRedirect;
		delete inputInfo.modeRedirect

		console.log('mode has been incorrect for some time', mode);
		console.log('les look at inputInfo', inputInfo)
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

	
	bookFactory.viewRecentSuccess = function(){
		var book = popUpService.getContent();
		formatViewFromDone(book);
	};


	bookFactory.turnPage = function(modContent){
		modContent.page += 1;
		modContent.currentBody = getCurrentBody(modContent.page, modContent.textBody).page;
	};

	function getCurrentBody(page, content, wordCap){
		console.log("GET CURRENT BODY CALLED");
		if (!wordCap){
			wordCap = 500;
		}

		var words = content.join(' ').split(' ');
		var start = page * wordCap;
		var stop = start + 500;

		var page = words.slice(start, stop).join(' ');
		var pageCap = Math.ceil(words.length/500);

		return {'page': page, 'cap': pageCap}
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
		var bookText = book.textBody.join(' ').trim();
		var authorText = 'by ' + book.authors.joing(', ')

		book = {
			'message': 'You are viewing: ',
			'format': 'view',
			'title': book.title,
			'authorString': authorText,
			'points': 0,
			'textBody': bookText,
			'self': true,
			'page': 0,
			'currentBody': getCurrentBody(modContent.mContent)
		}
	}

	function formatViewFromDone(modContent){
		console.log('formatviewfromdone, super done');
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
				'cap': currentContent.cap
			},
			'modalButton': false,
			'status': true,
			'buttons': []
		}

		console.log('checkDoneBook', book);
		popUpService.showDialog(book);
	}

	function informModalSuccess(oldModalInfo, mode, id){
		var duplInfo = {};

		for (var key in oldModalInfo){
			var newKey = key.toString()
			console.log('keycheck',newKey)
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
					console.log('id needs TO CHECK!!', oldModalInfo.id)
					duplInfo[newKey] = [
						{'name': 'Home', 'path': "/"},
						{'name': 'View', 'path': oldModalInfo.content.id},
						{'name': 'Next', 'path': "/connect/" + mode}
					];
					console.log(duplInfo.buttons);
				default: 
					if (newKey != "buttons"){
						console.log('this should not be called when buttons', newKey)
						duplInfo[newKey] = oldModalInfo[key];
					}
			}
		}

		console.log('i am so curious about dupl info', duplInfo)
		popUpService.showDialog(duplInfo);

	}

	function formatBookDoneModal(bookInfo, callback){
		console.log('format book reached');

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
		}

		var modalInfo = {
			'loading': {'status': true, 'text': 'Saving'},
			'modalButton': false,
			'buttons': [],
			'content': content,
		}

		console.log('calling format book modal for the verrrry first time')
		console.log('modalInfo')
		popUpService.showDialog(modalInfo);

		if (callback){
			console.log('what\'s so cool bout this!')
			callback(modalInfo);
		}
	}

	return bookFactory;
}]);

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

	bookFactory.saveBook = function(inputInfo){
		console.log('save book reached');
		var mode = inputInfo.modeRedirect;
		delete inputInfo.modeRedirect

		formatBookDoneModal(inputInfo, function(modalInfo){
			$http.post('/saveBookEntry', inputInfo).success(function(result){

				console.log(result)
				if (result.status){
					var duplInfo = {};

					for (var key in modalInfo){
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
								console.log('this should be called!!')
								duplInfo[newKey] = [
									{'name': 'Home', 'path': "/"},
									{'name': 'Next', 'path': "/connect/" + mode}
								];
								console.log(duplInfo.buttons);
							default: 
								if (newKey != "buttons"){
									console.log('this should not be called when buttons', newKey)
									duplInfo[newKey] = modalInfo[key];
								}
						}

						console.log('deep dupl check', JSON.parse(JSON.stringify(duplInfo)))
					}

					console.log('i am so curious about dupl info', duplInfo)
					popUpService.showDialog(duplInfo);
				} 
			});
		});
	};

	function getSplitPages(text, wordCap){

		if (!wordCap){
			wordCap = 650;
		}

		var words = text.split(' ');
		var start = 0;
		var pages = [];

		while (start < words.length){
			var sub  = words.slice(start, wordCap);
			start += sub.length;
			
			pages.push(sub.join(' '));
		}

		return pages;
	}

	function formatBookDoneModal(bookInfo, callback){
		console.log('format book reached');

		var authorString = bookInfo.authors.join(', ');
		
		var content = {

			'title': bookInfo.title,
			'body': [
				{'text': 'Sample', 'ital': false}, 
				{'text': bookInfo.sampleBody, 'ital': true},
				{'text': 'Authors', 'ital': true},
				{'text': authorString, 'ital': true}
			],
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

angular.module('prosePair').factory('bookFactory', ['$http', 'popUpService', function ($http, popUpService){
	var bookFactory = {};

	bookFactory.saveBook = function(inputInfo){
		console.log('save book reached');

		formatBookModal(inputInfo, function(modalInfo){
			$http.post('/saveBookEntry', inputInfo).success(function(result){

				console.log(result)
				if (result.status){
					var duplInfo = {};

					for (var key in modalInfo){
						console.log(key);
						switch (key.toString()){
							case 'modalButton':
								duplInfo[key] = true;
								break;
							case 'loading':
								duplInfo[key] = {
									'status': false,
								};
								break;
							case 'buttons':
								duplInfo[key] = [
									{'name': 'Home', 'path': ""},
									{'name': 'Next', 'path': "connect"}
								];
							default: 
								duplInfo[key] = modalInfo[key];
						}
					}

					popUpService.showDialog(duplInfo);
				} 
			});
		});
	};

	function formatBookModal(bookInfo, callback){
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

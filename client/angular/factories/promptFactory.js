angular.module('prosePair').factory('promptFactory', function($http, $location){
	var factory = {};
	var promptCache = [];

	factory.getPrompts = function(callback, pageIdx, sortType, skipValue){
		if (!pageIdx){
			pageIdx = 0;
		}

		var sType;
		if (!sortType || sortType == 'Date Added'){
			sType = "dateAdded"
		}else if (sortType == 'Points'){
			sType = 'points';
		}

		if (!skipValue){
			skipValue = 0;
		}

		$http.get('/getPrompts/' + sType + '/' + skipValue).success(function(result){
			console.log(result);
			if (result.status){

				var prompts = result.prompts;

			 	for (var p = 0; p < prompts.length; p++){
			 		factory.formatPrompt(prompts[p]);
			 	}

			 	console.log(prompts)

				if (prompts.length > 0){
					putIntoCache(prompts);
				}

				console.log(promptCache)
				if (promptCache.length > 0 && result.prompts.length > 0){
					console.log('this is correct!!')
					callback(pageIdx, promptCache[pageIdx]);
				}else if (promptCache.length > 0 && pageIdx == promptCache.length && result.prompts.length == 0){
					callback(pageIdx - 1, promptCache[pageIdx - 1])
				}else{
					callback(pageIdx, []);
				}

			}else{
			 	console.log('false status returned from /getPrompts');
			}
		});
	};

	factory.nextPage = function(callback, sortInfo, idx){
		if (!idx || idx > promptCache.length){
			idx = 0;
		}

		if (idx < promptCache.length){
			callback(idx, promptCache[idx]);
		}else if (idx == 0 || promptCache.length == 0){
			this.getPrompts(callback, sortInfo.type)
		}else{
			var skipValue = getSkipValue();
			console.log('this shoudl be skip value', skipValue)
		    this.getPrompts(callback, idx, sortInfo.method, skipValue)
		}
	}

	factory.setNewSortType = function(sortType, callback){
		promptCache = [];
		this.getPrompts(callback, sortType);
	}	

	factory.addPrompt = function(newPrompt, shiftScope, setID){
		this.formatPrompt(newPrompt, function(){
			reShiftCache(newPrompt, shiftScope);

			var prInfo = factory.cloneNewPrompt(newPrompt);
			delete prInfo._id;

			$http.post('/addPrompt', prInfo).success(function(result){
				if (result.status){
					console.log('cool man')
					setID(result.newID);
				}
			});
		});
	};

	factory.registerFeedback = function(prompt, positive, updateScope, removeScope){
		var info = {
			'promptID': prompt._id,
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

		$http.post('/addPromptFeedback', info).success(function(result){
			if (result.removed){
				removeScope();
			}
		});
	}

	factory.cloneNewPrompt = function(prompt){
		var clone = Object.create(Object.getPrototypeOf(prompt));
		var i, keys = Object.getOwnPropertyNames(prompt);

		for (i = 0; i < keys.length; i ++){
		    Object.defineProperty(clone, keys[i], Object.getOwnPropertyDescriptor(prompt, keys[i]));
		}

		clone._id = 'user';
		clone.liked = false;
		clone.disliked = false;

		return clone;
	}

	factory.formatPrompt = function(prompt, callback){
		prompt.liked = false;
		prompt.disliked = false;

		if(!('createdAt' in prompt)){
			prompt.dateAdded = cleanDate(false);
		}else{
			prompt.dateAdded = cleanDate(prompt.createdAt);
		}

		if (callback){
			callback();
		}
	}

	function reShiftCache(newItem, setShift){
		for (var p = promptCache.length - 1; p >= 0; p--){
			var currentPage = promptCache[p];

			if (currentPage.length == 20){
				promptCache.push([currentPage.pop()])
			}

			for (var i = currentPage.length; i > 0; i--){
				currentPage[i] = currentPage[i - 1];
			}
		
			if (p > 0){
				currentPage[i] = promptCache[p - 1].pop();
			}else{
				currentPage[i] = newItem;
			}
		
		}

		setShift(promptCache[0])
	}

	function putIntoCache(result){
		console.log('putIntoCacheCalled')
		console.log(result)
		for (var idx = 0; idx < result.length; idx++){

			var lastPage = promptCache.length - 1;

			while (promptCache.length > 0 && promptCache[lastPage].length < 20 && idx < result.length){

				if (notRepeat(result[idx]._id, lastPage)){
					lastPage.push(result[idx]);
				}

				if (promptCache.length == 20){
					break;
				}

				idx++;
			}

			var newPage = [];

			while (newPage.length < 20 && idx < result.length){
				if (promptCache.length == 0 || (promptCache.length > 0 && notRepeat(result[idx]._id, promptCache.length - 1))){
					console.log('COOL!!')
					newPage.push(result[idx]);
				}

				if (newPage.length == 20){
					break;
				}

				idx++;
			}

			if (newPage.length > 0){
				promptCache.push(newPage);
			}

		}

			

	}

	function notRepeat(pID, lastPNum){
		var lastPage = promptCache[lastPNum];
		console.log(lastPNum, 'pNUM!')
		for (var i = 0; i < lastPage.length; i++){
			if (pID == lastPage[i]._id){
				return false;
			}
		}

		return true;
	}

	function getSkipValue(){
		var skipVal = 0;

		for (var p in promptCache){
			skipVal += promptCache[p].length;
		}

		return skipVal;
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


	return factory;

});
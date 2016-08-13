angular.module('prosePair').factory('promptFactory', function($http){
	var factory = {};
	var promptCache = [];

	factory.getAllPrompts = function(callback, sortType, startValue, range){
		var gInfo = {};

		if (!sortType){
			sortType = "Date Added"
		}

		gInfo.sortType = sortType;

		if (startValue){
			gInfo.startValue = startValue;
		}

		if (range){
			gInfo.range = range;
		}



		$http.post('/getPrompts', gInfo).success(function(result){
			if (result.status){

				var prompts = result.prompts
				for (var prompt in prompts){
					this.formatPrompt(prompt);
				}
				promptCache.push(prompts)
				callback(prompts);
			}
		});
	};

	factory.next = function(callback, sortInfo, idx){
		if (!idx){
			idx = 0;
		}

		if (idx < promptCache.length){
			return promptCache[idx];
		}else if (idx == 0 || promptCache.length == 0){
			this.getAllPrompts(callback, sortInfo.type)
		}else{
			var startValue;
			var lcArr = promptCache[promptCache.length - 1];
			var lastItem = lcArr[lcArr.length - 1];

			if (sortInfo.method == 'Date Added'){
				startValue = lastItem.createdAt;
				getAllPrompts(callback, sortType, startValue)
			}else if (sortInfo.method == 'Points'){
				startValue = lastItem.likeTally;
			}

			if ('range' in sortInfo && sortInfo.range != 'all'){
				getAllPrompts(callback, sortType, startValue, range)
			}else{
				getAllPrompts(callback, sortType, startValue)
			}
		}
	}

	factory.setNewSortType = function(sortType, callback){
		promptCache = [];
		this.getAllPrompts(callback, sortType);
	}	

	factory.addPrompt = function(prInfo, callback){
		$http.post('/addPrompt', prInfo).success(function(result){
			if (result.status){
				console.log('cool man')
				callback(result.newID);
			}
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

	function putIntoCache(result, callback){
		
		for (var idx = 0; idx < result.length; idx++){

			var lastPage;

			if (promptCache.length > 0){
				lastPage = promptCache[promptCache.length - 1];
			}

			while (lastPage && lastPage.length < 20){
				lastPage.push(result[idx]);
				idx++;

				if (idx == result.length){
					return;
				}
			}

			var newPage = [];

			while (newPage.length < 20){
				newPage.page.push(result[idx]);
				idx++;
			}

			if (newPage.length > 0){
				pageCache.push(newPage);
			}

		}

			

	}

	function cleanDate(date){
		if (!date){
			var d = new Date();
    		var curr_date = d.getDate();
    		var curr_month = d.getMonth() + 1; 
    		var curr_year = d.getFullYear();

    		return curr_date + "-" + curr_month + "-" + curr_year;

		}else{
			console.log("unsure if this shall work, clean date createdAt", date)
			var parts = date.toString().split("-");
    		return new Date(parts[2], parts[1] - 1, parts[0]);
		}
    	
	}


	return factory;

});
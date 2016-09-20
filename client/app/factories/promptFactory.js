angular.module('prosePair').factory('promptFactory', function($http, $location, listService){
	var factory = {};
	var promptCache = [];
	var arenaPrompt = {};

	factory.giveArenaPrompt = function(prompt){
		arenaPrompt = prompt;
	};

	factory.getArenaPrompt = function(){
		return arenaPrompt;
	}


	factory.getPrompts = function(callback, sortType, way, skipValue){
		var sType, asc;
		if (!sortType || sortType == 'Date Added'){
			sType = "createdAt"
		}else if (sortType == 'Points'){
			sType = 'likeTally';
		}

		if (!skipValue){
			skipValue = 0;
		}
		console.log("WAY:", way)
		if (way == 'descending'){
			asc = '/-'
		}else{
			asc = '/+'
		}
		console.log('stype check',sType, skipValue);
		$http.get('/getPrompts/' + sType + '/' + skipValue + asc).success(function(result){
			if (result.status){

				var prompts = result.prompts;

			 	for (var p = 0; p < prompts.length; p++){
			 		factory.formatPrompt(prompts[p]);
			 	}

				listService.addCache(true, 'prompts', 20, prompts, result.count, function(prompts){
					var minMax = listService.getMinMax('prompts');
					callback(prompts, minMax.min, minMax.max);
				});

			}else{
			 	console.log('false status returned from /getPrompts');
			}
		});
	};

	factory.switchPage = function(callback, dir, sortInfo){
		if (!dir){
			dir = 'start';
		}

		listService.getCache('prompts', dir, function(prompts){
			var minMax = listService.getMinMax('prompts');
			console.log('here is minMAX', minMax)
			callback(prompts, minMax.min, minMax.max);
		},function(){
			var skipVal = listService.getSkipVal('prompts')
			factory.getPrompts(callback, sortInfo.method, skipVal);
		});

	}

	factory.setNewSortType = function(sortType, callback, way){
		listService.clearCache('prompts');
		this.getPrompts(callback, sortType, way);
	}	

	factory.addPrompt = function(newPrompt, shiftScope, setID){
		this.formatPrompt(newPrompt, function(){
			listService.reShiftCache('prompts',newPrompt, shiftScope);

			var prInfo = factory.cloneNewPrompt(newPrompt);
			delete prInfo._id;

			$http.post('/addPrompt', prInfo).success(function(result){
				if (result.status){
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
			prompt.dateAdded = listService.cleanDate(false);
		}else{
			prompt.dateAdded = listService.cleanDate(prompt.createdAt);
		}

		if (callback){
			callback();
		}
	}


	return factory;

});
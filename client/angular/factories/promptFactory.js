angular.module('prosePair').factory('promptFactory', function($http){
	var factory = {};

	factory.getAllPrompts = function(){
		console.log('let\'s skip for now');
	};

	factory.addPrompt = function(prInfo, callback){
		$http.post('/addPrompt', prInfo).success(function(result){
			if (result.success){
				callback(result.newID);
			}
		});
	};

	factory.registerFeedback = function(prompt, positive, updateScope, removeScope){
		var info = {
			'promptID': prompt._id;
			'disChange' = 0;
			'likeChange' = 0;
		}

		if (positive && !prompt.liked){
			if (prompt.disliked){
				info.disChange = -1;
				updateScope(2);
			}else{
				info.disChange = 0;
				updateScope(1);
			}

			likeChange = 1;

		}else if (!positive && !prompt.disliked){
			if (prompt.liked){
				info.likeChange = -1;
				updateScope(-2);
			}else{
				info.likeChange = 0;
				updateScope(-1);
			}

			disChange = 1;
		}

		$http.post('/addPromptFeedback', info).success(function(result){
			if (result.removed){
				removeScope();
			}
		};
	}

	factory.cloneNewPrompt = function(prompt)  {
    	var clone = Object.create(Object.getPrototypeOf($scope.newPrompt));
    	var i, keys = Object.getOwnPropertyNames($scope.newPrompt);

		for (i = 0; i < keys.length; i ++){
	        Object.defineProperty(clone, keys[i], Object.getOwnPropertyDescriptor(original, keys[i]));
	    }

	    clone._id = 'user';
		clone.liked = false;
		clone.disliked = false;

    	return clone;
	}


	return factory;
});
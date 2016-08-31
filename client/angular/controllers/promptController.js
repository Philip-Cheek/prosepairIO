angular.module('prosePair').controller('promptController', function($scope, peerService, promptFactory){

	initLocalScope();

	$scope.addPrompt = function(){
		var pText = $scope.newPrompt.text;
		if (isValidPrompt(pText)){
			var userPrompt = promptFactory.cloneNewPrompt($scope.newPrompt);

			promptFactory.addPrompt(userPrompt, function(unShift, min, max){
				if (unShift){
					$scope.prompts = unShift;
				}
				$scope.min = min;
				$scope.max = max;

				$scope.prompt = '';
			}, function(newID){
				var myPrompt = findByID('user');
				myPrompt._id = newID;
				console.log(myPrompt);
			});

		}else{
			console.log('whattt')
		}
	};

	$scope.userTyping = function(){
		if ($scope.error){
			$scope.error = '';
		}

		adjustCharLeft();
	}

	$scope.sortBy = function(type){
		$scope.sortInfo.method = type;
		promptFactory.setNewSortType(type, function(prompts, min, max){
			$scope.min = min; 
			$scope.max = max;

			$scope.prompts = prompts
		});
	}
	
	$scope.getFeedback = function(prompt, positive){
		console.log('this will be', prompt)
		if (prompt._id != "user"){
			promptFactory.registerFeedback(prompt, positive, function(lInt){
				prompt.likeTally += lInt;
				prompt.liked = positive;
				prompt.disliked = !positive;
			}, function(){
				var idx = findByID(prompt._id, true)
				prompts.splice(idxs, 1)
			});
		}
	};

	function initLocalScope(){

		$scope.prompts = [];
		$scope.sortInfo = {};
		$scope.sortInfo.method = "Date Added";
		$scope.newPrompt = {}
		$scope.newPrompt._id = 'user'
		$scope.charLeft = 220;
		$scope.max = false;
		$scope.min = true;

		setNewPrompt();

		promptFactory.getPrompts(function(prompts, min, max){
			$scope.max = max;
			$scope.min = min;
			console.log('prompts on frontent', prompts)
			if (prompts || prompt.length > 0){
				$scope.prompts = prompts;
			}
		});

	}

	function findByID(id, index){
		console.log($scope.prompts);
		for (var i = $scope.prompts.length - 1; i >= 0; i--){
			if ($scope.prompts[i]._id == id){
				if (!index){
					return $scope.prompts[i];
				}else{
					return i;
				}
			}
		}
	}

	$scope.changePage = function(dir){
		var sortInfo = {
			'method': $scope.sortInfo.method
		};

		promptFactory.switchPage(function(prompts, min, max){
			$scope.min = min;
			$scope.max = max;
			$scope.prompts = prompts;
		}, dir, sortInfo.method);
	};

	function figureMeOut(){
		var me = peerService.revealMyself();

		if (me){
			$scope.newPrompt.author = me;
		}
	}

	function setNewPrompt(){ 
		$scope.newPrompt = {
			'likeTally': 0,
			'author': 'Anonymous',
		};

		figureMeOut();
	};

	function getlatestPrompts(){

	}

	function adjustCharLeft(){
		var roomLeft = 220 - $scope.newPrompt.text.length;

		if (roomLeft < 0){
			$scope.newPrompt.text = $scope.newPrompt.text.slice(0,220)
		}else{
			$scope.charLeft = roomLeft;
		}
	}

	function isValidPrompt(txt){
		if (txt && txt.length < 10){
			$scope.error = 'Too Short'
			return false;
		}else if (txt && txt.length > 220){
			$scope.error = 'Too Long'
			return false;
		}

		return true;
	}
});
angular.module('prosePair').controller('promptController', function($scope, peerService, promptFactory){

	initLocalScope();

	$scope.addPrompt = function(){
		var pText = $scope.newPrompt.text;
		if (isValidPrompt(pText)){
			var userPrompt = promptFactory.cloneNewPrompt($scope.newPrompt);

			promptFactory.addPrompt(userPrompt, function(unShift){
				if (unShift){
					$scope.prompts = unShift;
				}
				$scope.pNum = 0;
			}, function(newID){
				console.log('caallllled')
				var myPrompt = findByID('user');
				myPrompt._id = newID;
				console.log(myPrompt);
			});

		}else{
			console.log('whattt')
		}
	};

	$scope.sortBy = function(type){
		$scope.sortInfo.method = type;

		promptFactory.setNewSortType(type, function(pNum, newProm){
			$scope.pNum = pNum;
			$scope.prompts = newProm;
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
		$scope.charLeft = 140;
		$scope.pNum = 0;

		setNewPrompt();

		promptFactory.getPrompts(function(pNum, prompts){
			$scope.pNum = pNum;

			if (prompts || prompt.length > 0){
				$scope.prompts = prompts;
			}

			console.log($scope.pNum)
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

	$scope.changePage = function(newP){
		var sortInfo = {
			'method': $scope.sortInfo.method
		}
		promptFactory.nextPage(function(nP, prompts){
			$scope.pNum = nP;
			$scope.prompts = prompts;
		}, sortInfo, newP)
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


	function isValidPrompt(txt){
		if (txt && txt.length < 10){
			$scope.error = 'Too Short'
			return false;
		}else if (txt && txt.length > 130){
			$scope.error = 'Too Long'
			return false;
		}

		return true;
	}
});
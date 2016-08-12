angular.module('prosePair').controller('promptController', function($scope, peerService, promptFactory){

	initLocalScope();

	$scope.addPrompt = function(){
		var pText = $scope.newPrompt.text;
		if (isValidPrompt(pText)){
			var userPrompt = promptFactory.cloneNewPrompt($scope.newPrompt);

			promptFactory.formatPrompt(userPrompt, function(){
				$scope.prompts.push(userPrompt);

				promptFactory.addPrompt($scope.newPrompt, function(newID){
					console.log('whaaat?!')
					var myPrompt = findByID('user');
					myPrompt._id = newID;
					console.log(myPrompt);
				});
			});

		}else{
			console.log('whattt')
		}
	};

	$scope.getFeedback = function(prompt, positive){
		if (prompt._id != "user"){
			promptFactory.registerFeedback(prompt, positive, function(lInt){
				prompt.likeTally += lInt;
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

		setNewPrompt();
	}

	function findByID(id, index){
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
	function figureMeOut(){
		var me = peerService.revealMyself();

		if (me){
			newPrompt.author = me;
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
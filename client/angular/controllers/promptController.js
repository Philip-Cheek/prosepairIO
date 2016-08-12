angular.module('prosePair').controller('proseArenaController', function($scope, peerService, promptFactory){

	$scope.prompts = [];
	$scope.sortMethod = "Date Added";
	$scope.newPrompt = {}

	setNewPrompt();
	figureMeOut();

	$scope.addPrompt = function(){
		var pText = $scope.newPrompt.text;
		if isValidPrompt($scope.newPrompt.text){

			var userPrompt = promptFactory.cloneNewPrompt($scope.newPrompt);

			setNewPrompt();
			$scope.prompts.push(newPrompt);

			promptFactory.addPrompt(newPrompt, function(newID){
				var myPrompt = findByID('user');
				myPrompt._id = newID;
			});
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
			'author': anonymous
		};

		figureMeOut();
	};

	function getlatestPrompts(){

	}

	function isValidPrompt(txt){
		if txt.length < 10{
			$scope.error = 'Too Short'
			return false;
		}else if txt.length > 130{
			$scope.error = 'Too Long'
			return false;
		}
	}
});
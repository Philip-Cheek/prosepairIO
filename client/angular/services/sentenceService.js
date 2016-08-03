angular.module('prosePair').service('sentenceService', function(){
	var service = {};


	service.isValid = function(sentence, midway){
		var errors = [];

		if (!midway){
			testLength(errors);
			midway = false;
		}

		isLikelyOneSentence(sentence, midway, errors);

		if (errors.length > 0){
			return {'status': false, 'errors': errors};
		}
			
		return {'status': true};
	}

	function isLikelyOneSentence(sentence, midway, errors){
		var quoteOpen = false;
		var twoSent = false;

		for(var ch = 0; ch < sentence.length - 1; ch++){
			if (sentence[ch] == '"' || sentence[ch] == "'"){
				if (ch < sentence.length - 1){
					if (sentence[ch] == "'"){
						if (isLikelyContraction(sentenc[ch + 1])){
							quoteOpen = !quoteOpen;
						}
					}else{
						quoteOpen = !quoteOpen;
					}
				}
			};

			if ((quoteOpen == false || (quoteOpen == true && !midway)) && (!twoSent)){
				if (isEndingPunct(sentence[ch])){
					console.log('we are endingPunct')
					var isNotChecks = [isNotEllipsis, isNotDecimal, isNotInitial, isLikelyNotFullStop]
					for (var run = 0; run < isNotChecks.length; run++){
						if (isNotChecks[run](sentence, ch) == false){
							break;
						}

						console.log('we are checking run', run)
					}

					if (run == isNotChecks.length){
						errors.push("Only one sentence at a time.");
						twoSent = true;
					}
				}
			}
		}
	}

	function isEndingPunct(letter){
		var endingPunct = [".", "!", "?"];

		for (var punc in endingPunct){
			if (endingPunct[punc] == letter){
				return true;
			}
		};

		return false;
	}

	function isNotDecimal(sentence, index){
		if (sentence.length >= 2 && index != sentence.length){
			if (isNaN(sentence[index + 1])){
				return false;
			}
		}

		return true;
	}

	function isNotInitial(sentence, index){
		if (index == 1 || (sentence.length > 2 && (sentence[index - 2] == " " || sentence[index - 2] == "."))){
			return /[A-Z]/.test(sentence[index - 1]);
		}

		return true;
	}

	function isLikelyNotFullStop(sentence, index){
		var titles = ['Mr.', 'Mrs.', 'Dr.', "Snr.", "Prof.", "Ms.", "etc.", "Sgt.", "viz."];
		var checkSubStr;
		var titleLength;

		for (var title in titles){
			titleLength = titles[title].length
			if (sentence.length > titleLength){
				checkSubStr = sentence.substring(sentence - titleLength, index + 1)
				if (checkSubStr == titles[title]){
					return false; 
				}
			}
		}

		return true;
	}
	function isNotEllipsis(sentence, index){
		if (index != sentence.length - 3){
			return true;
		}

		for (var inc = 0; inc < 3; inc++){
			if (sentence[index + inc] != "."){
				return true;
			}
		}

		return false;
	}

	function isLikelyContraction(nextLetter){
		contractionMostLikely = ["d", "l", "m", "r", "s", "t", "v"];

		for (var c in contractionMostLikely){
			if (netLetter == contractionMostLikely[c]){
				return true
			}
		};

		return false;
	}

	function testLength(errorArr){
		if (sentence.length > 115){
			errorArr.push('Sentence exceeds character limit of 115');
		}

		if (sentence.length < 5){
			errorArr.push('Your input has to be longer than that.')
		};
	}

	return service;
});

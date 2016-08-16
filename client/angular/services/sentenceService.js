angular.module('prosePair').service('sentenceService', function(){
	var service = {};

	service.isValid = function(sentence, midway){
		var errors = [];

		if (!midway){
			testLength(sentence, errors);
			var lastLetter = sentence[sentence.length - 1]
			if (!isEndingPunct(lastLetter)){
				errors.push("You must punctuate your sentence");
			}

			midway = false;
		}

		isLikelyOneSentence(sentence, midway, errors);

		if (errors.length > 0){
			return {'status': false, 'errors': errors};
		}
			
		return {'status': true};
	}

	service.checkWord = function(word){
		var errors = [];
		var vWord = vWord.trim();

		for (var i = 0; i < vWord.length; i++){
			if (vWord[i] == " " && i != vWord.length - 1){
				errors.push('Only one word per entry.')
				break;
			}
		}

		if (errors.length > 0){
			return {'status': false, 'errors': errors};
		}
	}

	service.validSample = function(book, sample){
		var paragraph;

		for (var p = 0; p < book.length; p++){

			paragraph = book[p];

			if (paragraph.indexOf(sample) == -1){

				break;

			}
		}

		return p == book.length;
	}

	function isLikelyOneSentence(sentence, midway, errors){
		var quoteOpen = false;
		var twoSent = false;

		for(var ch = 0; ch < sentence.length - 1; ch++){
			if (sentence[ch] == '"' || sentence[ch] == "'"){
				if (ch < sentence.length - 1){
					if (sentence[ch] == "'"){
						if (!(isLikelyContraction(sentence[ch + 1]))){
							quoteOpen = !quoteOpen;
						}
					}else{
						quoteOpen = !quoteOpen;
					}
				}
			};

			if ((quoteOpen == false || (quoteOpen == true && !midway)) && (!twoSent)){
				if (isEndingPunct(sentence[ch])){
					var isNotChecks = [isNotEllipsis, isNotDecimal, isNotInitial, isLikelyNotFullStop];
					for (var run = 0; run < isNotChecks.length; run++){
						if (isNotChecks[run](sentence, ch) == false){
							break;
						}

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
		var titles = ['Mr.', 'Mrs.', 'Dr.', "Snr.", "Sr.", "Prof.", "Ms.", "etc.", "Sgt.", "viz."];
		var checkSubStr;
		var titleLength;

		for (var title = 0; title < titles.length; title++){
			titleLength = titles[title].length
			if (index > titleLength){
				checkSubStr = sentence.substring(index - titleLength, index + 1)
				if (checkSubStr.trim() == titles[title].trim()){
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
		contractionMostLikely = ["d", "l", "m", "n", "r", "s", "t", "v"];

		for (var c in contractionMostLikely){
			if (nextLetter == contractionMostLikely[c]){
				return true
			}
		};

		return false;
	}

	function testLength(sentence, errorArr){
		if (sentence.length > 115){
			errorArr.push('Sentence exceeds character limit of 115');
		}

		if (sentence.length < 5){
			errorArr.push('Your input has to be longer than that.')
		};
	}

	return service;
});

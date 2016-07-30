angular.module('prosePair').service('sentenceService', function(){
	var service = {};

	service.isValid = function(sentence, midway){
		var errors = [];

		if (!midway){
			if (sentence.length > 115){
				errors.push('Sentence exceeds character limit of 115');
			}

			if (sentence.length < 5){
				errors.push('Your input has to be longer than that.')
			}
		}

		var quoteOpen = false;
		contractionMostLikely = ["d", "l", "m", "r", "s", "t", "v"]
		var endingPunct = [".", "!", "?"]
		var twoSent = false;
		for(var ch = 0; ch < sentence.length; ch++){
			if (sentence[ch] == '"' || sentence[ch] == "'"){
				if (ch < sentence.length - 1){
					for (var c in contractionMostLikely){
						if (sentence[ch + 1] == contractionMostLikely[c]){
							break;
						}
					}

					if (c == contractionMostLikely.length){
						quoteOpen = !quoteOpen;
					}
				}
			};

			for (var p in endingPunct){
				if (sentence[ch] == endingPunct && ch < sentence.length - 2 && sentence[ch + 2] != "." && sentence[ch + 1] != "."){
					if ((!quoteOpen || !midway) && (!twoSent){
						errors.push("Only one sentence at a time.");
						twoSent = true;
					}
				}
			}

			if (errors.length > 0){
				return {'status': false, 'errors': errors};
			}
			
			return {'status': true};
		}
	}

	return service;
}

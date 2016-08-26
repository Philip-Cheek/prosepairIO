var mongoose = require('mongoose');
var Prompt = mongoose.model('Prompt')

module.exports = (function(){

	return{

		getRandomPrompt: function(callback){
			Prompt.count().exec(function(err, count){
				if (err){
					console.log('error on prompt count', err);
					res.json({'status': false})
				}else{
					var rIndex = Math.floor(Math.random() * count);

					Prompt.findOne({}).skip(rIndex).exec(function(err, result){
						if (err){
							console.log("error on prompt rando querry", err);
						}else{
							callback(result);
						}
					});
				}
			});
		},

		getPrompts: function(req, res){
			var type = req.params.type;
			console.log('type check', type)
			if (type == "dateAdded"){
				sortByDate(function(status, prompts){
					if (!status){
						res.json({'status': false});
					}else{
						res.json({'status': true, 'prompts': prompts})
					}
				}, req.params.skipVal);
			}else if (type == "points"){
				sortByPoints(function(status, prompts){
					if (!status){
						res.json({'status': false});
					}else{
						res.json({'status': true, 'prompts': prompts})
					}
				}, req.params.skipVal);
			}
		},

		addPrompt: function(req, res){
			var info = req.body;

			info.likes = 0;
			info.dislikes = 0;

			var newPrompt = new Prompt(info);
			newPrompt.save(function(err, result){
				if (err){
					console.log('error on mongo save', err);
					res.json({'status': false});
				}else{
					console.log("prompt sucessfully saved to DB!");
					res.json({'status': true, 'newID': result._id});
				}
			});
		},

		addPromptFeedback: function(req, res){
			var pID = req.body.promptID;

			console.log('this is req', req.body)
			Prompt.findOne({'_id': pID}, function(err, result){
				if (err){
					console.log('error on add prompt feedback', err);
				}else{
					console.log('do we have a result', result);
					var newLikes = result.likes + req.body.likeChange;
					var newDislikes = result.dislikes + req.body.disChange;
					var newTally = newLikes - newDislikes;

					var votesOverall = newLikes + newDislikes;

					if ((newTally < 0 && votesOverall > 10) || (newTally < -5)){
						Prompt.remove({'_id': pID}, function(err, result){
							if (err){
								console.log('error on add prompt remove', err);
							}else{
								res.json({'removed': true})
							}
						});
					}else{
						Prompt.update({'_id': req.body.promptID}, {
							$set: {
								'likeTally': newTally,
								'likes': newLikes,
								'dislikes': newDislikes
							}
						}, function(err, result){
							if (err){
								console.log('error on add prompt update', err);
							}else{
								res.json({'removed': false});
							}
						});
					}
				}
			});
		}
	}
})();

function sortByPoints(callback, skipVal){
	if (!skipVal){
		skipVal = 0
	}else{
		skipVal = Number(skipVal);
	}

	Prompt.find({}).sort({'likeTally':-1}).limit(40)
	.skip(skipVal)
	.exec(
		function(err, result){
			if (err){
				console.log('err on sort by date with start value', err)
				callback(false);

			}else{
				console.log("success on find by date with start v")
				callback(true, result);
			}
		}
	);
}

function sortByDate(callback, skipVal){
	if (!skipVal){
		skipVal = 0
	}else{
		skipVal = Number(skipVal);
	}
	console.log('skip CHECK', skipVal)

	Prompt.find({}).sort({'createdAt':-1}).limit(40)
	.skip(skipVal)
	.exec(
		function(err, result){
			if (err){
				console.log('err on sort by date with start value', err);
				callback(false);
			}else{
				console.log("success on find by date with start v");
				callback(true, result);

			}
		}
	);
}

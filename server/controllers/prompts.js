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
			var skipVal = Number(req.params.skipVal);

			if (req.params.type){
				sortType = req.params.type;
			}

			console.log(req.params.asc)
			if (req.params.asc == '-'){
				sortType = '-' + sortType
			}

			console.log(sortType)
			Prompt.count().exec(function(err, count){
				Prompt.find({}).sort(sortType).skip(skipVal).exec(function(err, result){
					if (err){
						console.log('error on mongo book get', err);
						res.json({'status': false})
					}else{
						res.json({'status': true, 'prompts': result, 'count': count})
					}
				});
			});
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

			Prompt.findOne({'_id': pID}, function(err, result){
				if (err){
					console.log('error on add prompt feedback', err);
				}else{
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
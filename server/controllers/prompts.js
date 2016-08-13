var mongoose = require('mongoose');
var Prompt = mongoose.model('Prompt')

module.exports = (function(){
	sortType, startValue, range)

	function sortByDate(sortInfo, callback){
		if ('startValue' in sortInfo){

			var lastSeenDate = sortInfo.startValue;

			Prompt.find({'createdAt': {
				'$gt': new Date(greaterDate)}.
			}.sort({'createdAt':-1}).limit(40)
			.exec(
				function(err, result){
					if (err){
						console.log('err on sort by date with start value', err)
					}else{
						console.log("success on find by date with start v");
						callback(result)
					}
				}
			);

		}else{

			Prompt.find({}).sort({'createdAt':-1}).limit(40)
			.exec(
				function(err, result){
					if (err){
						console.log('err on sort by date with start value', err)
					}else{
						console.log("success on find by date with start v");
						callback(result)
					}
				}
			);
		}
	}

	return{

		getPrompts: function(req, res){
			var type = req.body.sortType;

			if (type = "Date Added"){

			}else if (type = "Points"){

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

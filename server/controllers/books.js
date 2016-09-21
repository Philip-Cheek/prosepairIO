var mongoose = require('mongoose');
var sanitize = require('mongo-sanitize');

var Book = mongoose.model('Book');


module.exports = (function(){
	return{

		saveBook: function(req, res){
			console.log('controller save book reached!');

			var bookInfo = {};
			var lArray = ['likeTally', 'likes', 'dislikes'];

			for (var key in req.body){
				bookInfo[key] = sanitize(req.body[key]);
			}

			for (var i = 0; i < lArray.length; i ++){
				bookInfo[lArray[i]] = 0;
			}

			var newBook = new Book(bookInfo);
			newBook.save(function(err, result){
				if (err){
					console.log('error on mongo book save', err);
					res.json({'status': false})
				}else{
					console.log("book sucessfully saved to DB!");
					res.json({'status': true});
				}
			})
		},

		addFeedback: function(req, res){
			var bID = req.body.bookID;

			Book.findOne({'_id': bID}, function(err, result){
				if (err){
					console.log('error on add prompt feedback', err);
				}else{

					var newLikes = result.likes + req.body.likeChange;
					var newDislikes = result.dislikes + req.body.disChange;
					var newTally = newLikes - newDislikes;
					var votesOverall = newLikes + newDislikes;

					if ((newTally < 0 && votesOverall > 10) || (newTally < -5)){
						Book.remove({'_id': bID}, function(err, result){
							if (err){
								console.log('error on add prompt remove', err);
							}else{
								res.json({'removed': true})
							}
						});
					}else{
						Book.update({'_id': bID}, {
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
		},

		getBooks: function(req, res){
			var skipVal = Number(req.params.skipVal);
			var sortType, aVal;

			if (req.params.type){
				sortType = req.params.type;
			}else{
				sortType = 'createdAt';
			}

			if (!req.params.asc || req.params.asc == "+"){
				sortType = "-" + sortType;
			}

			console.log(sortType);


			Book.count({}).exec(function(err, count){
				Book.find({}).sort(sortType).skip(skipVal).limit(50).exec(function(err, result){
					if (err){
						console.log('error on mongo book get', err);
						res.json({'status': false})
					}else{
						res.json({'status': true, 'books': result, 'count': count});
					}
				});
			});
		}
	}
})();

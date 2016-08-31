var mongoose = require('mongoose');
var Book = mongoose.model('Book')

module.exports = (function(){
	return{

		saveBook: function(req, res){
			console.log('controller save book reached!');

			var bookInfo = req.body;
			var lArray = ['likeTally', 'likes', 'dislikes'];

			for (var i = 0; i < lArray.length; i ++){
				bookInfo[lArray[i]] = 0;
			};

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

		getBooks: function(req, res){
			var skipVal = Number(req.params.skipVal);
			Book.count({}).exec(function(err, count){
				Book.find({}).skip(skipVal).limit(50).exec(function(err, result){
				if (err){
					console.log('error on mongo book get', err);
					res.json({'status': false})
				}else{
					console.log("books successfully fetched from the DB!", result);
					res.json({'status': true, 'books': result, 'count': count});
				}
			});
			}) 
		}
	}
})();

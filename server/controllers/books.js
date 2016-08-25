var mongoose = require('mongoose');
var Book = mongoose.model('Book')

module.exports = (function(){
	return{

		saveBook: function(req, res){
			console.log('controller save book reached!')
			var newBook = new Book(req.body);
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
			Book.find({}).limit(50).exec(function(err, result){
				if (err){
					console.log('error on mongo book get', err);
					res.json({'status': false})
				}else{
					console.log("books successfully fetched from the DB!", result);
					res.json({'status': true, 'books': result});
				}
			});
		}
	}
})();

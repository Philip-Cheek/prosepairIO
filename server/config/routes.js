var books = require('./../controllers/books.js')

module.exports = function(app){
	app.post('/saveBookEntry', function(req, res){
		console.log('save book entry reached')
		books.saveBook(req, res);
	})
}
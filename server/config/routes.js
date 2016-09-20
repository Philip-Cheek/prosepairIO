var books = require('./../controllers/books.js');
var prompts = require('./../controllers/prompts.js');

module.exports = function(app){
	app.post('/saveBookEntry', function(req, res){
		console.log('save book entry reached');
		books.saveBook(req, res);
	});

	app.post('/addPrompt', function(req, res){
		console.log('add prompt reached');
		prompts.addPrompt(req, res);
	});

	app.post('/addPromptFeedback', function(req, res){
		console.log('add prompt freedback reached');
		prompts.addPromptFeedback(req, res);
	});

	app.get('/getPrompts/:type/:skipVal/:asc', function(req, res){
		prompts.getPrompts(req, res);
	});

	app.get('/randomPrompt', function(req, res){
		prompts.getRandomPrompt(req, res);
	});

	app.get('/latestBooks/:skipVal/:type/:asc', function(req, res){
		books.getBooks(req, res);
	});

	app.post('/addBookFeedback', function(req, res){
		books.addFeedback(req, res);
	});
}
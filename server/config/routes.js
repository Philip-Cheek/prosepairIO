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

	app.get('/getPrompts/:type/:skipVal', function(req, res){
		prompts.getPrompts(req, res);
	});
}
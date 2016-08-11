var mongoose = require('mongoose');

var BookSchema = new mongoose.Schema({
	title: String,
	authors: [],
	textBody: [],
	sampleBody: String
},{
	timestamps: true
});

module.exports = mongoose.model('Book', BookSchema);
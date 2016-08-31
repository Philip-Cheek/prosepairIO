var mongoose = require('mongoose');

var BookSchema = new mongoose.Schema({
	title: String,
	authors: [],
	textBody: [],
	sampleBody: String,
	likeTally: Number,
	likes: Number,
	dislikes: Number
},{
	timestamps: true
});

module.exports = mongoose.model('Book', BookSchema);
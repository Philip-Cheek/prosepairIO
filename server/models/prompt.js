var mongoose = require('mongoose');

var PromptSchema = new mongoose.Schema({
	author: [],
	text: [],
	likeTally: Number,
	likes: Number,
	dislikes: Number
},{
	timestamps: true
});

module.exports = mongoose.model('Prompt', PromptSchema);
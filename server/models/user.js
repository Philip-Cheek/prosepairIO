var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	first_name: String,
	last_name: String,
	nickname: String,
	email: String,
	password: String
},{
	timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
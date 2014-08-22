var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var iGo = new Schema({
	user: {type: String},
	place: {type: String},
	date: {type: Date},
	desc: {type: String},
	people: [{
		user: String,
		resp: {type: String, enum:['N/A','no','yes','maybe']},
		seen: Boolean
	}]
});

module.exports = mongoose.model('IGo',iGo);
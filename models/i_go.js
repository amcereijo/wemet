var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	bcrypt = require('bcrypt'),
	SALT_IGO = 10;

var iGo = new Schema({
	user: {type: String, required: true},
	place: {type: String, required: true},
	date: {type: Date, required: true},
	desc: {type: String},
	pass: {type: String, select: false},
	people: [{
		user: {type: String, required: true},
		resp: {type: String, enum:['N/A','no','yes','maybe']},
		seen: Boolean
	}],
	deleted: {type: Boolean}
});

iGo.pre('save', function(next) {
	var igo = this;
	if(!igo.isModified('pass')) {
		return next();
	}
	bcrypt.genSalt(SALT_IGO, function(err, salt) {
		if(err) { return next(err); }
		bcrypt.hash(igo.pass, salt, function(err, hash) {
			if(err) { return next(err); }
			igo.pass = hash;
			next();
		});
	});
});

iGo.methods.comparePass = function(pass, callBack) {
	bcrypt.compare(pass, this.pass, function(err, isMatch) {
		if(err) {return cb(err);}
		cb(null, isMatch);
	});
};

module.exports = mongoose.model('IGo',iGo);
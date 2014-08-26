var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	bcrypt = require('bcrypt'),
	SALT_IGO = 10;

var iGo = new Schema({
	user: {type: String, required: true},
	parentId: {type: String},
	userTo: {type: String},
	place: {type: String, required: true},
	date: {type: Date, required: true},
	desc: {type: String},
	pass: {type: String, select: false},
	resp: {type: String, enum:['N/A','no','yes','maybe']},
	seen: Boolean,
	deleted: {type: Boolean}
});


iGo.pre('save', function(next) {
	var igo = this;
	if(!igo.isModified('pass')) {
		return next();
	}
	if(igo.pass) {
		bcrypt.genSalt(SALT_IGO, function(err, salt) {
			if(err) { return next(err); }
			bcrypt.hash(igo.pass, salt, function(err, hash) {
				if(err) { return next(err); }
				igo.pass = hash;
				next();
			});
		});
	}
});

iGo.pre('init', function(next, data) {
	//links to HATEOAS
	var url = '/api/igo/',
		links = [
			{method: 'get', self: url+data._id},
			{delete: url+data._id, method: 'post'},
			{response: url+data._id+'/resp', method: 'put'},
			{setSeen: url+data._id+'/seen', method: 'put'}
		];
  data._links = links;
  next();
});

iGo.methods.comparePass = function(pass, callBack) {
	bcrypt.compare(pass, this.pass, function(err, isMatch) {
		if(err) {return cb(err);}
		cb(null, isMatch);
	});
};

module.exports = mongoose.model('IGo',iGo);
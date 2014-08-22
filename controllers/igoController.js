var mongoose = require('mongoose'),
	IGoModel = mongoose.model('IGo');

// GET ALL
exports.findAllIgo = function(req, res){
	IGoModel.find(function(err, igos) {
		if(err) {
			res.send(500, err.message);
		}
		console.log('GEt /igo');
		res.status(200).jsonp(igos);
	});
}

//GET ONE
exports.findById = function(req, resp) {
	IGoModel.findById(req.params.id, function(err, igo){
		if(err) { resp.send(500, err.message); }
		console.log('GET /igo/'+req.params.id);
		resp.status(200).jsonp(igo);
	});
}

//POST create new
exports.addIgo = function(req, res) {
	console.log('POST:' + req.body);
	var postedIgo = req.body,
		people = [],
		i,
		totalPeople = postedIgo.people.length;
	for(i=0;i<totalPeople;i++){
		people.push({
			user: postedIgo.people[i].user,
			resp: 'N/A',
			seen: false
		});
	}
	var newIgo = new IGoModel({
			user: postedIgo.user,
			place: postedIgo.place,
			date: postedIgo.date,
			desc: postedIgo.desc,
			people: people
	});

	newIgo.save(function(err, newIgoC) {
		if(err){ res.send(500, err.message); }
		res.status(200).jsonp(newIgoC);
	});
}

//PUT update 
exports.updateIgo = function(req, res) {
	var body = req.body;
	IGoModel.findById(req.params.id, function(err, igo) {
		igo.user = body.user || igo.user;
		igo.place = body.place || igo.place;
		igo.date = body.date || igo.date;
		igo.desc = body.desc || igo.desc;
		var i, leng = igo.people.length;
		for(i=0;i<leng;i++) {
			var j, leng2 = body.people? body.people.length:0;
			for(j=0;j<leng2;j++) {
				if(body.people[j].user === igo.people[i].user) {
					igo.people[i].resp = body.people[j].resp || igo.people[i].resp;
					igo.people[i].seen = body.people[j].seen || igo.people[i].seen;
					j=leng2;
				}
			}
		}
		igo.save(function(err) {
			if(err) { res.send(500, err.message); }
			res.status(200).jsonp(igo);
		});
	});
}


//DELETE
exports.deleteIgo = function(req, res) {
	IGoModel.findById(req.params.id, function(err, igo) {
		igo.remove(function(err) {
			if(err) {res.send(500, err.message); }
			res.status(200);
		});
	});
}


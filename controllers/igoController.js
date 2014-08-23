var mongoose = require('mongoose'),
	IGoModel = mongoose.model('IGo'),
	getLinks = function(data) {
		var links = {_links: [
			{self: '/api/igos/'+data._id},
			{update: '/api/igos/'+data._id},
			{delete: '/api/igos/'+data._id},
			{remove: '/api/igo/'+data._id+'/remove'},
			{all: '/api/igos'}
		]};
		return links;
	};

// GET ALL
exports.findAllIgo = function(req, res){
	IGoModel.find(function(err, igos) {
		if(err) { res.status(500).send(err.message); }
		res.status(200).jsonp(igos);
	});
}

//GET ONE
exports.findById = function(req, res) {
	IGoModel.findById(req.params.id, function(err, igo){
		if(err) { res.status(500).send(err.message); }
		console.log('GET /igo/'+req.params.id);
		res.status(200).jsonp(igo);
	});
}

//POST create new
exports.addIgo = function(req, res) {
	console.log('POST:' + req.body);
	var postedIgo = req.body,
		people = [],
		i,
		totalPeople = postedIgo.people.length;
	for(i=0;i<totalPeople;i++) {
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
			pass: postedIgo.pass,
			people: people,
			deleted: false
	});

	newIgo.save(function(err, newIgoC) {
		if(err){ res.status(500).send(err.message); }
		res.status(201).jsonp(getLinks(newIgoC));
	});
}

//PUT update 
exports.updateIgo = function(req, res) {
	var body = req.body;
	IGoModel.findById(req.params.id, function(err, igo) {
		if(igo === null) { res.status(304).send('Resource not found!'); return; }

		igo.place = body.place || igo.place;
		igo.date = body.date || igo.date;
		igo.desc = body.desc || igo.desc;
		if(body.pass) {
			igo.pass = body.pass;	
		}
		igo.deleted = body.deleted || igo.deleted;
		var i, leng = igo.people.length;
		for(i=0;i<leng;i++) {
			var j, leng2 = body.people? body.people.length:0;
			for(j=0;j<leng2;j++) {
				if(body.people[j].user === igo.people[i].user) {
					igo.people[i].resp = body.people[j].resp || igo.people[i].resp;
					igo.people[i].seen = body.people[j].seen || igo.people[i].seen;
					j = leng2;
				}
			}
		}
		
		igo.save(function(err, newIgo) {
			if(err) { res.status(500).send(err.message); }
			res.status(200).jsonp(getLinks(newIgo));
		});
	});
}


//DELETE logical
exports.deleteIgo = function(req, res) {
	IGoModel.findById(req.params.id, function(err, igo) {
		if(err) { res.status(500).send(err.message); }
		if(igo === null) { res.status(304).send('Resource not found!'); return; }
		igo.deleted = true;
		igo.save(function(err) {
			if(err) {res.status(500).send(err.message); }
			res.status(204).send();
		});
	});
}

//DELETE forever
exports.removeIgo = function(req, res) {
	IGoModel.findById(req.params.id, function(err, igo) {
		if(err) { res.status(500).send(err.message); }
		if(igo === null) { res.status(304).send('Resource not found!'); return; }
		igo.remove(function(err) {
			if(err) {res.status(500).send(err.message); }
			res.status(204).send();
		});
	});
}

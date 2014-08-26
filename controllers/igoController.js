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
	},
	removeIgo = function(id) {
		IGoModel.findById(id, function(err, igo) {
			if(err) { return err.message; }
			if(igo === null) { return 'not found'; }
			igo.remove(function(err) {
				if(err) { return err.message; }
				return '';
			});
		});
	}

// GET ALL
exports.findAllIgo = function(req, res){
	IGoModel.find(function(err, igos) {
		if(err) { res.status(500).send(err.message); return; }
		res.status(200).jsonp(igos);
	});
}

//GET ALL for one user
exports.findUserIgo = function(req, res){
	IGoModel.find({})
		.where({deleted: false})
		.or([{ user: req.params.user, userTo: '' },
		 { userTo: req.params.user }])
		.exec(function (err, igos) {
		  if(err) { res.status(500).send(err.message); return; }
			res.status(200).jsonp(igos);
		});
}

//GET ONE
exports.findById = function(req, res) {
	IGoModel.findById(req.params.id, function(err, igo){
		if(err) { res.status(500).send(err.message); return; }
		console.log('GET /igo/'+req.params.id);
		var igoResult = igo.toObject();
		IGoModel.find({})
			.where({deleted: false})
			.where({parentId: igoResult._id})
			.exec(function (err, igos) {
				console.log('igos.length: '+igos.length);
			  if(err) { res.status(500).send(err.message); return; }
			 	igoResult.people = igos;
				res.status(200).jsonp(igoResult);
			});
	});
}

//POST create new
exports.addIgo = function(req, res) {
	var postedIgo = req.body,
		newIgo,
		savediGos = [],
		i,
		totalPeople = postedIgo.people.length,
		newIgoResponse,
		baseIgo = {
			user: postedIgo.user,
			userTo: '',
			place: postedIgo.place,
			date: postedIgo.date,
			desc: postedIgo.desc,
			pass: postedIgo.pass,
			resp: 'N/A',
			seen: true,
			deleted: false
		};

	newIgo = new IGoModel(baseIgo);

	newIgo.save(function(err, newIgoC) {
		if(err){ res.status(500).send(err.message); return; }

		newIgoResponse = getLinks(newIgoC);
		savediGos.push(newIgoC._id);
	
		for(i=0;i<totalPeople;i++) {
			baseIgo.userTo = postedIgo.people[i].user;
			baseIgo.seen = false;
			baseIgo.parentId = newIgoC._id;
			newIgo = new IGoModel(baseIgo);
			newIgo.save(function(err, newIgoC) {
				if(err){ 
					//rollback created igos
					for(var j=0;j<savediGos.length;j++) {
						removeIgo(savediGos[j]);	
					}
					res.status(500).send(err.message);
					return;
				}
				console.log('Saved igo people: ' + newIgoC._id);
				savediGos.push(newIgoC._id);
			});
		}
		res.status(201).jsonp(newIgoResponse);
	});
}

//PUT update resp field
exports.updateResp = function(req, res) {
	var body = req.body;
	IGoModel.findById(req.params.id, function(err, igo) {
		if(igo === null) { res.status(304).send('Resource not found!'); return; }

		igo.resp = body.resp || igo.resp;
		
		igo.save(function(err, newIgo) {
			if(err) { 
				res.status(500).send(err.message + 
					'. Accepted values: no, yes, maybe'); 
				return;
			}
			res.status(200).jsonp(getLinks(newIgo));
		});
	});
}

//PUT update seen field
exports.updateSeen = function(req, res) {
	var body = req.body;
	IGoModel.findById(req.params.id, function(err, igo) {
		if(igo === null) { res.status(304).send('Resource not found!'); return; }

		igo.seen = (body.hasOwnProperty('seen'))? body.seen : igo.seen;
		
		igo.save(function(err, newIgo) {
			if(err) { res.status(500).send(err.message); return; }
			res.status(200).jsonp(getLinks(newIgo));
		});
	});
}

//DELETE logical
exports.deleteIgo = function(req, res) {
	IGoModel.findById(req.params.id, function(err, igo) {
		if(err) { res.status(500).send(err.message); return; }
		if(igo === null) { res.status(304).send('Resource not found!'); return; }
		igo.deleted = true;
		igo.save(function(err) {
			if(err) {res.status(500).send(err.message); return; }
			res.status(204).send();
		});
	});
}

//DELETE forever
exports.removeIgo = function(req, res) {
	var response = removeIgo(req.params.id);
	if(response === 'not found') {
		res.status(304).send('Resource not found!');
	} else if(response !== '') {
		res.status(500).send(response);
	} else {
		res.status(204).send();
	}
}

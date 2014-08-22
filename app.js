var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	mongoose = require('mongoose');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride());

var router = express.Router();
router.get('/', function(req, res){
	res.send("hello world");
});

app.use(router);

mongoose.connect('mongodb://localhost/wemet', function(err, res){
	if(err) {
		throw err;
	}
	console.log('Connected to Database');
});

var models = require('./models/i_go')(app, mongoose);

var IgoController = require('./controllers/igoController');
//API routes
var igoRoutes = express.Router();
igoRoutes.route('/igo')
	.get(IgoController.findAllIgo)
	.post(IgoController.addIgo);
igoRoutes.route('/igo/:id')
	.get(IgoController.findById)
	.put(IgoController.updateIgo)
	.delete(IgoController.deleteIgo);
app.use('/api', igoRoutes);

app.listen(3000, function() {
	console.log("Node server runngin on http://localhost:3000");
});
var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	mongoose = require('mongoose'),
  cors = require('cors');

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride());

var router = express.Router();
router.get('/', function(req, res){
	res.send("hello world");
});

app.use(router);

mongoose.connect('mongodb://localhost/wemet', function(err, res){
	if(err) { throw err; }
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
	.delete(IgoController.deleteIgo);
igoRoutes.route('/igo/user/:user')
  .get(IgoController.findUserIgo);
igoRoutes.route('/igo/:id/remove')
  .delete(IgoController.removeIgo);
igoRoutes.route('/igo/:id/resp')
  .put(IgoController.updateResp);
igoRoutes.route('/igo/:id/seen')
  .put(IgoController.updateSeen);
app.use('/api', igoRoutes);


app.listen(3000, function() {
	console.log("Node server runngin on http://localhost:3000");
});
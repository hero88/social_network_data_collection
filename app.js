/**
 * New node file
 */
var express  = require('express');
var app      = express(); 					// create our app w/ express
var mongoose = require('mongoose'),
	Schema = mongoose.Schema; 				// mongoose for mongodb
var morgan = require('morgan'); 			// log requests to the console (express4)
var bodyParser = require('body-parser'); 	// pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var http = require('http');
var events = require('events');

	// configuration =================
	mongoose.connect('localhost'); 	// connect to mongoDB database on localhost	
	
	app.use(express.static(__dirname + '/public')); 				// set the static files location 
	app.use(morgan('dev')); 										// log every request to the console
	app.use(bodyParser.urlencoded({'extended':'true'})); 			// parse application/x-www-form-urlencoded
	app.use(bodyParser.json()); 									// parse application/json
	app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
	app.use(methodOverride());

	// define model =================		
	var pageData = mongoose.model('PageData',{		
		info : String,
		id : String,
		link : String,
		shares : String,
		likes : String,
		comments : String
	});	

pageData.remove(function(){});
	
var fb_client = http.createClient(80, "graph.facebook.com");
var fb_emitter = new events.EventEmitter();

	app.get('/api/fbdata', function(req,res){
		pageData.find(function(err, page){
			if (err) res.send(err);
			res.json(page);	
			console.log('get');
		});
	});

	app.post('/api/fbdata', function(req,res)
	{	
		var url = req.body.text;
		var request = fb_client.request("GET","/?id="+url, {"host":"graph.facebook.com"});
		console.log("[getData].url: " + url);
		
		request.addListener("response", function(response)
		{
			var body = "";
			response.addListener("data", function(data){
				body +=data;
			});
				
			response.addListener("end", function(){
				var data = JSON.parse(body);
				fb_emitter.emit("data", String(data));
				console.log("[getData].get: " + body);
				
				pageData.create(
				{
					info : url,
					id: String(data.id),
					link : String(data.link),
					shares : String(data.shares),
					likes : String(data.likes),
					comments : String(data.comments),
					done : false
				},function(err,page)
				{
					if (err) res.send(err);
					console.log('app.post: '+page);
					
					pageData.find(function(err, page)
					{
						if (err) res.send(err);
						res.json(page);		
						console.log(page);
					});
				});
			});		
		});
		request.end();		
	});
		
    app.delete('/api/fbdata/:page_id', function(req, res) {
        pageData.remove({
            _id : req.params.page_id
        }, function(err, page) {
            if (err)
                res.send(err);
            
            pageData.find(function(err, page) {
                if (err)
                    res.send(err)
                res.json(page);
            });
        });
    });
	
	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});	
	
	// listen (start app with node server.js) ======================================
	app.listen(3000, function(){
		console.log("Server running at port 3000");
	});	
//bring in dependencies
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
var schedule = require('node-schedule');
var request = require('request');
var fs = require('fs');
var apis_config = 'config/apis.json';
var Coin = require('./models/coin');
//connect to database
mongoose.connect(config.database);

//on connection to database
mongoose.connection.on('connected', () => {
	console.log('Connected to Database ' +config.database);
});

//on database error log error
mongoose.connection.on('error', (err) => {
	console.log('Database error: ' +err);
});

function readConfig(file){
    return JSON.parse(fs.readFileSync(file));
}
var apis_config_options = readConfig(apis_config);
//initialize app variable
const app = express();

//include file for user routes
const users = require('./routes/users');
const coinServer = require('./routes/coinServer')
//port number
const port = 3000;

// Set Static Folder. he called it public i'm calling it client
app.use(express.static(path.join(__dirname, 'client')));

//CORS middlware
app.use(cors());

//body parser middleware
app.use(bodyParser.json());

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//require passport config
require('./config/passport')(passport);

//pass in users variables
app.use('/users', users);
app.use('/coins', coinServer);
//index route
app.get('/', (req, res) => {
	res.send('Invalid Endpoint');
});

//make sure all routes go to the index.html
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/index.html'));
});

//start up that server
app.listen(port, (req, res) => {
	console.log('Server started on port ' + port);
});

var stored_coins = [];
function getAllCoins(){
	Coin.find({},'Symbol -_id', function(err,coins){
		stored_coins = coins;
		//console.log(coins);
	});
}
//schedule tasks for get all coins
var rule = schedule.scheduleJob("*/1 * * * *", function() {
	console.log('Creating Schedule for Get Coin List...');
	//get all existing coins from the database
	getAllCoins();
	request(apis_config_options.getCoins, function(err, response, body) {
		var res = JSON.parse(body);
		var result = res.Response;
		if(result == "Success"){
			
			var datasJSON = res.Data;
			var keys = Object.keys(datasJSON);
			
			for(var i = 0; i < keys.length ; i++){
				var Symbol = datasJSON[keys[i]].Symbol;
				//console.log(Symbol);
				var picked =  stored_coins.filter(function(value){ return value.Symbol==Symbol;});
				if(picked.length > 0){
					//console.log(Symbol + ' now existing');
				}
				else{
					var newCoin = new Coin();
					newCoin.Name = datasJSON[keys[i]].Name;
					newCoin.Symbol = Symbol;
					newCoin.CoinName = datasJSON[keys[i]].CoinName;
					newCoin.FullName = datasJSON[keys[i]].FullName;
					newCoin.Algorithm = datasJSON[keys[i]].Algorithm;
					newCoin.Url = datasJSON[keys[i]].Url;
					newCoin.ImageUrl = apis_config_options.apiDomain + datasJSON[keys[i]].ImageUrl;
					newCoin.ProofType = datasJSON[keys[i]].ProofType;
					newCoin.FullyPreminded = datasJSON[keys[i]].FullyPreminded;
					newCoin.TotalCoinSupply = datasJSON[keys[i]].TotalCoinSupply;
					newCoin.PreMindedValue = datasJSON[keys[i]].PreMindedValue;
					newCoin.TotalCoinsFreeFloat = datasJSON[keys[i]].TotalCoinsFreeFloat;
					newCoin.Sponsored = datasJSON[keys[i]].Sponsored;
					newCoin.AddedTimeStamp = Date.now();
					//console.log(newCoin);
					newCoin.save();
				}
				if(i == keys.length - 1){
					getAllCoins();
				}
			}
		}
		
	});
});
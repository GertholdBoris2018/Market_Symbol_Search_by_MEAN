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
var CoinTicker = require('./models/coinTicker');
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
const port = 4000;

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
		console.log(coins);
	});
}
var stored_coin_tickers = [];
function getAllCoinTickers(){
	CoinTicker.find({},'coinName -_id', function(err,coints){
		stored_coin_tickers = coints;
		//console.log(coins);
	});
	
}
//schedule tasks for get all coins
// var rule = schedule.scheduleJob("*/3 * * * *", function() {
// 	console.log('Creating Schedule for Get Coin List...');
// 	//get all existing coins from the database
// 	getAllCoins();
// 	request(apis_config_options.getCoins, function(err, response, body) {
// 		if(typeof body !== 'undefined'){
// 			var res = JSON.parse(body);
// 			var result = res.Response;
// 			if(result == "Success"){
				
// 				var datasJSON = res.Data;
// 				var keys = Object.keys(datasJSON);
				
// 				for(var i = 0; i < keys.length ; i++){
// 					var Symbol = datasJSON[keys[i]].Symbol;
// 					//console.log(Symbol);
// 					var picked =  stored_coins.filter(function(value){ return value.Symbol==Symbol;});
// 					if(picked.length > 0){
// 						//console.log(Symbol + ' now existing');
// 					}
// 					else{
// 						var newCoin = new Coin();
// 						newCoin.Name = datasJSON[keys[i]].Name;
// 						newCoin.Symbol = Symbol;
// 						newCoin.CoinName = datasJSON[keys[i]].CoinName;
// 						newCoin.FullName = datasJSON[keys[i]].FullName;
// 						newCoin.Algorithm = datasJSON[keys[i]].Algorithm;
// 						newCoin.Url = datasJSON[keys[i]].Url;
// 						newCoin.ImageUrl = apis_config_options.apiDomain + datasJSON[keys[i]].ImageUrl;
// 						newCoin.ProofType = datasJSON[keys[i]].ProofType;
// 						newCoin.FullyPreminded = datasJSON[keys[i]].FullyPreminded;
// 						newCoin.TotalCoinSupply = datasJSON[keys[i]].TotalCoinSupply;
// 						newCoin.PreMindedValue = datasJSON[keys[i]].PreMindedValue;
// 						newCoin.TotalCoinsFreeFloat = datasJSON[keys[i]].TotalCoinsFreeFloat;
// 						newCoin.Sponsored = datasJSON[keys[i]].Sponsored;
// 						newCoin.AddedTimeStamp = Date.now();
// 						//console.log(newCoin);
// 						newCoin.save();
// 					}
// 					if(i == keys.length - 1){
// 						getAllCoins();
// 						console.log('Schedule for Get Coin List Done.');
// 					}
// 				}
// 			}
// 		}
// 	});
// });

//schedule task for get ticker value per coin

var rule = schedule.scheduleJob("*/1 * * * *", function() {
	console.log('Creating Schedule for Get Coin Tickers Value...');
	//get all existing coins from the database
	getAllCoinTickers();
	request(apis_config_options.getTickerCoin, function(err, response, body) {
			//console.log(body);
			var res = [];
			try {
				res = JSON.parse(body);
			} catch (e) {
				console.log(e);
			}
			if(res.length > 0){
				res.forEach(function(item,idx,array){
					var symbol = item.id;
					var picked =  stored_coin_tickers.filter(function(value){ return value.coinName==symbol;});
		
					var newCoin = new CoinTicker();
					newCoin.coinName = item.id;
					newCoin.name = item.name;
					newCoin.symbol = item.symbol;
					newCoin.rank = item.rank;
					newCoin.price_usd = item['price_usd'] != null ? item['price_usd']: 0;
					newCoin.price_btc = item.price_btc;
					newCoin['24h_volume_usd'] = item['24h_volume_usd'] != null ? item['24h_volume_usd']: 0;
					newCoin['market_cap_usd'] = item['market_cap_usd'] != null ? item['market_cap_usd']: 0;
					newCoin['available_supply'] = item['available_supply'];
					newCoin['total_supply'] = item['total_supply'];
					newCoin['max_supply'] = item['max_supply'];
					newCoin['percent_change_1h'] = item['percent_change_1h'];
					newCoin['percent_change_24h'] = item['percent_change_24h'];
					newCoin['percent_change_7d'] = item['percent_change_7d'];
					newCoin['last_updated'] = item['last_updated'];
		
		
					if(picked.length > 0){
						var query = { coinName : symbol };
						var productToUpdate = {};
						productToUpdate = Object.assign(productToUpdate, newCoin._doc);
						delete productToUpdate._id;
						CoinTicker.findOneAndUpdate(query, productToUpdate , function(err){
							//if(err) console.log(err);
						});
					}
					else{
						newCoin.save();
					}
					if(idx === array.length - 1){
						getAllCoinTickers();
						console.log('Schedule for Get Coin Tickers Done.');
					}
				});
			}
			
		
	});
});

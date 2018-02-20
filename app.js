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
var CoinHistorical = require('./models/coinHistorical');
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

// var stored_coins = [];
// function getAllCoins(){
// 	Coin.find({},'Symbol -_id', function(err,coins){
// 		stored_coins = coins;
// 		console.log(coins);
// 	});
// }
// var stored_coin_tickers = [];
// function getAllCoinTickers(){
// 	CoinTicker.find({},'coinName -_id', function(err,coints){
// 		stored_coin_tickers = coints;
// 		//console.log(coins);
// 	});
	
// }
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;
console.log = function(d) { //
	log_file.write(util.format(d) + '\n');
	log_stdout.write(util.format(d) + '\n');
};

var stored_coins = [];
function getAllCoins(){
	CoinTicker.find({},'coinName -_id', function(err,coints){
		stored_coins = coints;
		// stored_coins.forEach(function(item, index, array){
		// 	console.log('https://api.bitscreener.com/api/v2/graphs/ohlc/' + item.coinName + '?interval=1d');
		// });
	});
}

var rule = schedule.scheduleJob("*/1 * * * *", function() {
	console.log('Creating Schedule for Get Coins...');
	//get all existing coins from the database
	getAllCoins();
	request(apis_config_options.getBitScreeners, function(err, response, body) {
		//console.log(body);
		var res = [];
		try {
			res = JSON.parse(body);
		} catch (e) {
			console.log(e);
		}
		if(res.length > 0){
			res.forEach(function(item,idx,array){
				var symbol = item.slug;
				var picked =  stored_coins.filter(function(value){ return value.coinName==symbol;});
	
				var newCoin = new CoinTicker();
				newCoin.coinName = item.slug;
				newCoin.name = item.name;
				newCoin.symbol = item.symbol;
				newCoin.rank = item.rank;
				newCoin.usd = item['usd'] != null ? item['usd'] : 0;
				newCoin.btc = item['btc'] != null ? item['btc'] : 0;
				newCoin['vlm'] = item['vlm'] != null ? item['vlm']: 0;
				newCoin['cap'] = item['cap'] != null ? item['cap']: 0;
				newCoin['since_ts'] = item['since_ts'] != null ? item['since_ts']:0;
				newCoin['p_1h'] = item['p_1h'] != null? Math.round(item['p_1h']*10000) / 100 : 0;
				newCoin['p_24h'] = item['p_24h'] != null? Math.round(item['p_24h'] * 10000) / 100 : 0;
				newCoin['p_7d'] = item['p_7d'] != null? Math.round(item['p_7d'] * 10000) / 100 : 0;
				newCoin['p_1M'] = item['p_1M'] != null? Math.round(item['p_1M'] * 10000) / 100 : 0;
				newCoin['p_6M'] = item['p_6M'] != null? Math.round(item['p_6M'] * 10000) / 100 : 0;
				newCoin['token'] = item['token'];
				newCoin['52w_l'] = item['52w_l'] != null? item['52w_l'] : 0;
				newCoin['52w_h'] = item['52w_h'] != null? item['52w_h'] : 0;
				newCoin['suppies'] = Math.round(item['cap'] / item['usd']);
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
					getAllCoins();
					console.log('Schedule for Get Coin Tickers Done.');
				}
			});
		}
	});
});

//schedule for coins' historical data -- it will be called at 9AM
var async = require('async');
var rp = require('request-promise');
var rule_historical = new schedule.RecurrenceRule();
rule_historical.dayOfWeek = [new schedule.Range(0,6)];
rule_historical.hour = 16;
rule_historical.minute = 18;
var moment = require('moment');
var time = moment();
var time_format = time.format('YYYY-MM-DD HH:mm:ss Z');
console.log(time_format);

var j = schedule.scheduleJob(rule_historical, function(){
	console.log('It is time to get Historical datas for coins...');
	// getAllCoins();
	// //make url request for getting histrocial data per coin
	// var calls = [];
	// var URLs = [];
	// var coinNames = [];
	// CoinHistorical.remove({}, function(err) {
	// 	console.log(err);
	// 	if (err) {
	// 		console.log(err)
	// 	} else {
	// 		CoinTicker.find({},'coinName -_id', function(err,coints){
				
	// 			coints.forEach(function(item,idx,array){
	// 				// console.log(item.coinName);
	// 				var cName = item.coinName;
	// 				var url = 'https://api.bitscreener.com/api/v2/graphs/ohlc/'+item.coinName+'?interval=1d';
	// 				URLs.push(url);
	// 				coinNames.push(cName);
	// 			});
	// 			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	// 			var responseArray = Promise.all(URLs.map((url,idx) => rp({
	// 				uri: url,
	// 				method: 'GET',
	// 				headers: {
	// 					'Connection': 'close'
	// 				}
	// 			}).then((response) => {
	// 				console.log(idx);
	// 				//console.log(response);
	// 				var res = null;
	// 				try {
	// 					res = JSON.parse(response);
	// 				} catch (e) {
	// 					console.log(e);
	// 				}
	// 				//console.log(res);
	// 				var ts = res['ts'];
	// 				//console.log(ts);
	// 				ts.forEach(function(item,idx,array){
	// 					var hist = new CoinHistorical();
	// 					hist.coinName = coinNames[idx];
	// 					hist.ts = ts[idx];
	// 					hist.open = res["open"][idx];
	// 					hist.high = res["high"][idx];
	// 					hist.low = res["low"][idx];
	// 					hist.close = res["close"][idx];
	// 					hist.vlm = res["vlm"][idx];
	// 					hist['max_cap'] = res["max_cap"][idx];
	// 					hist.save();
	// 				})
	// 			  	})
	// 			));
	// 		});
	// 	}
	// });
});


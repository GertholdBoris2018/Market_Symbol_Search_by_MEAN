
const mongoose = require('mongoose');
const config = require('../config/database');

//Coin Schema
const CoinTickerSchema = mongoose.Schema({
	coinName: {
        type: String,
        required: true
	},
	name: {
		type: String,
		required: true
	},
	symbol: {
		type: String,
		required: true
	},
	rank: {
		type: Number,
		required: true
    },
    'price_usd' : {
        type: Number
    },
    'price_btc' : {
        type: Number
    },
    '24h_volume_usd' : {
        type: Number
    },
    'market_cap_usd': {
        type: Number
    },
    'available_supply': {
        type: Number
    },
    'total_supply': {
        type:Number
    },
    'max_supply': {
        type: Number
    },
    'percent_change_1h': {
        type: Number
    },
    'percent_change_24h': {
        type: Number
    },
    'percent_change_7d':{
        type: Number
    },
    'last_updated':{
        type: Number
    }
});

const coinTicker = module.exports = mongoose.model('coinTickers',CoinTickerSchema);

//find coin by Symbol Name
module.exports.getCoinTickerBySymbolName = function(Symbol, callback){
    const query = {symbol: Symbol};
    coin.findOne(query, callback);
}


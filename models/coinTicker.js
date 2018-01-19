
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
    'usd' : {
        type: Number
    },
    'btc' : {
        type: Number
    },
    'vlm' : {
        type: Number
    },
    'cap': {
        type: Number
    },
    'p_1h': {
        type: Number
    },
    'p_7d': {
        type: Number
    },
    'p_24h': {
        type: Number
    },
    'p_1M': {
        type: Number
    },
    'p_6M': {
        type: Number
    },
    'since_ts':{
        type: Number
    },
    '52w_l' : {
        type: Number
    },
    '52w_h' : {
        type: Number
    },
    'token' : {
        type: String
    },
    'suppies':{
        type: Number
    }
});

const coinTicker = module.exports = mongoose.model('coinTickers',CoinTickerSchema);

//find coin by Symbol Name
module.exports.getCoinTickerBySymbolName = function(Symbol, callback){
    const query = {symbol: Symbol};
    coin.findOne(query, callback);
}


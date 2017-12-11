const mongoose = require('mongoose');
const config = require('../config/database');

//Coin Schema
const CoinSchema = mongoose.Schema({
	Name: {
        type: String,
        required: true
	},
	Symbol: {
		type: String,
		required: true
	},
	CoinName: {
		type: String,
		required: true
	},
	FullName: {
		type: String,
		required: true
    },
    Algorithm : {
        type: String
    },
    Url : {
        type: String
    },
    ImageUrl : {
        type: String
    },
    ProofType: {
        type: String
    },
    FullyPreminded: {
        type: String
    },
    TotalCoinSupply: {
        type:Number
    },
    PreMindedValue: {
        type: String
    },
    TotalCoinsFreeFloat: {
        type: String
    },
    Sponsored: {
        type: String
    },
    AddedTimeStamp:{
        type: Number
    }
});

const coin = module.exports = mongoose.model('coins',CoinSchema);

//find coin by Symbol Name
module.exports.getCoinBySymbolName = function(Symbol, callback){
    const query = {Symbol: Symbol};
    coin.findOne(query, callback);
}


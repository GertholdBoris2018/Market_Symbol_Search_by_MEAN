
const mongoose = require('mongoose');
const config = require('../config/database');

//Coin Schema
const CoinHistoricalSchema = mongoose.Schema({
	coinName: {
        type: String,
        required: true
    },
    ts : {
        type: Number,
        require : true
    },
    open : {
        type : String,
        required : true
    },
    high : {
        type : String,
        required : true
    },
    low : {
        type: String,
        required : true
    },
    close: {
        type : String,
        required : true
    },
    vlm : {
        type: String,
        required : true
    },
    max_cap: {
        type:String
    }
});

const coinHistorical = module.exports = mongoose.model('coinHistorical',CoinHistoricalSchema);

//find coin by coin Name
module.exports.getcoinHistoricalBycoinName = function(coinName, callback){
    const query = {coinName: coinName};
    coinHistorical.findOne(query, callback);
}


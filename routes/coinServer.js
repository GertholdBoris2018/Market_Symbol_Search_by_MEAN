const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

const User = require('../models/user');
var Coin = require('../models/coin');
var CoinTicker = require('../models/coinTicker');

//get all coins
router.get('/getAll', (req, res, next) => {
    Coin.find({}, function(err,coins){
        if(err) res.json({msg:'error',data:err});
        res.json({msg:'success',coins: coins});
	});
	
});

function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}
//get all coin tickers
router.get('/getAllTickers', (req, res, next) => {
    var sort = req.query.sort;
    var order = req.query.order;
    var page = req.query.page;
    
    var pageSize = 100;
    CoinTicker.find({},null,{sort:{rank: 'ascending'}}, function(err,coins){
        var cnt_all = coins.length;
        CoinTicker.find({},null,{sort:{rank: 'ascending'},limit:100, skip: (page - 1) * 100}, function(err,coins){
            coins.forEach(function(item,idx,array){
                if(idx == 0){
                    console.log(item['price_usd']);
                    console.log(addCommas(item['price_usd']));
                    item['price_usd'] = addCommas(item['price_usd']);
                    console.log(item['price_usd']);
                    console.log(item);
                }
            });
            if(err) res.json({msg:'error',data:err});
            res.json({total_count : cnt_all, items : coins});
        });
    });
    
    
	
});
module.exports = router;

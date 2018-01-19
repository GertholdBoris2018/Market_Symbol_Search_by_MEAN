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

function GetMaxandMin()
{

}

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
const util = require('util');


//get all coin tickers
router.get('/getAllTickers', (req, res, next) => {
    var sort = req.query.sort;
    var order = req.query.order;
    var page = req.query.page;
    var pageSize = 100;

    var pFilter = req.query.pFilter;
    var pStr = pFilter.split("_");
    var pfilLow, pfilHigh;
    var maxPrice = -1;

    var mFilter = req.query.mFilter;
    var mStr = mFilter.split("_");
    var mfilLow, mfilHigh;
    var maxMarket = -1;

    var vFilter = req.query.vFilter;
    var vStr = vFilter.split("_");
    var vfilLow, vfilHigh;
    var maxvolumn = -1;

    var cFilter = req.query.cFilter;
    var cStr = cFilter.split("_");
    var cfilLow, cfilHigh;
    var maxvolumn = -1;
    
    CoinTicker.find({},null,{sort:{usd: -1}, limit:1}, function(err, max){
        //get Max Price
        maxPrice = max[0].usd;
        pfilLow = !pStr[0] ? 0 : pStr[0];
        pfilHigh = !pStr[1] ? maxPrice : pStr[1];
        
        CoinTicker.find({},null,{sort:{cap: -1}, limit:1}, function(err, max){
            //get Max Market
            maxMarket = max[0].cap;
            mfilLow = !mStr[0] ? 0 : mStr[0];
            mfilHigh = !mStr[1] ? maxMarket : mStr[1];

            CoinTicker.find({},null,{sort:{'vlm': -1}, limit:1}, function(err, max){
                //get Max Market
                maxvolumn = max[0]['vlm'];
                vfilLow = !vStr[0] ? 0 : vStr[0];
                vfilHigh = !vStr[1] ? maxvolumn : vStr[1];
                CoinTicker.find({},null,{sort:{suppies: -1}, limit:1}, function(err, max){
                    maxcirculate = max[0].suppies;
                    cfilLow = !cStr[0] ? 0 : cStr[0];
                    cfilHigh = !cStr[1] ? maxcirculate : cStr[1];
                    //console.log("cfilLow => " + cfilLow + ", cHighLow => " + cfilHigh);
                    CoinTicker.find({$and : [{usd:{ $gte: pfilLow, $lte : pfilHigh }}, {cap:{ $gte : mfilLow, $lte : mfilHigh }}, {vlm:{ $gte : vfilLow, $lte : vfilHigh }},{suppies:{ $gte : cfilLow, $lte : cfilHigh }}]},null,{sort:{rank: 'ascending'}}, function(err,coins){
                        var cnt_all = coins.length;
                        CoinTicker.find({$and : [{usd:{ $gte: pfilLow, $lte: pfilHigh }}, {cap:{ $gte : mfilLow, $lte : mfilHigh }}, {vlm:{ $gte : vfilLow, $lte : vfilHigh }},{suppies:{ $gte : cfilLow, $lte : cfilHigh }}]},null,{sort:{rank: 'ascending'},limit:100, skip: (page - 1) * 100}, function(err,coins){
                            if(err) res.json({msg:'error',data:err});
                            res.json({total_count : cnt_all, items : coins});
                        });
                    });
                });

                
            });
        });
    });
        
});
module.exports = router;

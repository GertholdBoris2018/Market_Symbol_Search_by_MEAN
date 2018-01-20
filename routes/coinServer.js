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
    var maxcirculate = -1;

    var cFilter = req.query.cFilter;
    var cStr = cFilter.split("_");
    var cfilLow, cfilHigh;
    var maxvolumn = -1;

    var aFilter = req.query.aFilter;
    var aStr = aFilter.split("_");
    var afilLow, afilHigh;
    var whereQuery = [{}];
    
    if(pStr[0] != "" || pStr[1] != ""){
        pStr[0] == "" ? 
        whereQuery.push({usd : { $lte : pStr[1] }}) :
        pStr[1] == "" ? 
        whereQuery.push({usd : {$gte : pStr[0]}}) :
        whereQuery.push({usd:{ $gte : pStr[0], $lte :  pStr[1] }});
    }
         
    if(mStr[0] != "" || mStr[1] != ""){
        mStr[0] == "" ? 
        whereQuery.push({cap : { $lte : mStr[1] }}) :
        mStr[1] == "" ? 
        whereQuery.push({cap : {$gte : mStr[0]}}) :
        whereQuery.push({cap:{ $gte : mStr[0], $lte :  mStr[1] }});
    }
    if(vStr[0] != "" || vStr[1] != ""){
        vStr[0] == "" ? 
        whereQuery.push({vlm : { $lte : vStr[1] }}) :
        vStr[1] == "" ? 
        whereQuery.push({vlm : {$gte : vStr[0]}}) :
        whereQuery.push({vlm:{ $gte : vStr[0], $lte :  vStr[1] }});
    }
    if(cStr[0] != "" || cStr[1] != ""){
        cStr[0] == "" ? 
        whereQuery.push({suppies : { $lte : cStr[1] }}) :
        cStr[1] == "" ? 
        whereQuery.push({suppies : {$gte : cStr[0]}}) :
        whereQuery.push({suppies:{ $gte : cStr[0], $lte :  cStr[1] }});
    }
    
    if(aStr[0] != "" || aStr[1] != ""){
        aStr[0] == "" ? 
        whereQuery.push({since_ts:{ $gt  : aStr[1] }}) :
        whereQuery.push({since_ts:{ $lt : aStr[0] }});
    }

    CoinTicker.find({$and : whereQuery},null,{sort:{rank: 'ascending'}}, function(err,coins){
        var cnt_all = coins.length;
        CoinTicker.find({$and : whereQuery},null,{sort:{rank: 'ascending'},limit:100, skip: (page - 1) * 100}, function(err,coins){
            if(err) res.json({msg:'error',data:err});
            res.json({total_count : cnt_all, items : coins});
        });
    }); 
        
});
module.exports = router;

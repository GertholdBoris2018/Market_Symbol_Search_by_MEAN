const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

const User = require('../models/user');
var Coin = require('../models/coin');
var CoinTicker = require('../models/coinTicker');
var request = require('request');
var xml2js = require('xml2js');
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

function xmlFileToJs(xmlStr, cb) {
    xml2js.parseString(xmlStr, {}, cb);
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

    var tFilter = req.query.tFilter;
    
    // coin type filtering
    if(tFilter != "")
    {
        whereQuery.push({token : tFilter});
        console.log(whereQuery);
    }
    
    // price filtering
    if(pStr[0] != "" || pStr[1] != ""){
        pStr[0] == "" ? 
        whereQuery.push({usd : { $lte : pStr[1] }}) :
        pStr[1] == "" ? 
        whereQuery.push({usd : {$gte : pStr[0]}}) :
        whereQuery.push({usd:{ $gte : pStr[0], $lte :  pStr[1] }});
    }

    //market cap filtering
    if(mStr[0] != "" || mStr[1] != ""){
        mStr[0] == "" ? 
        whereQuery.push({cap : { $lte : mStr[1] }}) :
        mStr[1] == "" ? 
        whereQuery.push({cap : {$gte : mStr[0]}}) :
        whereQuery.push({cap:{ $gte : mStr[0], $lte :  mStr[1] }});
    }

    //volume 24h filtering
    if(vStr[0] != "" || vStr[1] != ""){
        vStr[0] == "" ? 
        whereQuery.push({vlm : { $lte : vStr[1] }}) :
        vStr[1] == "" ? 
        whereQuery.push({vlm : {$gte : vStr[0]}}) :
        whereQuery.push({vlm:{ $gte : vStr[0], $lte :  vStr[1] }});
    }

    //circulating supplies filtering
    if(cStr[0] != "" || cStr[1] != ""){
        cStr[0] == "" ? 
        whereQuery.push({suppies : { $lte : cStr[1] }}) :
        cStr[1] == "" ? 
        whereQuery.push({suppies : {$gte : cStr[0]}}) :
        whereQuery.push({suppies:{ $gte : cStr[0], $lte :  cStr[1] }});
    }
    
    //coin age filtering
    if(aStr[0] != "" || aStr[1] != ""){
        aStr[0] == "" ? 
        whereQuery.push({since_ts:{ $gt  : aStr[1] }}) :
        whereQuery.push({since_ts:{ $lt : aStr[0] }});
    }

    //performance filtering
    var ppFilter = req.query.ppFilter;
    var pDays = "", pDaysValue,pRanges;
    console.log("ppfilter => " + ppFilter);
    if(ppFilter != ""){
        pDays = "p_" + ppFilter.split(":")[0];
        pDaysValue = ppFilter.split(":")[1];
        pRanges = pDaysValue.split("_");
        console.log(pDays);
        var obj = {};
        obj[pDays] =  pRanges[0] == "" ? { $lt  : pRanges[1] } : { $gt  : pRanges[0] };
        whereQuery.push(obj);
    }

    //Order filtering
    var oFilter = req.query.oFilter;
    var oType, oField;
    oType = oFilter.split(":")[0];
    oField = oFilter.split(":")[1];
    var sortQuery = {};
    sortQuery[oType] = oField;
    
    //get page count
    var pCount = parseInt(req.query.pageCount);

    console.log(pCount);
    CoinTicker.find({$and : whereQuery},null,{sort:sortQuery}, function(err,coins){
        var cnt_all = coins.length;
        CoinTicker.find({$and : whereQuery},null,{sort:sortQuery,limit:pCount, skip: (page - 1) * pCount}, function(err,coins){
            if(err) res.json({msg:'error',data:err});
            res.json({total_count : cnt_all, items : coins});
        });
    }); 
        
});
// var sql = require("mssql");
router.get('/getHighs', (req, res, next) => {
    console.log('getting Highs');
    
    var page = req.query.page;
    var pageCount = parseInt(req.query.pageCount);
    var selectedHighs = req.query.selectedHighs;
    console.log('page => ' + page);
    console.log('pageCount => ' + pageCount);
    console.log('selectedHighs => ' + selectedHighs);
    var url = 'http://204.12.62.182/cryptoservice/ServiceCS.asmx/getHighs?page='+page+'&pageCount='+pageCount+'&selectedHighs='+selectedHighs;
    //get page count
    request(url, function(err, response, body) {
		console.log(body);
		xmlFileToJs(body, function (err, obj) {
            if (err) throw (err);
            console.log(obj.returnType.total_count);
            var tCnt = parseInt(obj.returnType.total_count[0]);
            console.log(obj.returnType.items[0].jsonCoinInfo);
            res.json(
                    {total_count : tCnt, 
                    items : obj.returnType.items[0].jsonCoinInfo});
        });
	});
    // res.json(
    //     {total_count : 3, 
    //     items : [{rank:'1',coinName: 'bitcoin'},
    //     {rank:'2',coinName: 'etherum'},
    //     {rank:'3',coinName: 'ripple'}]});
    

});
router.get('/getLows', (req, res, next) => {
    console.log('getting Lows');
    
    var page = req.query.page;
    var pageCount = parseInt(req.query.pageCount);
    var selectedLows = req.query.selectedLows;
    console.log('page => ' + page);
    console.log('pageCount => ' + pageCount);
    console.log('selectedLows => ' + selectedLows);
    var url = 'http://204.12.62.182/cryptoservice/ServiceCS.asmx/getLows?page='+page+'&pageCount='+pageCount+'&selectedLows='+selectedLows;
    //get page count
    request(url, function(err, response, body) {
		console.log(body);
		xmlFileToJs(body, function (err, obj) {
            if (err) throw (err);
            console.log(obj.returnType.total_count);
            var tCnt = parseInt(obj.returnType.total_count[0]);
            console.log(obj.returnType.items[0].jsonCoinInfo);
            res.json(
                    {total_count : tCnt, 
                    items : obj.returnType.items[0].jsonCoinInfo});
        });
	});
    // res.json(
    //     {total_count : 3, 
    //     items : [{rank:'1',coinName: 'bitcoin'},
    //     {rank:'2',coinName: 'etherum'},
    //     {rank:'3',coinName: 'ripple'}]});
    

});

module.exports = router;

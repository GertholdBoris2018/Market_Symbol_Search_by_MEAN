const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

const User = require('../models/user');
var Coin = require('../models/coin');


//Profile
router.get('/getAll', (req, res, next) => {
    Coin.find({}, function(err,coins){
        if(err) res.json({msg:'error',data:err});
        res.json({msg:'success',coins: coins});
	});
	
});

module.exports = router;

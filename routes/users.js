const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

const User = require('../models/user');

//Register new user
router.post('/register', (req, res, next) => {
		let newUser = new User({
			name: req.body.name,
			email: req.body.email,
			username: req.body.username,
			password: req.body.password
		});

		User.addUser(newUser, (err, user) => {
			if(err){
				res.json({success: false, msg:'Failed to register user'});
			} else{
				res.json({success: true, msg:'User Registered'});
			}
		});
});

//Authenticate
router.post('/authenticate', (req, res, next) => {
		const username = req.body.username;
		const password = req.body.password;

		//check and see if there is a user with that username
		User.getUserByUsername(username, (err, user) => {
				if(err) throw err;
				//if not, send them a message
				if(!user){
					return res.json({success: false, msg: 'OH NO! User not found!'});
				}
				//if there is a user check to see if the password is a match
				User.comparePassword(password, user.password, (err, isMatch) => {
						if(err) throw err;
						//if password is right update give token and send back json
						if(isMatch){
							const token = jwt.sign(user, config.secret, {
								//how long does the token last before the user has to log in again?
								expiresIn: 604800 // 1 week in seconds
							});

							//send back some json data with userdata
							res.json({
								success: true,
								token: 'JWT ' +token,
								user: {
									id: user._id,
									name: user.name,
									username: user.username,
									email: user.email
								}
							});
						}
						//if password is wrong send a message
						else {
								return res.json({success: false, msg: 'OH NO! Wrong password!'});
						}
				});
		});
});

//Profile
router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res, next) => {
		res.json({user: req.user});
});

module.exports = router;

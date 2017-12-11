//bring in dependencies
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');

//connect to database
mongoose.connect(config.database);

//on connection to database
mongoose.connection.on('connected', () => {
	console.log('Connected to Database ' +config.database);
});

//on database error log error
mongoose.connection.on('error', (err) => {
	console.log('Database error: ' +err);
});

//initialize app variable
const app = express();

//include file for user routes
const users = require('./routes/users');

//port number
const port = 3000;

// Set Static Folder. he called it public i'm calling it client
app.use(express.static(path.join(__dirname, 'client')));

//CORS middlware
app.use(cors());

//body parser middleware
app.use(bodyParser.json());

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//require passport config
require('./config/passport')(passport);

//pass in users variables
app.use('/users', users);

//index route
app.get('/', (req, res) => {
	res.send('Invalid Endpoint');
});

//make sure all routes go to the index.html
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/index.html'));
});

//start up that server
app.listen(port, (req, res) => {
	console.log('Server started on port ' + port);
});

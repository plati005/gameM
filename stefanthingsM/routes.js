var express = require('express');
var router = express.Router();
var database = require('./database');

//routing

//initial get
router.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/signin.html');
});

//response from signing in
router.post('/',function(req, res) {
	database.isValidPassword(req.body, function (callback_validation) {
		if (callback_validation)
			res.sendFile(__dirname + '/client/index.html');
		else
			res.sendFile(__dirname + '/client/signinfail.html');
	});
});

//go to sign up page (could be get instead of post)
router.post('/SignUp',function(req, res) {
	res.sendFile(__dirname + '/client/signup.html');
});

//go to game (could be get instead of post)
router.post('/Guest',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

//response from sign up
router.post('/SignIn',function(req, res) {
	database.isUsernameTaken(req.body, function (callback_validation) {
		if (callback_validation)
			res.sendFile(__dirname + '/client/signinfail.html');
		else {
			database.addUser(req.body, function() {
				res.sendFile(__dirname + '/client/signin.html');
			});
		}
	});
});


module.exports = router;
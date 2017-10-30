var express = require('express');
var router = express.Router();
var database = require('./database');

//routing
router.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/signin.html');
});

router.post('/',function(req, res) {
	database.isValidPassword(req.body, function (callback_validation) {
		if (callback_validation)
			res.sendFile(__dirname + '/client/index.html');
		else
			res.sendFile(__dirname + '/client/signinfail.html');
	});
});

router.post('/SignUp',function(req, res) {
	res.sendFile(__dirname + '/client/signup.html');
});

router.post('/Guest',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

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
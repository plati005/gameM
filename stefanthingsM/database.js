//TODO: review 'mean stack login' on youtube
//TODO: review angularjs + firebase also by travery media on youtube
//TODO: stop using node.js, move everything to client side
//TODO: figure out anti-cheating using client side only (angular options?)
//TODO: test passing the player's x and y coordinates to firebase, if it doesn't work then plan on storing player's x and y on server amazon ec2 to avoid cheating, what if we don't care about cheating? put player's x and y on client (make some way to cover them via angluar?) and socket them through amazon iot? what is faster 1.ec2 or 2.iot? maybe quakejs works by 3.creating local server??????? maybe 4.firebase faster


//database
var USERS = {
	//username:password
	'asd':'asd',
	'asd1':'asd1',
	'asd2':'asd2'
};

//database functions
module.exports = {
	isValidPassword:function(data, callback) {
		callback(USERS[data.username] === data.password);
	},

	isUsernameTaken:function(data, callback) {
		callback(USERS[data.username]);
	},

	addUser:function(data, callback) {
		USERS[data.username] = data.password;
		callback();
	}
};
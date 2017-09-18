var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});
//debugging flag
var DEBUG = true;
 
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
 
serv.listen(3000);
console.log('listening on port 3000');

//socket list and player list with socket ids
var SOCKET_LIST = {};

//Entity - intial building block
Entity = function(type,id,x,y,spdX,spdY,width,height,img){
	var self = {
		type:type,
		id:id,
		x:x,
		y:y,
		spdX:spdX,
		spdY:spdY,
		width:width,
		height:height,
		img:img,
		number:"" + Math.floor(10 * Math.random())
	};
	
	//entity update method using updatePosition and draw
	self.update = function(){
		self.updatePosition();
		//self.draw();
	}
	
	/*/draw onto the canvas
	self.draw = function(){	
		//offset from player
		var x = self.x - player.x;
		var y = self.y - player.y;
		//offset from center
		x += WIDTH/2;
		y += HEIGHT/2;
		//offset image width
		x -= self.width/2;
		y -= self.height/2;
		
		//actual draw of image
		ctx.drawImage(self.img, 0,0, self.img.width, self.img.height, x, y, self.width, self.height);
	}
	*/
	
	self.getDistance = function(entity2){   //return distance (number)
		var vx = self.x - entity2.x;
		var vy = self.y - entity2.y;
		return Math.sqrt(vx*vx+vy*vy);
	}

	self.testCollision = function(entity2){ //return if colliding (true/false)
		var rect1 = {
			x:self.x-self.width/2,
			y:self.y-self.height/2,
			width:self.width,
			height:self.height,
		}
		var rect2 = {
			x:entity2.x-entity2.width/2,
			y:entity2.y-entity2.height/2,
			width:entity2.width,
			height:entity2.height,
		}
		return testCollisionRectRect(rect1,rect2);
		   
	}
	
	//update the position math only
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
		
		/*		
		if(self.x < 0 + Maps.current.fluff + self.width/2 || self.x > Maps.current.width - Maps.current.fluff - self.width/2){
			self.spdX = -self.spdX;
		}
		if(self.y < 0 + Maps.current.fluff + self.height/2 || self.y > Maps.current.height - Maps.current.fluff + self.height/2){
			self.spdY = -self.spdY;
		}
		*/
	}
	/*
	//out of bounds check
	self.validatePosition = function(){		
		if(self.x < self.width/2 + Maps.current.fluff)
			self.x = self.width/2 + Maps.current.fluff;
		if(self.x > Maps.current.width - self.width/2 - Maps.current.fluff)
			self.x = Maps.current.width - self.width/2 - Maps.current.fluff;
		if(self.y < self.height/2 + Maps.current.fluff)
			self.y = self.height/2 + Maps.current.fluff;
		if(self.y > Maps.current.height - self.height/2 - Maps.current.fluff)
			self.y = Maps.current.height - self.height/2 - Maps.current.fluff;
	}
	*/
	return self;
}

//Actor - uses Entity to make Player and Enemies
Actor = function(type,id,x,y,spdX,spdY,width,height,img,hp,atkSpd){
	var self = Entity(type,id,x,y,spdX,spdY,width,height,img);
   
	self.hp = hp;
	self.hpMax = hp;
	self.atkSpd = atkSpd;
	self.attackCounter = 0;
	self.aimAngle = 0;
	self.spriteAttacking = false;
	self.attackType = 0;
	
	//update the Entity using additional update Actor
	var super_update = self.update;
	self.update = function(){
		super_update();
		self.attackCounter += self.atkSpd;
		if (self.hp <= 0)
			self.onDeath();
	}
	self.onDeath = function(){};
	self.performAttack = function(){
		if(self.attackCounter > 25){    //every 1 sec
			self.attackCounter = 0;
			self.spriteAttacking = true;
			self.attackType = 0;
			Bullet.generate(self, self.aimAngle);
		}
	}
   
	self.performSpecialAttack = function(){
		if(self.attackCounter > 50){    //every 1 sec
			self.attackCounter = 0;
			self.spriteAttacking = true;
			self.attackType = 1;
			/*
			for(var i = 0 ; i < 360; i++){
					Bullet.generate(self,i);
			}
			*/
			Bullet.generate(self,self.aimAngle - 5);
			Bullet.generate(self,self.aimAngle);
			Bullet.generate(self,self.aimAngle + 5);
		}
	}
	
	/*/draw actor hp bars
	var super_draw = self.draw;
	self.draw = function(){
		super_draw();
		
		//offset from player, center, and image height
		var x = self.x - player.x + WIDTH/2;
		var y = self.y - player.y + HEIGHT/2 - self.height/2 - 20;
		
		//hp bar
		ctx.save();
		ctx.fillStyle = 'red';
		var width = 50*self.hp/self.hpMax;
		if(width < 0)
			width = 0;
		ctx.fillRect(x-25,y,width,5);
		ctx.strokeStyle = 'black';
		ctx.strokeRect(x-25,y,50,5);
		ctx.restore(); 	
	}
	*/
	
	return self;
}

//Player - uses Actor
Player = function(id){
	//				 type    ,id    ,x  ,y  ,spdX,spdY,width50,height70,img,hp,atkSpd
	var self = Actor('player',id,250,250,   0,   0,64,64,"img"/*Img.paladin*/,10,2);
	console.log("this is the player number: " + self.number);
	

	
	self.updateSpd = function(){
		if(self.pressingRight)
			self.spdX = 10;
		else if(self.pressingLeft)
			self.spdX = -10;
		else
			self.spdX = 0;
		
		if(self.pressingUp)
			self.spdY = -10;
		else if(self.pressingDown)
			self.spdY = 10;
		else
			self.spdY = 0;
		
	}
	
	//update the Entity using additional update Player
	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		super_update();
		//self.validatePosition();
		self.spriteAnimCounter += 0.5;
		if(self.spriteAttacking){
			self.spriteAttackingCounter +=1;
			if(self.spriteAttackingCounter % 6 === 0)
				self.spriteAttacking = false;
		}
		if(self.pressingMouseLeft)
			self.performAttack();
		if(self.pressingMouseRight)
			self.performSpecialAttack();
		
		/*
		if(self.pressingRight || self.pressingLeft)
			self.spdX = 10;
		else
			self.spdX = 0;
		if(self.pressingUp || self.pressingDown)
			self.spdY = 10;
		else
			self.spdY = 0;*/
	}
	
	self.spriteAnimCounter = 0;
	self.spriteAttackingCounter = 0;
	
	
	/*/draw player sprite
	self.draw = function(){	
		
		//Entity draw
		//offset from player
		var x = self.x - player.x;
		var y = self.y - player.y;
		//offset from center
		x += WIDTH/2;
		y += HEIGHT/2;
		//offset image width
		x -= self.width/2;
		y -= self.height/2;
		
		//image dimensions
		var frameWidth = 64;
		var frameHeight = 64;
		
		//image direction
		var aimAngle = self.aimAngle;
		if (aimAngle < 0)
			aimAngle += 360;
		var directionMod = 3; //right
		if(aimAngle >= 45 && aimAngle < 135)
			directionMod = 2; //down
		if(aimAngle >= 135 && aimAngle < 225)
			directionMod = 1; //left
		if(aimAngle >= 225 && aimAngle < 315)
			directionMod = 0; //up
		
		//image animation loop
		var walkingMod = Math.floor(self.spriteAnimCounter) % 7;
		var attackingMod = Math.floor(self.spriteAttackingCounter) % 6;
		
		//TODO:export this entire function in Actor
		//actual draw of image
		//draw attack1
		if (self.spriteAttacking && self.attackType == 0)
			ctx.drawImage(self.img, attackingMod*frameWidth, directionMod*frameHeight+frameHeight*12, frameWidth, frameHeight, x, y, self.width, self.height);
		//draw attack2
		else if (self.spriteAttacking && self.attackType == 1)
			ctx.drawImage(self.img, attackingMod*frameWidth*3, directionMod*frameHeight*3+frameHeight*21, frameWidth*3, frameHeight*3, x-frameWidth, y-frameHeight, self.width*3, self.height*3);
		//draw walk
		else if (self.spdX == 0 && self.spdY == 0)
			ctx.drawImage(self.img, 0, directionMod*frameHeight+frameHeight*8, frameWidth, frameHeight, x, y, self.width, self.height);	
		//draw standing
		else
			ctx.drawImage(self.img, walkingMod*frameWidth+frameWidth, directionMod*frameHeight+frameHeight*8, frameWidth, frameHeight, x, y, self.width, self.height);
		
		//Actor draw
		//offset from player, center, and image height
		x = self.x - player.x + WIDTH/2;
		y = self.y - player.y + HEIGHT/2 - self.height/2 - 20;
		
		//hp bar
		ctx.save();
		ctx.fillStyle = 'red';
		var width = 50*self.hp/self.hpMax;
		if(width < 0)
			width = 0;
		ctx.fillRect(x-25,y,width,5);
		ctx.strokeStyle = 'black';
		ctx.strokeRect(x-25,y,50,5);
		ctx.restore(); 	
	}
	*/
	
	
	/*self.onDeath = function(){
		var timeSurvived = Date.now() - timeWhenGameStarted;           
		//sessionStorage.setItem("score", score);
		console.log("You lost! You survived for " + timeSurvived + " ms.");            
		//window.location.href = "gameover.html";
		/*
		if (highscore < score ) {
			console.log("New high score!");
			highscore = score;
		}
		
		document.getElementById("highscore").innerHTML = highscore;
		*//*
		startNewGame();
	}
	*/
	
	self.pressingDown = false;
	self.pressingUp = false;
	self.pressingLeft = false;
	self.pressingRight = false;
	self.pressingMouseLeft = false;
	self.pressingMouseRight = false;
	Player.list[id] = self;
	return self;    
}

/*/player object 
Player = function(id){
    var self = {
        x:250,
        y:250,
        id:id,
        number:"" + Math.floor(10 * Math.random()),
        pressingRight:false,
        pressingLeft:false,
        pressingUp:false,
        pressingDown:false,
        maxSpd:10,
    }
    self.updatePosition = function(){
        if(self.pressingRight)
            self.x += self.maxSpd;
        if(self.pressingLeft)
            self.x -= self.maxSpd;
        if(self.pressingUp)
            self.y -= self.maxSpd;
        if(self.pressingDown)
            self.y += self.maxSpd;
    }
    Player.list[id] = self;
	return self;
}
*/
Player.list = {};

Player.onConnect = function(socket){ //this should only use socket.id maybe
	var player = Player(socket.id);
	//socket collect move player info
    socket.on('keyPress',function(data){
        if(data.inputId === 'left')
            player.pressingLeft = data.state;
        else if(data.inputId === 'right')
            player.pressingRight = data.state;
        else if(data.inputId === 'up')
            player.pressingUp = data.state;
        else if(data.inputId === 'down')
            player.pressingDown = data.state;
		else if(data.inputId === 'mouseleft')
            player.pressingMouseLeft = data.state;
		else if(data.inputId === 'mouseright')
            player.pressingMouseRight = data.state;
    });
}

Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
}

Player.update = function(){
	var pack = [];
    for(var key in Player.list){
        var player = Player.list[key];
        player.update();
        //console.log("socket.x is " + SOCKET_LIST[socket.id].x);
		//console.log("socket.y is " + SOCKET_LIST[socket.id].y);
		//console.log("socket.id is " + SOCKET_LIST[socket.id].id);
		
		//socket.x++;
		//socket.y++;
		
		pack.push({

			x:player.x,
            y:player.y,
            number:player.number
        });    
    }
	return pack;
}

//////////////////////////////////////////////////////////////
//Bullet - uses Entity
Bullet = function (id,x,y,spdX,spdY,width,height, combatType){
	var self = Entity('bullet',id,x,y,spdX,spdY,width,height,"img"/*Img.bullet*/);
   
	self.timer = 0;
	self.combatType = combatType;
	//self.spdX = spdX; not needed as spdX is in Entity
	//self.spdY = spdY; not needed as spdX is in Entity
	
	//update the Entity using additional update Bullet 
	var super_update = self.update;
	self.update = function () {
		super_update();
		var toRemove = false; //TODO: change to self.toRemove
		self.timer++;
		if(self.timer > 100){
			toRemove = true;
		}
		
		/*/bullet collision
		if (self.combatType == 'player') { //bullet was shot by player - delete enemies																				  
			for(var key in Enemy.list){
				if(self.testCollision(Enemy.list[key])){
					toRemove = true;
					Enemy.list[key].hp -= 1;
					//TODO:delete Enemy.list[key];
					//break;
				}      			
			}
		} else if (self.combatType == 'enemy') { //bullet was shot by enemy	- delete player hp
			if(self.testCollision(player)){
				toRemove = true;
				player.hp -= 1;
			}
		}
		//*/
		if(toRemove){
			delete Bullet.list[self.id];
		}
	}
	
	Bullet.list[id] = self;
	return self;
}

Bullet.list = {};

Bullet.update = function(){
	//refresh bullets
	var pack = []
	for(var key in Bullet.list){
		var bullet = Bullet.list[key];
		bullet.update(); 
		pack.push({
			x:bullet.x,
            y:bullet.y,
        });
	}
	return pack;
}
	
Bullet.generate = function(actor,aimOverwrite){ //aimOverwrite should be used most often, however for now it is always used
	//Math.random() returns a number between 0 and 1
	var x = actor.x;
	var y = actor.y;
	var height = 25; //32
	var width = 25; //32
	var id = Math.random();
   
	var angle;
	if(aimOverwrite !== undefined)
		angle = aimOverwrite;
	else angle = actor.aimAngle;
   
	var spdX = Math.cos(angle/180*Math.PI)*10;
	var spdY = Math.sin(angle/180*Math.PI)*10;
	Bullet(id,x,y,spdX,spdY,width,height,actor.type);
} 

io.sockets.on('connection', function(socket){
    socket.id = Math.random();	//mask the socket id
    SOCKET_LIST[socket.id] = socket;
	
	//console.log("socket started");
	//console.log("socket is " + socket.id);
	//console.log("socket is " + SOCKET_LIST[socket.id].id);
	
	//chatting attempt
	socket.on('chat message', function(msg){
		console.log('message: ' + msg);
	});
	
	Player.onConnect(socket);
    
	//disconnect happen automatically, but deletion from list must happen
	socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });
	
	//chatting for real
	socket.on('sendMsgToServer',function(data){
        var playerName = ("" + socket.id).slice(2,7);
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('addToChat',playerName + ': ' + data);
        }
    });
	
	//player debug
    socket.on('evalServer',function(data){
        console.log("debugging");
		if(!DEBUG)
            return;
        var res = eval(data);
        socket.emit('evalAnswer',res);     
    });
   
});

//socket emit player positions
setInterval(function(){
    var pack = {
		player: Player.update(),
		bullet: Bullet.update()
	}
	
	//console.log(pack);
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions',pack);
    }   
},1000/25);
 
 
 

//hapi instead of express - commented out at the moment
/*
var Hapi = require('hapi');

var server = new Hapi.Server();
server.connection({ port: 4000 });

var io = require('socket.io')(server.listener);
*/

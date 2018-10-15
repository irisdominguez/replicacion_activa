try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}
var CONFIG = require('./constants.js');

var clientSocket = zmq.socket('router');
var handlerSocket = zmq.socket('router');


//Router por el que se habla con los handlers
handlerSocket.identity = 'routerHandler';
handlerSocket.bind(CONFIG.IP_ROUTER1_HANDLER,
function(err) {
    if (err) throw err;
    handlerSocket.on('message', function(sender, msg) { 
		console.log(sender);
		console.log(msg);
		console.log('Handler has worked');
		clientSocket.send(['client1', sender, msg]);
	});
}); // Handler Socket


//Router por el que se habla con los clients
clientSocket.identity = 'routerClient';
clientSocket.bind(CONFIG.IP_ROUTER1_CLIENT, 
function(err) {
    if (err) throw err;
    clientSocket.on('message', function(sender, packetRaw) {
		var packetString = packetRaw.toString();
		console.log('Received from client: ' + packetString);
		var packet = JSON.parse(packetString);
		handlerSocket.send([
			packet.target, 
			'router', 
			JSON.stringify(packetString)
		]);
	});
}); // Client Socket

try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}
var CONFIG = require('./constants.js');

var clientSocket = zmq.socket('router');
var handlerSocket = zmq.socket('router');

console.log('R1');

//Router por el que se habla con los handlers
handlerSocket.identity = 'routerHandler';
handlerSocket.bind(CONFIG.IP_ROUTER1_HANDLER,
function(err) {
    if (err) throw err;
    handlerSocket.on('message', function(sender, packetRaw) {
		var packetString = packetRaw.toString();
		console.log('R1:Received from handler [' + sender + ']: ' + packetString);
		var packet = JSON.parse(packetString);
		clientSocket.send([
			packet.target, 
			'router', 
			JSON.stringify(packet)
		]);
	});
}); // Handler Socket


//Router por el que se habla con los clients
clientSocket.identity = 'routerClient';
clientSocket.bind(CONFIG.IP_ROUTER1_CLIENT, 
function(err) {
    if (err) throw err;
    clientSocket.on('message', function(sender, packetRaw) {
		var packetString = packetRaw.toString();
		console.log('R1:Received from client: ' + packetString);
		var packet = JSON.parse(packetString);
		handlerSocket.send([
			packet.target, 
			'router', 
			JSON.stringify(packet)
		]);
	});
}); // Client Socket

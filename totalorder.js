try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}
var CONFIG = require('./constants.js');

var handlerSocket = zmq.socket('router');
var workerSocket = zmq.socket('router');

//Router por el que se habla con los handlers
handlerSocket.identity = 'totalorder';
handlerSocket.bind(CONFIG.IP_TO_HANDLER,
function(err) {
    if (err) throw err;
    handlerSocket.on('message', function(sender, packetRaw) {
		var packetString = packetRaw.toString();
		console.log('Received from handler [' + sender + ']: ' + packetString);
		var packet = JSON.parse(packetString);
		// Ordenar la peticion
		if (packet.target == 'workers') {
			for (var i = 1; i < CONFIG.NUM_REPLICAS; i++) {
				workerSocket.send([
					'worker' + i, 
					'totalorder', 
					JSON.stringify(packet)
				]);
			}
		}
	});
}); // Handler Socket


//Router por el que se habla con los clients
workerSocket.identity = 'totalorder';
workerSocket.bind(CONFIG.IP_TO_WORKER, 
function(err) {
    if (err) throw err;
    workerSocket.on('message', function(sender, packetRaw) {
		var packetString = packetRaw.toString();
		console.log('Received from worker [' + sender + ']: ' + packetString);
		var packet = JSON.parse(packetString);
		handlerSocket.send([
			packet.target, 
			'totalorder', 
			JSON.stringify(packet)
		]);
	});
}); // Worker Socket

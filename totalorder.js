try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}
var CONFIG = require('./constants.js');

var handlerSocket = zmq.socket('router');
var workerSocket = zmq.socket('router');

var totalorder = {}; // NEW Dictionary (key -> request id;, value -> array[seqn -> sequence number associated to that message, status -> whether it has been delivered])
var seq = 0;               // NEW

//Router por el que se habla con los handlers
handlerSocket.identity = 'totalorder';
handlerSocket.bind(CONFIG.IP_TOTALORDER,
function(err) {
    if (err) throw err;
    handlerSocket.on('message', function(sender, packetRaw) {
		var packetString = packetRaw.toString();
		console.log('TO:Received from handler [' + sender + ']: ' + packetString);
		var packet = JSON.parse(packetString);
		// Ordenar la peticion
		order = 0;
		if (packet.id in totalorder) {
			order = totalorder[packet.id];
		}
		else {
			totalorder[packet.id] = seq;
			order = seq;
			seq += 1;
		}
		
		packet.seq = order;
		
		for (var i = 1; i < CONFIG.NUM_HANDLERS; i++) {
			handlerSocket.send([
				'handler' + i,
				'totalorder',
				JSON.stringify(packet)
			]);
		}
	});
}); // Handler Socket

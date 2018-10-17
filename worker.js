try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}

var CONFIG = require('./constants.js');

if( process.argv.length < 3) {
	console.log('Parametros incorrectos');
	console.log('Modo de ejecucion: node worker.js IDWORKER (>=1)');
	process.exit(1);
}

var id = process.argv[2];
 
var socket = zmq.socket('rep');
socket.connect(CONFIG.IP_WORKERS + (CONFIG.PORT_WORKERS + id));

socket.on('message', function(packetRaw) {
	var packetString = packetRaw.toString();
	console.log('Worker received: ' + packetString);
	var packet = JSON.parse(packetString);
	var newPacket = {
		id: packet.id,
		message: 'worked: ' + packet.message,
		source: 'worker' + id,
		target: packet.source,
		producer: packet.producer,
		type: 'worker_reply'
	}
	socket.send(JSON.stringify(newPacket));
});

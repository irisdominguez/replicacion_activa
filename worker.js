//Imports
try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}
var CONFIG = require('./constants.js');





var dealer = zmq.socket('dealer'); //Conectado con handlers

if( process.argv.length < 3) {
	console.log('Parametros incorrectos');
	console.log('Modo de ejecucion: node worker.js IDWORKER (>=1)');
	process.exit(1);
}

var id = process.argv[2];

dealer.identity = 'worker' + id;
dealer.connect(CONFIG.IP_ROUTER2_WORKER); //Router entre handlers y workers

var timeoutTimer = null;




dealer.on('message', function(sender, packetRaw) {	
	
	var packetString = packetRaw.toString();
	console.log('W' + id + ': received: ' + packetString);
	var packet = JSON.parse(packetString);
	var newPacket = {
		id: packet.id,
		message: 'worked: ' + packet.message,
		source: 'worker' + id,
		target: packet.source,
		producer: packet.producer,
		type: 'worker_reply'
	}
	
	dealer.send(JSON.stringify(newPacket));
	
});

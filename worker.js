//Imports
try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}
var CONFIG = require('./constants.js');

var id = process.argv[2];

var dealer = zmq.socket('dealer'); //Conectado con handlers

if( process.argv.length < 3) {
	console.log('W-' + id + ':Parametros incorrectos');
	console.log('W-' + id + ':Modo de ejecucion: node worker.js IDWORKER (>=1)');
	process.exit(1);
}

console.log('W-' + id);

dealer.identity = 'worker' + id;
dealer.connect(CONFIG.IP_ROUTER2_WORKER); //Router entre handlers y workers

var packetsToProcess = {};
var processedStrings = [];
var expectedSeq = 0;

dealer.on('message', function(sender, packetRaw) {	
	
	var packetString = packetRaw.toString();
	console.log('W-' + id + ': received: ' + packetString);
	var packet = JSON.parse(packetString);
	packetsToProcess[packet.seq] = packet;
	
	console.log('Received package with seq ' + packet.seq);
	
	while (expectedSeq in packetsToProcess) {
		console.log('Working on package with seq ' + packet.seq);
		var packet = packetsToProcess[expectedSeq];
		var newPacket = {
			id: packet.id,
			message: 'worked: ' + packet.message,
			source: 'worker' + id,
			target: packet.source,
			producer: packet.producer,
			type: 'worker_reply'
		}
		
		processedStrings.push('worked: ' + packet.message);
		dealer.send(JSON.stringify(newPacket));
		
		expectedSeq += 1;
	}
	
});
 

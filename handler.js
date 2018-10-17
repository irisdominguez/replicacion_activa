try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}
var CONFIG = require('./constants.js');

var routerLadoClients = zmq.socket('dealer');
var socketLadoWorkers = zmq.socket('dealer');

if( process.argv.length < 3) {
	console.log('Parametros incorrectos');
	console.log('Modo de ejecucion: node handler.js IDHANDLER (>=1)');
	process.exit(1);
}

var id = process.argv[2];

routerLadoClients.identity = 'handler' + id;
routerLadoClients.connect(CONFIG.IP_ROUTER1_HANDLER);

socketLadoWorkers.identity = 'handler' + id;
socketLadoWorkers.connect(CONFIG.IP_ROUTER2_HANDLER);

routerLadoClients.on('message', function(sender, packetRaw) {
	var packetString = packetRaw.toString();
	console.log('Handler received: ' + packetString);
	var packet = JSON.parse(packetString);
	var newPacket = {
		id: packet.id,
		message: packet.message,
		source: 'handler' + id,
		target: 'workers',	// Posiblemente broadcast también a handlers
		producer: packet.source,
		type: 'handler_request'
	}
	socketLadoWorkers.send(JSON.stringify(newPacket));
});

socketLadoWorkers.on('message', function(sender, packetRaw) {
	var packetString = packetRaw.toString();
	console.log('Handler received: ' + packetString);
	var packet = JSON.parse(packetString);
	var newPacket = packet;
	newPacket.target = packet.producer;
	routerLadoClients.send(JSON.stringify(newPacket));
});

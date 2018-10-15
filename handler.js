try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}
var CONFIG = require('./constants.js');

var routerLadoClients = zmq.socket('dealer');

if( process.argv.length < 3) {
	console.log('Parametros incorrectos');
	console.log('Modo de ejecucion: node handler.js IDHANDLER (>=1)');
	process.exit(1);
}

var id = process.argv[2];

routerLadoClients.identity = 'handler' + id;
routerLadoClients.connect(CONFIG.IP_ROUTER1_HANDLER);

routerLadoClients.on('message', function(sender, packetRaw) { 
	//~ console.log('Handler received: 'id + ', ' + packetRaw.toString());
	//~ routerLadoClients.send('worked message: ' + msg);
	
	var packetString = packetRaw.toString();
	console.log('Handler received: ' + packetString);
	var packet = JSON.parse(packetString);
	var newPacket = {
		message: 'worked: ' + packet.message,
		source: 'handler' + id,
		target: packet.source,
		type: 'handler_reply'
	}
	routerLadoClients.send(JSON.stringify(newPacket));
});

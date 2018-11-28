try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}

var CONFIG = require('./constants.js');

setInterval(function() {
	global.gc();
}, 1500);

// Identity
if( process.argv.length < 3) {
	console.log('Parametros incorrectos');
	console.log('Modo de ejecucion: node handler.js IDHANDLER (>=1)');
	process.exit(1);
}

var id = process.argv[2];
var fullid = 'handler' + id;

console.log(fullid + ' launched');

var logger = zmq.socket('push');
logger.connect(CONFIG.IP_LOGGER);

// Sockets
var routerLadoClients = zmq.socket('dealer');
var socketLadoWorkers = zmq.socket('dealer');
var socketTotalOrder = zmq.socket('dealer');
var totalorderSubscriber = zmq.socket('sub');

routerLadoClients.identity = 'handler' + id;
socketLadoWorkers.identity = 'handler' + id;
socketTotalOrder.identity = 'handler' + id;

// State variables
var packets = {};
var packets_toBeHandled = {};
var lastServedReq = -1;

socketTotalOrder.connect(CONFIG.IP_TOTALORDER);

routerLadoClients.connect(CONFIG.IP_ROUTER1_HANDLER);
routerLadoClients.on('message', function(sender, packetRaw) {
	var packetString = packetRaw.toString();
	console.log('H-' + id + ':Handler received: ' + packetString);
	var packet = JSON.parse(packetString);
	var newPacket = {
		id: packet.id,
		message: packet.message,
		source: 'handler' + id,
		target: 'workers',	// Posiblemente broadcast también a handlers
		producer: packet.source,
		type: 'handler_request'
	}
	logger.send([fullid, 'Receive request: ' + packet.id]);
	packets_toBeHandled[newPacket.id]=true;
	socketTotalOrder.send(JSON.stringify(newPacket));
});

socketLadoWorkers.connect(CONFIG.IP_ROUTER2_HANDLER);
socketLadoWorkers.on('message', function(sender, packetRaw) {
	var packetString = packetRaw.toString();
	console.log('H-' + id + ':Handler received: ' + packetString);
	var packet = JSON.parse(packetString);
	if (packet.id in packets_toBeHandled) {
		delete packets_toBeHandled[packet.id];
		var newPacket = packet;
		newPacket.target = packet.producer;
		logger.send([fullid, 'Send response to client: ' + packet.id]);
		routerLadoClients.send(JSON.stringify(newPacket));
	}
});

totalorderSubscriber.connect(CONFIG.IP_TOTALORDERPUBLISHER);
totalorderSubscriber.subscribe('TO');
totalorderSubscriber.on('message', function(packetRaw) {
	var packetString = packetRaw.toString().substr(3);
	var packet = JSON.parse(packetString);
	console.log('H-' + id + ':Total order received: ' + packetString);
	var order = packet.seq;
	console.log('H-' + id + ':Total order for [' + packet.id + ']: ' + order);

	packets[packet.seq] = packet;

	if (packet.source == 'handler' + id) {
		// Si lo solicite yo, lo manejamos
		if (packet.seq == lastServedReq + 1) {
			socketLadoWorkers.send(JSON.stringify(packet));
			delete packets[lastServedReq + 1]; // Delete packet after sending
			lastServedReq += 1;
		}
		else {
			while(packet.seq > lastServedReq + 1) {
				logger.send([fullid, 'Send to workers: [' + packet.seq + ']' + packet.id]);
				var packetToSend = packets[lastServedReq + 1];
				socketLadoWorkers.send(JSON.stringify(packetToSend));
				delete packets[lastServedReq + 1]; // Delete packet after sending
				lastServedReq += 1;
			}
		}
	}
});

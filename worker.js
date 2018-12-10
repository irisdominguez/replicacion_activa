try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}
var fs = require('fs');

var CONFIG = require('./constants.js');

setInterval(function() {
	global.gc();
}, 1500);

// Identity
if( process.argv.length < 3) {
	console.log('Parametros incorrectos');
	console.log('Modo de ejecucion: node worker.js IDWORKER (>=1)');
	process.exit(1);
}

var id = process.argv[2];
var fullid = 'worker' + id;

console.log(fullid + ' launched');

var logger = zmq.socket('push');
logger.connect(CONFIG.IP_LOGGER);

// Sockets
var dealer = zmq.socket('dealer'); //Conectado con handlers
var routerSubscriber = zmq.socket('sub');

dealer.identity = 'worker' + id;

// State variables
// Packets that we expect to process (seq => packet)
var packetsToProcess = {};
// Packets that we expect to send a reply to (client => id)
var packetsToSend = {};
// Packets that we have executed (client => result)
var executed = {};
var expectedSeq = 0;


routerSubscriber.connect(CONFIG.IP_ROUTERPUBLISHER);
routerSubscriber.subscribe('R2');
dealer.connect(CONFIG.IP_ROUTER2_WORKER); //Router entre handlers y workers

routerSubscriber.on('message', function(packetRaw) {	//sender,

	var packetString = packetRaw.toString().substr(3);
	console.log('W-' + id + ': received: ' + packetString);
	var packet = JSON.parse(packetString);
	
	// Update queues with the new packet
	// We have received a request to process this packet,
	// But we'll only process it if it's new
	if (packet.seq <= expectedSeq)
		packetsToProcess[packet.seq] = packet;
	// We always send a response back
	packetsToSend[packet.producer] = packet.id;
	// In case we have the resply stored, we update the packet to have as
	// target the handler that requested it
	for (var client in executed) {
		if (executed[client].originSeq == packet.seq) {
			executed[client].target = packet.source;
		}
	}

	console.log('Received package with seq ' + packet.seq);

	// Now we process all available packets
	while (expectedSeq in packetsToProcess) {
		console.log('Working on package with seq ' + packet.seq);
		
		var packet = packetsToProcess[expectedSeq];
		
		// Perform the write operation
		try {
			for(var i=0; i<JSON.parse(packet.message).nReps; i++){
				fs.appendFileSync(
					__dirname + '/LOGS/log' + fullid + '.txt', 
					JSON.parse(packet.message).mensaje + '\n');
			}
		} catch (err) {
			/* Handle the error */
			throw err;
		}
		
		// Executed packet
		var executedPacket = {
			id: packet.id,
			message: 'worked: ' + packet.message,
			source: 'worker' + id,
			target: packet.source,
			producer: packet.producer,
			type: 'worker_reply',
			originSeq: packet.seq
		}
		
		// If it's the last packet for the client, store it
		if (!executed[packet.producer] ||
			executed[packet.producer].originSeq <= executedPacket.originSeq) {
			executed[packet.producer] = executedPacket;
			console.log('Store result for seq ' + packet.seq + 
				' with client ' + packet.producer);
		}

		logger.send([fullid, 'worker_processed', '']);

		delete packetsToProcess[expectedSeq];
		
		expectedSeq += 1;
	}
	
	// And we send the replies back
	for (var client in packetsToSend) {
		var id = packetsToSend[client];
		console.log('Checking packets for ' + client + 
				', expecting id ' + id);
		if (executed[client] && executed[client].id == id) {
			var packetToSend = executed[client];
			console.log('Send result for seq ' + packetToSend.originSeq + 
					' with client ' + packetToSend.producer + 
					' and target ' + packetToSend.target);
			dealer.send(JSON.stringify(packetToSend));
			delete packetsToSend[client];
		}
	}

});






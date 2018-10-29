try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}

var CONFIG = require('./constants.js');

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
var packetsToProcess = {};
var processedStrings = [];
var expectedSeq = 0;


routerSubscriber.connect(CONFIG.IP_ROUTERPUBLISHER);
routerSubscriber.subscribe('R2');
dealer.connect(CONFIG.IP_ROUTER2_WORKER); //Router entre handlers y workers

routerSubscriber.on('message', function(packetRaw) {	//sender, 
	
	var packetString = packetRaw.toString().substr(3);
	console.log('W-' + id + ': received: ' + packetString);
	var packet = JSON.parse(packetString);
	packetsToProcess[packet.seq] = packet;
	
	console.log('Received package with seq ' + packet.seq);
	
	while (expectedSeq in packetsToProcess) {
		console.log('Working on package with seq ' + packet.seq);
		
		
		
		//Write in file individual
		var fs = require('fs');
		//fs.appendFile("/home/ivan/NodeJS_escritos/log" + id + '.txt', 'W-' + id + ': ' + packetString, function(err) {
		fs.appendFile(__dirname + '/LOGS/log' + id + '.txt', 'W-' + id + ': ' + packetString, function(err) {
			if(err) { 
				return console.log(err);
			}

			//console.log("The file was saved!");
		}); 
		//Write in file grupal
		var fs = require('fs');
		//fs.appendFile("/home/ivan/NodeJS_escritos/log.txt", 'W-' + id + ': ' + packetString, function(err) {
		fs.appendFile(__dirname + '/LOGS/log.txt', 'W-' + id + ': ' + packetString, function(err) {
			if(err) {
				return console.log(err);
			}

			//console.log("The file was saved!");
		}); 
		
		
		
		
		logger.send([fullid, 'worker_processed', '']);
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




 

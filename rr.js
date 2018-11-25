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
	console.log('Modo de ejecucion: node rr.js IDCLIENTE (>=1)');
	process.exit(1);
}

var id = process.argv[2];
var fullid = 'rr' + id;

console.log(fullid + ' launched');

var logger = zmq.socket('push');
logger.connect(CONFIG.IP_LOGGER);

// Sockets
var dealer = zmq.socket('dealer');
var replier = zmq.socket('rep');

dealer.identity = 'client' + id;

// State variables
var currentHandler = 1;
var timeoutTimer = null;
var currentMessage = '';

//Conexión con el cliente
replier.bind(CONFIG.IP_CLIENTS + (CONFIG.PORT_CLIENTS + parseInt(id)), function(err){
	if (err) {
		console.log("Connecting to " + CONFIG.IP_CLIENTS + (CONFIG.PORT_CLIENTS + parseInt(id)));
		console.log(err);
	}
});

function sendMessage() {
	var packetFromClient = JSON.parse(currentMessage);
	var packet = {
		id: packetFromClient.id,
		message: packetFromClient.message,
		source: 'client' + id,
		target: 'handler' + currentHandler,
		type: 'client_request'
	}
	logger.send([fullid, 'Requested: ' + packet.id + ' to ' + packet.target]);
	dealer.send(JSON.stringify(packet));
	console.log('rr-' + id + ':Sent message [' + packetFromClient.id + '] to handler ' + packet.target);
	
	timeoutTimer = setTimeout(function(){
		currentHandler++;
		if (currentHandler > CONFIG.NUM_HANDLERS) currentHandler = 1;
		sendMessage();
	}, 1000);
}

//Evento de recibir un mensaje del cliente: enviar por el dealer al router
replier.on('message', function(packetRaw) {
	packetString = packetRaw.toString();
	currentMessage = packetString;
	console.log('rr-' + id + ':Received request: [', packetString, ']');
	
	sendMessage();
});

// Al recibir una notifiación de trabajo completado, informar al cliente
dealer.connect(CONFIG.IP_ROUTER1_CLIENT); //Primer router
dealer.on('message', function (sender, packetRaw) {
	clearTimeout(timeoutTimer);
	timeoutTimer = null;
	
	var packetString = packetRaw.toString();
	console.log('rr-' + id + ':Worked from handler: ' + packetString);
	var packet = JSON.parse(packetString);
	replier.send(packet.message);
});








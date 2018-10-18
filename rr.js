try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}
var CONFIG = require('./constants.js');

/* El cliente se conecta mediante:
 * 		-http server 
 * 		-request-reply
 * con RR (retransmisión y redirección)
 * 
 * RR se conecta con un router-router entre RR y los handlers
 * 
 * Nota: podría estar el cliente y el RR en la misma clase, pero para 
 * poder cambiar los clientes de tipo req-rep por un html server es mejor separarlo
 * 
 * */
 

var dealer = zmq.socket('dealer');
var id = process.argv[2];

if( process.argv.length < 3) {
	console.log('rr-' + id + ':Parametros incorrectos');
	console.log('rr-' + id + ':Modo de ejecucion: node rr.js IDCLIENTE (>=1)');
	process.exit(1);
}






console.log('rr-' + id + ':connecting...');
dealer.identity = 'client' + id;
dealer.connect(CONFIG.IP_ROUTER1_CLIENT); //Primer router

var currentHandler = 1;
var timeoutTimer = null;
var currentMessage = '';


//Conexión con el cliente
var replier = zmq.socket('rep');
replier.bind(CONFIG.IP_CLIENTS + (CONFIG.PORT_CLIENTS + id), function(err){
	if (err) {
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
dealer.on('message', function (sender, packetRaw) {
	clearTimeout(timeoutTimer);
	timeoutTimer = null;
	
	var packetString = packetRaw.toString();
	console.log('rr-' + id + ':Worked from handler: ' + packetString);
	var packet = JSON.parse(packetString);
	replier.send(packet.message);
});








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

if( process.argv.length < 3) {
	console.log('Parametros incorrectos');
	console.log('Modo de ejecucion: node rr.js IDCLIENTE (>=1)');
	process.exit(1);
}

var id = process.argv[2];




console.log('connecting...');
dealer.identity = id;
dealer.connect(CONFIG.IP_ROUTER1_CLIENT); //Primer router




//Conexión con el cliente
var replier = zmq.socket('rep');
replier.bind(CONFIG.IP_CLIENTS + (CONFIG.PORT_CLIENTS + id), function(err){
	if (err) {
		console.log(err);
	}
});


//Evento de recibir un mensaje del cliente: enviar por el dealer al router
replier.on('message', function(message) {
	var sourceMessage = message.toString();
	console.log('Received request: [', sourceMessage, ']');
	
	var packet = {
		message: sourceMessage,
		source: id,
		target: '2',
		type: 'client_request'
	}
	dealer.send(JSON.stringify(packet));
});

// Al recibir una notifiación de trabajo completado, informar al cliente
dealer.on('message', function (message) {
	console.log('Worked message: ' + message);
	replier.send(message);
});








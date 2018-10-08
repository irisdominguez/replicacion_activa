try {
    var zmq = require("zeromq");
}
catch(err) {
    var zmq = require('zmq');
}


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
 
 

 

var dealer = zmq.socket("dealer");

if( process.argv.length < 3) {
	console.log("Parametros incorrectos");
	console.log("Modo de ejecucion: node client.js IDCLIENTE (>=1)");
	process.exit(1);
}

var id = process.argv[2];




console.log("connecting...");
dealer.identity = id;
dealer.connect("tcp://127.0.0.1:49152"); //Primer router




//Conexión con el cliente
var replier = zmq.socket('rep');
replier.bind('tcp://127.0.0.1:49252', function(err){
	if (err) {
		console.log(err);
	}
	else {
		console.log('Listening on 49252...');
	}
});


//Evento de recibir un mensaje del cliente: enviar por el dealer al router
replier.on('message', function(request) {
	console.log('Received request: [', request.toString(), ']');
	
	dealer.send(request);
	replier.send('calma que estoy en ello');
});


/*
setInterval(function() {
	count++;
	msg = "package " + count;
	console.log("send package");
	var t = dealer.send(msg);
	console.log(t);
}, 1000);
* */








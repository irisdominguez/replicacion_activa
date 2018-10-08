try {
    var zmq = require("zeromq");
}
catch(err) {
    var zmq = require('zmq');
}

var routerLadoClients = zmq.socket("dealer");

if( process.argv.length < 3) {
	console.log("Parametros incorrectos");
	console.log("Modo de ejecucion: node handler.js IDHANDLER (>=1)");
	process.exit(1);
}

var id = process.argv[2];

routerLadoClients.identity = id;
routerLadoClients.connect("tcp://127.0.0.1:49153");

routerLadoClients.on("message", function(id, msg) { 
	console.log(id + ", " + msg);
	routerLadoClients.send("worked message: " + msg);
});

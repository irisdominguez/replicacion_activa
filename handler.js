try {
    var zmq = require("zeromq");
}
catch(err) {
    var zmq = require('zmq');
}
var CONFIG = require('./constants.js');

var routerLadoClients = zmq.socket("dealer");

if( process.argv.length < 3) {
	console.log("Parametros incorrectos");
	console.log("Modo de ejecucion: node handler.js IDHANDLER (>=1)");
	process.exit(1);
}

var id = process.argv[2];

routerLadoClients.identity = id;
routerLadoClients.connect(CONFIG.IP_ROUTER1_HANDLER);

routerLadoClients.on("message", function(id, msg) { 
	console.log(id + ", " + msg);
	routerLadoClients.send("worked message: " + msg);
});

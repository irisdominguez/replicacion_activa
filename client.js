var zmq = require("zeromq");
var dealer = zmq.socket("dealer");

if( process.argv.length < 3) {
	console.log("Parametros incorrectos");
	console.log("Modo de ejecucion: node client.js IDCLIENTE (>=1)");
	process.exit(1);
}

var id = process.argv[2];

var count = 0;
console.log("connecting...");
dealer.identity = id;
dealer.connect("tcp://127.0.0.1:49152"); //Primer router

setInterval(function() {
	count++;
	msg = "package " + count;
	console.log("send package");
	var t = dealer.send(msg);
	console.log(t);
}, 1000);

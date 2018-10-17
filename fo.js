try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}
var CONFIG = require('./constants.js');

var dealer = zmq.socket('dealer');

if( process.argv.length < 3) {
	console.log('Parametros incorrectos');
	console.log('Modo de ejecucion: node rr.js IDWORKER (>=1)');
	process.exit(1);
}

var id = process.argv[2];

dealer.identity = 'worker' + id;
dealer.connect(CONFIG.IP_TO_WORKER); //Primer router

var currentHandler = 1;
var timeoutTimer = null;
var currentMessage = '';


//Conexión con el cliente
var socketWorker = zmq.socket('req');
socketWorker.bind(CONFIG.IP_WORKERS + (CONFIG.PORT_WORKERS + id), function(err){
	if (err) {
		console.log(err);
	}
});

//Evento de recibir un mensaje del cliente: enviar por el dealer al router
socketWorker.on('message', function(packetRaw) {
	var packetString = packetRaw.toString();
	console.log('Worker finished: ' + packetString);
	var packet = JSON.parse(packetString);
	dealer.send(JSON.stringify(packet));
});

// Al recibir una notifiación de trabajo completado, informar al cliente
dealer.on('message', function (sender, packetRaw) {
	clearTimeout(timeoutTimer);
	timeoutTimer = null;
	
	var packetString = packetRaw.toString();
	console.log('Worked from handler: ' + packetString);
	var packet = JSON.parse(packetString);
	socketWorker.send(packetString);
});








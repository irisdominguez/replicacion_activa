try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}
var CONFIG = require('./constants.js');

var dealer = zmq.socket('dealer');
var id = process.argv[2];

if( process.argv.length < 3) {
	console.log('Fo-' + id + ':Parametros incorrectos');
	console.log('Fo-' + id + ':Modo de ejecucion: node rr.js IDWORKER (>=1)');
	process.exit(1);
}

console.log('Fo-' + id);

dealer.identity = 'worker' + id;
dealer.connect(CONFIG.IP_ROUTER2_WORKER); //Primer router

var timeoutTimer = null;

//Conexión con el worker
var socketWorker = zmq.socket('req');
socketWorker.bind(CONFIG.IP_WORKERS + (CONFIG.PORT_WORKERS + id), function(err){
	if (err) {
		console.log(err);
	}
});

//Evento de recibir un mensaje del worker: enviar por el dealer al router
socketWorker.on('message', function(packetRaw) {
	var packetString = packetRaw.toString();
	console.log('Fo-' + id + ':Worker finished: ' + packetString);
	var packet = JSON.parse(packetString);

    message_seq = packet.seq;                               // NEW Comprobar el número de secuencia
    
	dealer.send(JSON.stringify(packet));
});

// Al recibir una notifiación de trabajo completado, informar al worker
dealer.on('message', function (sender, packetRaw) {
	clearTimeout(timeoutTimer);
	timeoutTimer = null;
	var packetString = packetRaw.toString();
	console.log('Fo-' + id + ':Worked from handler: ' + packetString);
	var packet = JSON.parse(packetString);
	socketWorker.send(packetString);
});

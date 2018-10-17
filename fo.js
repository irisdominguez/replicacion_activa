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

var timeoutTimer = null;
var waitingPackets = {};                           // NEW (key=sequence number, value=corresponding packet
var expected_seq_n = 1;                         // NEW

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
	console.log('Worker finished: ' + packetString);
	var packet = JSON.parse(packetString);

    message_seq = packet.seq;                               // NEW Comprobar el número de secuencia
    
	dealer.send(JSON.stringify(packet));
});

// Al recibir una notifiación de trabajo completado, informar al worker
dealer.on('message', function (sender, packetRaw) {
	clearTimeout(timeoutTimer);
	timeoutTimer = null;
	var packetString = packetRaw.toString();
	console.log('Worked from handler: ' + packetString);
	var packet = JSON.parse(packetString);
    if (packet.seq == expected_seq_n) {                      // NEW  Enviar en función del número de secuencia
	    socketWorker.send(packetString);                      // old code but inside the new if
        expected_seq_n += 1;                                              // NEW
        while (expected_seq_n in waitingPackets) {   // NEW
            socketWorker.send(waitingPackets[expected_seq_n].toString()); // NEW
            delete waitingPackets[expected_seq_n];    // NEW remove from waitingPackets
            expected_seq_n += 1;                                          // NEW
        }
    }
    else if (packet.seq > expected_seq_n) { // NEW  Store message
        waitingPackets[packet.seq] = packet; 
    }
    // Si el número de secuencia que llega es menor al esperado, se descarta el paquete ¿?
});

try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}

var CONFIG = require('./constants.js');

if( process.argv.length < 3) {
	console.log('Parametros incorrectos');
	console.log('Modo de ejecucion: node worker.js IDWORKER (>=1)');
	process.exit(1);
}

var id = process.argv[2];
 
var socket = zmq.socket('rep');
socket.connect(CONFIG.IP_WORKERS + (CONFIG.PORT_WORKERS + id));

socket.on('message', function(packetRaw) {
	var packetString = packetRaw.toString();
	console.log('Worker received: ' + packetString);
	var packet = JSON.parse(packetString);
	var newPacket = {
		id: packet.id,
		message: 'worked: ' + packet.message,
		source: 'worker' + id,
		target: packet.source,
		producer: packet.producer,
		type: 'worker_reply',
        seq: packet.seq                                                   // NEW
	}
	socket.send(JSON.stringify(newPacket));
});
/* 
 * Haciendolo así creo que no es consistente
 * Según lo veo es fo.js que comprueba si el número de secuencia es el que toca (por así decirlo)
 * Tal y como está ahora, totalorder le pasa a worker y worker a fo
 * Por tanto fo comprueba la secuencia después de que el worker ya ha trabajado
 * De manera que si hay una petición con nºsecuencia 1 que sea x=1 y una con nºsecuencia 2 que sea x=2
 * Si el worker recibe primero la segunda, el resultado final de x será 1 en el worker
 * O esto no importa¿?
 */

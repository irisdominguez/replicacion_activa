try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}

var CONFIG = require('./constants.js');

if( process.argv.length < 3) {
	console.log('Parametros incorrectos');
	console.log('Modo de ejecucion: node client.js IDCLIENTE (>=1)');
	process.exit(1);
}

var id = process.argv[2];
var fullid = 'client' + id;

console.log(fullid + ' launched');

var logger = zmq.socket('push');
logger.connect(CONFIG.IP_LOGGER);

var requester = zmq.socket('req');
requester.connect(CONFIG.IP_CLIENTS + (CONFIG.PORT_CLIENTS + id));

var count = 0;

function sendRequest() {
	var packet = {
		id: 'client' + id + '.' + count,
		message: '|package ' + count + '|'
	} 
	count++;
	console.log('C-' + id + ':Sending request ' + count);
	var t = requester.send(JSON.stringify(packet));
	logger.send([fullid, 'Requested: ' + count]);
}

// Bucle de trabajo, el cliente envía una petición inicial y luego repite
// cada vez que llega un mensaje de trabajo completado
requester.on('message', function(request) {
	logger.send([fullid, 'Finished work']);
	setTimeout(sendRequest, 500);
	//~ sendRequest();
});

sendRequest();

try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}

var CONFIG = require('./constants.js');

setInterval(function() {
	global.gc();
}, 1500);

// Identity
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

// Sockets
var requester = zmq.socket('req');

// State variables
var count = 0;
var tr;
function sendRequest() {
	var max = 5;
	var aleatorio = Math.round( Math.random()*max*parseInt(id) );
	var textoMensaje = ''
	for(var i=0; i<parseInt(id); i++){
		textoMensaje = textoMensaje + ' * ';
	}
	textoMensaje = textoMensaje + ' _ ' + aleatorio;

	var frutas = ['Albaricoque',
	              'Mandarina',
				  'Naranja',
				  'Melon',
				  'Kiwi'];
	textoMensaje = frutas[aleatorio % frutas.length]

	var packet = {
		id: 'client' + id + '.' + count,
		//message: '¡Hola! Soy el cliente ' + id + ' y este es mi mensaje número ' + count + '. ¿Me lo guardas en el fichero, porfa? ¡Gracias!'
		message: JSON.stringify({nReps: aleatorio, mensaje: textoMensaje})
	}
	count++;
	console.log('C-' + id + ':Sending request ' + count);
	var t = requester.send(JSON.stringify(packet));
	tr = Date.now();
	logger.send([fullid, 'client_request', count]);
}

// Bucle de trabajo, el cliente envía una petición inicial y luego repite
// cada vez que llega un mensaje de trabajo completado
requester.connect(CONFIG.IP_CLIENTS + (CONFIG.PORT_CLIENTS + parseInt(id)));
requester.on('message', function(request) {
	tr = Date.now()-tr;
	logger.send([fullid, 'client_response', count, tr]);
	//~ setTimeout(sendRequest, 500);
	sendRequest();
});

sendRequest();

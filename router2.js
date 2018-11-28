try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}

var CONFIG = require('./constants.js');

console.log('R2');

setInterval(function() {
	global.gc();
}, 1500);

// Sockets
var handlerSocket = zmq.socket('router');
var workerSocket = zmq.socket('router');
var routerSocketPublisher = zmq.socket('pub');

handlerSocket.identity = 'totalorder';
workerSocket.identity = 'totalorder';


// Socket por el que nos comunicamos con los handlers
handlerSocket.bind(CONFIG.IP_ROUTER2_HANDLER,
	function(err) {
		if (err) throw err;
		handlerSocket.on('message', function(sender, packetRaw) {
			var packetString = packetRaw.toString();
			var packet = JSON.parse(packetString);
			console.log('R2:Received from handler [' + sender + ']: ' + 
				packet.seq + ', ' +
				packet.id);

			if (packet.target == 'workers') {
				var newPacket = packet;
				newPacket.type = 'totalorder_request';

				routerSocketPublisher.send('R2 ' + JSON.stringify(packet));
			}
		});
	}
);

// Socket por el que enviamos mensajes a los workers
routerSocketPublisher.bind(CONFIG.IP_ROUTERPUBLISHER,
	function(err) {
		if (err) throw err;
	}
);

// Socket por el que recibimos mensajes de los workers
workerSocket.bind(CONFIG.IP_ROUTER2_WORKER,
	function(err) {
		if (err) throw err;
		workerSocket.on('message', function(sender, packetRaw) {
			var packetString = packetRaw.toString();
			var packet = JSON.parse(packetString);
			console.log('R2:Received from worker [' + sender + ']: ' + 
				packet.originSeq + ', ' +
				packet.id + ', ' +
				packet.target);

			handlerSocket.send([
				packet.target,
				'totalorder',
				JSON.stringify(packet)
			]);
		});
	}
);

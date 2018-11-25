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


//Router por el que se habla con los handlers
handlerSocket.bind(CONFIG.IP_ROUTER2_HANDLER,
	function(err) {
		if (err) throw err;
	}
);

routerSocketPublisher.bind(CONFIG.IP_ROUTERPUBLISHER,
	function(err) {
		if (err) throw err;
	}
);

handlerSocket.on('message', function(sender, packetRaw) {
	var packetString = packetRaw.toString();
	console.log('R2:Received from handler [' + sender + ']: ' + packetString);
	var packet = JSON.parse(packetString);

	if (packet.target == 'workers') {
		var newPacket = packet;
		newPacket.type = 'totalorder_request';
		/*for (var i = 1; i < CONFIG.NUM_REPLICAS; i++) {
			workerSocket.send([
				'worker' + i,
				'totalorder',
				JSON.stringify(newPacket)
			]);
		}*/



		routerSocketPublisher.send('R2 ' + JSON.stringify(packet));
	}
}); // Handler Socket


//Router por el que se habla con los workers
workerSocket.bind(CONFIG.IP_ROUTER2_WORKER,
	function(err) {
		if (err) throw err;
	}
);

workerSocket.on('message', function(sender, packetRaw) {
	var packetString = packetRaw.toString();
	console.log('R2:Received from worker [' + sender + ']: ' + packetString);
	var packet = JSON.parse(packetString);

	handlerSocket.send([                                               //old code but now inside the new if
		packet.target,
		'totalorder',
		JSON.stringify(packet)
	]);
});// Worker Socket

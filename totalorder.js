try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}
var CONFIG = require('./constants.js');

var handlerSocket = zmq.socket('router');
var workerSocket = zmq.socket('router');

var totalorder = {}; // NEW Dictionary (key -> request id;, value -> array[seqn -> sequence number associated to that message, status -> whether it has been delivered])
var seq = 0;               // NEW

//Router por el que se habla con los handlers
handlerSocket.identity = 'totalorder';
handlerSocket.bind(CONFIG.IP_TO_HANDLER,
function(err) {
    if (err) throw err;
    handlerSocket.on('message', function(sender, packetRaw) {
		var packetString = packetRaw.toString();
		console.log('Received from handler [' + sender + ']: ' + packetString);
		var packet = JSON.parse(packetString);
		// Ordenar la peticion
        
        totalorder[packet.id] = [seq, "pending"]; //NEW
        seq+=1;                                                                  //NEW
        
		if (packet.target == 'workers') {
           var newPacket = {
              id: packet.id,
              message: packet.message,
              source: packet.source,
              target: packet.target,
              type: 'totalorder_request',
              producer: packet.producer,
              seq: totalorder[packet.id][0],                    //NEW sequence number
            }
			for (var i = 1; i < CONFIG.NUM_REPLICAS; i++) {
				workerSocket.send([
					'worker' + i, 
					'totalorder', 
					JSON.stringify(newPacket)
				]);
			}
		}
	});
}); // Handler Socket


//Router por el que se habla con los workers
workerSocket.identity = 'totalorder';
workerSocket.bind(CONFIG.IP_TO_WORKER, 
function(err) {
    if (err) throw err;
    workerSocket.on('message', function(sender, packetRaw) {
		var packetString = packetRaw.toString();
		console.log('Received from worker [' + sender + ']: ' + packetString);
		var packet = JSON.parse(packetString);
        
        if (totalorder[packet.id][1] == "pending") {      //  NEW solo se envía si no se ha enviado
           // return message to client and set as delivered
           totalorder[packet.id][1] = "delivered";             // NEW
           
           handlerSocket.send([                                               //old code but now inside the new if
                packet.target, 
			    'totalorder', //totalorder[packet.id][0], //sequence number      /*NEW*/
			    JSON.stringify(packet)
           ]);
           
        }
	});
}); // Worker Socket

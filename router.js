try {
    var zmq = require("zeromq");
}
catch(err) {
    var zmq = require('zmq');
}

var clientSocket = zmq.socket("router");
var handlerSocket = zmq.socket("router");


//Router por el que se habla con los handlers
handlerSocket.identity = "routerHandler";
handlerSocket.bind("tcp://127.0.0.1:49153",
function(err) {
    if (err) throw err;
    handlerSocket.on("message", function(sender, msg) { 
		console.log(sender);
		console.log(msg);
		console.log("Handler has worked");
		clientSocket.send(["1", sender, msg]);
	});
}); // Handler Socket


//Router por el que se habla con los clients
clientSocket.identity = "routerClient";
clientSocket.bind("tcp://127.0.0.1:49152", 
function(err) {
    if (err) throw err;
    clientSocket.on("message", function(sender, msg) { 
		console.log(sender);
		console.log(msg);
		console.log("received");
		handlerSocket.send(["1", sender, msg]);
	});
}); // Client Socket

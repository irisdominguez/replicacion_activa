var zmq = require("zeromq");
var clientSocket = zmq.socket("router");
var handlerSocket = zmq.socket("router");

handlerSocket.identity = "routerClientHandler";
handlerSocket.bind("tcp://127.0.0.1:49153",
function(err) {
    if (err) throw err;
    handlerSocket.on("message", function(sender, msg) { 
		console.log(sender);
		console.log(msg);
		console.log("Handler has worked");
	});
}); // Handler Socket

clientSocket.identity = "routerClientHandler";
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

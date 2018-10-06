var zmq = require("zeromq");
var routerClients = zmq.socket("dealer");

routerClients.identity = "1";
routerClients.connect("tcp://127.0.0.1:49153");

routerClients.on("message", function(id, msg) { 
	console.log(id + ", " + msg);
	routerClients.send("woorked message: " + msg);
});

try {
    var zmq = require("zeromq");
}
catch(err) {
    var zmq = require('zmq');
}
 
var requester = zmq.socket('req');
requester.connect('tcp://127.0.0.1:49252');


var count = 0;
setInterval(function() {
	count++;
	msg = "package " + count;
	console.log("send package");
	var t = requester.send(msg);
	console.log(t);
}, 1000);

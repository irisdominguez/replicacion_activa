try {
    var zmq = require("zeromq");
}
catch(err) {
    var zmq = require('zmq');
}
 
var requester = zmq.socket('req');
requester.connect('tcp://127.0.0.1:49252');


var count = 0;

function sendRequest() {
	msg = "package " + count;
	count++;
	console.log("Sending request " + count);
	var t = requester.send(msg);
}

requester.on('message', function(request) {
	sendRequest();
});

sendRequest();

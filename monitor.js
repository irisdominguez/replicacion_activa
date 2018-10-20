//Imports
try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}

var CONFIG = require('./constants.js');

var puller = zmq.socket('pull');


puller.connect(CONFIG.IP_LOGGER); //Router entre handlers y workers

puller.bind(CONFIG.IP_LOGGER,
function(err) {
    if (err) throw err;
    puller.on('message', function(sender, packetRaw) {
		console.log('[' + sender + '] -> ' + packetRaw.toString());
	});
});
 

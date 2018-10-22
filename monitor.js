//Imports
try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const readline = require('readline');

var CONFIG = require('./constants.js');


var puller = zmq.socket('pull');


puller.connect(CONFIG.IP_LOGGER); //Router entre handlers y workers

var state = {
	clientRequests: {},
	clientResponses: {},
	workerJobs: {},
	clientsAlive: 0,
	workersAlive: 0,
	handlersAlive: 0
}

function checkAlive() {
	exec('ps a | grep \'node client\' | wc -l', (err, stdout, stderr) => {
		if (err) {return;}
		state.clientsAlive = parseInt(stdout) - 2;
	});
	exec('ps a | grep \'node handler\' | wc -l', (err, stdout, stderr) => {
		if (err) {return;}
		state.handlersAlive = parseInt(stdout) - 2;
	});
	exec('ps a | grep \'node worker\' | wc -l', (err, stdout, stderr) => {
		if (err) {return;}
		state.workersAlive = parseInt(stdout) - 2;
	});
}

function printState() {
	process.stdout.write('\033c');
	var date = new Date();
	console.log(date);
	console.log('Clients = ', state.clientsAlive);
	console.log('Workers = ', state.workersAlive);
	console.log('Handlers = ', state.handlersAlive);
	console.log('Client requests = ', state.clientRequests);
	console.log('Client responses = ', state.clientResponses);
	console.log('Workers completed jobs = ', state.workerJobs);
	
	console.log('\n\n\x1b[33mClose this monitor and all other nodes with Ctrl+C');
}

puller.bind(CONFIG.IP_LOGGER,
function(err) {
    if (err) throw err;
    puller.on('message', function(sender, typeRaw, arg) {
		//~ console.log('[' + sender + '] -> ' + packetRaw.toString());
		var type = typeRaw.toString();
		if (type == 'client_request') {
			if (sender in state.clientRequests) {
				state.clientRequests[sender] += 1;
			}
			else {
				state.clientRequests[sender] = 1;
			}
		}
		if (type == 'client_response') {
			if (sender in state.clientResponses) {
				state.clientResponses[sender] += 1;
			}
			else {
				state.clientResponses[sender] = 1;
			}
		}
		if (type == 'worker_processed') {
			if (sender in state.workerJobs) {
				state.workerJobs[sender] += 1;
			}
			else {
				state.workerJobs[sender] = 1;
			}
		}
	});
	setInterval(function () {
		checkAlive();
		printState();
	}, 100);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('close', () => {
	exec('killall -9 node', (err, stdout, stderr) => {});
})

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
var nreq = 0;


puller.connect(CONFIG.IP_LOGGER); //Router entre handlers y workers

var state = {
	clientRequests: {},
	clientResponses: {},
	responseTime: [],
	workerJobs: {},
	clientsAlive: 0,
	workersAlive: 0,
	handlersAlive: 0
}

function checkAlive() {
	exec('ps a | grep \'/bin/sh -c node client.js\' | wc -l', (err, stdout, stderr) => {
		if (err) {return;}
		state.clientsAlive = parseInt(stdout) - 2;
	});
	exec('ps a | grep \'/bin/sh -c node handler.js\' | wc -l', (err, stdout, stderr) => {
		if (err) {return;}
		state.handlersAlive = parseInt(stdout) - 2;
	});
	exec('ps a | grep \'/bin/sh -c node worker.js\' | wc -l', (err, stdout, stderr) => {
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
	console.log('csv prep = ', state.responseTime);
	
	console.log('\n\n\x1b[33mClose this monitor and all other nodes with Ctrl+C');
	if (!state.launched) console.log('Launch the system with \'l\'');
}

puller.bind(CONFIG.IP_LOGGER,
function(err) {
    if (err) throw err;
    puller.on('message', function(sender, typeRaw, arg, arg2) {
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
				nreq = nreq + 1;
				state.responseTime[nreq] = '[' + state.clientsAlive.toString() + ', ' + arg2 + ']';
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

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
	if (key.ctrl && key.name === 'c') {
		exec('killall -9 node', (err, stdout, stderr) => {});
		process.exit();
	} else if (key.name === 'l') {
		launch();
	}
});


function launch() {
	if (state.launched) return;
	state.launched = true;
	
	exec('mkdir LOGS', (err, stdout, stderr) => {if (err) {return;}});
	exec('mkdir LOGS/execution', (err, stdout, stderr) => {if (err) {return;}});
	
	function launchFragment(name) {
		exec('node ' + name + '.js &>LOGS/execution/' + name + '.log', 
			(err, stdout, stderr) => {if (err) {return;}});
	};
	
	function launchFragment(name, i) {
		exec('node ' + name + '.js ' + i + ' &>LOGS/execution/' + name + i + '.log', 
			(err, stdout, stderr) => {if (err) {return;}});
	};
	
	
	launchFragment('router');
	launchFragment('router2');
	launchFragment('totalorder');
	
	for (var i = 0; i < CONFIG.NUM_REPLICAS; i++) {	
		launchFragment('worker', i);
	}
	
	for (var i = 0; i < CONFIG.NUM_HANDLERS; i++) {	
		launchFragment('handler', i);
	}
	
	for (var i = 0; i < CONFIG.NUM_CLIENTES; i++) {	
		launchFragment('rr', i);
	}
	for (var i = 0; i < CONFIG.NUM_CLIENTES; i++) {	
		launchFragment('client', i);
	}
}


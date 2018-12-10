//Imports
try {
    var zmq = require('zeromq');
}
catch(err) {
    var zmq = require('zmq');
}
const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);
const readline = require('readline');

var CONFIG = require('./constants.js');

setInterval(function() {
	global.gc();
}, 1500);


var puller = zmq.socket('pull');

puller.connect(CONFIG.IP_LOGGER); //Router entre handlers y workers

var state = {
	clientRequests: {},
	clientResponses: {},
	workerJobs: {},
	clientsAlive: 0,
	workersAlive: 0,
	handlersAlive: 0,
	launchedClients: 0,
	router1Alive: 0,
	router2Alive: 0
}

function checkAlive() {
	exec('ps -o command= a | grep \'^node --expose-gc client.js\' | wc -l', (err, stdout, stderr) => {
		if (err) {return;}
		state.clientsAlive = parseInt(stdout);
	});
	exec('ps -o command= a | grep \'^node --expose-gc handler.js\' | wc -l', (err, stdout, stderr) => {
		if (err) {return;}
		state.handlersAlive = parseInt(stdout);
	});
	exec('ps -o command= a | grep \'^node --expose-gc worker.js\' | wc -l', (err, stdout, stderr) => {
		if (err) {return;}
		state.workersAlive = parseInt(stdout);
	});
	exec('ps -o command= a | grep \'^node --expose-gc router.js\' | wc -l', (err, stdout, stderr) => {
		if (err) {return;}
		state.router1Alive = parseInt(stdout);
	});
	exec('ps -o command= a | grep \'^node --expose-gc router2.js\' | wc -l', (err, stdout, stderr) => {
		if (err) {return;}
		state.router2Alive = parseInt(stdout);
	});
}

function printState() {
	process.stdout.write('\033c');
	var date = new Date();
	console.log(date);
	console.log('Clients = ', state.clientsAlive);
	console.log('Workers = ', state.workersAlive);
	console.log('Handlers = ', state.handlersAlive);
	console.log('Router1 = ', state.router1Alive);
	console.log('Router2 = ', state.router2Alive);
	console.log('Client requests = ', state.clientRequests);
	console.log('Client responses = ', state.clientResponses);
	console.log('Workers completed jobs = ', state.workerJobs);

	console.log('\n\x1b[33mClose this monitor and all other nodes with Ctrl+C or \'q\'');
	if (!state.launched) console.log('Launch the system with \'l\'');
}

puller.bind(CONFIG.IP_LOGGER,
function(err) {
    if (err) throw err;
    puller.on('message', function(sender, typeRaw, arg, arg2) {
		//~ console.log('[' + sender + '] -> ' + packetRaw.toString());
		var type = typeRaw.toString();
		if (type == 'client_request') {
			state.clientRequests[sender] = (state.clientRequests[sender] || 0) + 1;
		}
		if (type == 'client_response') {
			state.clientResponses[sender] = (state.clientResponses[sender] || 0) + 1;

			if (!state.closing) {
				fs.appendFileSync(__dirname + '/LOGS/measures/responseTime.csv', state.launchedClients.toString() + ', ' + arg2 + '\n',
					function(err) { if(err) { return console.log(err); }});
			}
		}
		if (type == 'worker_processed') {
			state.workerJobs[sender] = (state.workerJobs[sender] || 0) + 1;
		}
	});
	setInterval(function () {
		checkAlive();
		printState();
	}, 500);
});

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
	if (key.name === 'q' ||
		(key.ctrl && key.name === 'c')) {

		state.closing = true;

		exec('killall -SIGTERM node', (err, stdout, stderr) => {});
		setTimeout(function() {
			process.exit();
		}, 100);
	} else if (key.name === 'l') {
		launch();
	}
});

function launchFragment(name) {
	exec('node --expose-gc ' + name + '.js &> LOGS/execution/' + name + '.log',
		(err, stdout, stderr) => {if (err) {return;}});
};

function launchFragmentWithIndex(name, i) {
	exec('node --expose-gc ' + name + '.js ' + i + ' &> LOGS/execution/' + name + i + '.log',
		(err, stdout, stderr) => {if (err) {return;}});
};

function launchClient() {
	state.launchedClients += 1;
	launchFragmentWithIndex('rr', state.launchedClients);
	launchFragmentWithIndex('client', state.launchedClients);
}

function launch() {
	if (state.launched) return;
	state.launched = true;

	exec('mkdir LOGS', (err, stdout, stderr) => {if (err) {return;}});
	exec('rm -rf LOGS/execution; mkdir LOGS/execution', (err, stdout, stderr) => {if (err) {return;}});

	exec('mkdir LOGS/measures', (err, stdout, stderr) => {if (err) {return;}});
	exec('rm LOGS/measures/responseTime.csv; touch LOGS/measures/responseTime.csv', (err, stdout, stderr) => {if (err) {return;}});
	
	launchFragment('router');
	launchFragment('router2');
	launchFragment('totalorder');

	for (var i = 1; i <= CONFIG.NUM_REPLICAS; i++) {
		exec('rm -rf LOGS/logworker' + i + '.txt', (err, stdout, stderr) => {if (err) {return;}});
		launchFragmentWithIndex('worker', i);
	}

	for (var i = 1; i <= CONFIG.NUM_HANDLERS; i++) {
		launchFragmentWithIndex('handler', i);
	}

	setInterval(function () {
		launchClient();
	}, 5000);
}


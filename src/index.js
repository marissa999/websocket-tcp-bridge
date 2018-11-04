// net is needed for the socket connection
const net = require('net');

// utf8 is needed to convert a string to utf8
const utf8 = require('utf8');

// those dependencies are needed for the communication between
// this server and the client's browser
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// important variables
config = {
	'ip': process.env.IP || "localhost",
	'port': process.env.PORT || 3000
};

// tell the user that only websockets are allowed
app.get('*', function(req, res) {
	res.send('you need to use a websocket');
});

io.on('connection', (webSocket) => {
	console.log('a user connected.');

	let endPointInformation;
	let endPointSocket;

	// the middle got information from the client about the middleware
	webSocket.on('endPointInformation', (data) => {
		endPointSocket = new net.Socket();
		endPointSocket.connect(data.port, data.hostname);

		// the endpoint sent data to the middleware
		// forward the data to the client
		endPointSocket.on('data', function (data) {
			const decodedString = String.fromCharCode.apply(null, new Uint8Array(data));
			console.log(decodedString);
			webSocket.emit('data', decodedString);
		});
	})

	// the client sent data to the middleware
	// forward the data to the endpoint
	webSocket.on('sendData', (data) => {
		if (endPointSocket == undefined){
			console.log("didnt initialise connection to socket. do nothing");
		} else {
			console.log("received data from middleware. forward it to the endpoint");
			console.log(data);
			endPointSocket.write(data);
		}
	})

});

http.listen(config.port, function() {
	console.log(`listening on *:${config.port}`);
});


/*
let client = new net.Socket();
client.connect(8997, 'syncplay.pl', () => {
	const helloMessage = utf8.encode(`{"Hello": {"username": "testicenti", "room": {"name": "supergaySyncPlay"}, "version": "1.2.255", "realversion": "1.6.0", "features": {"sharedPlaylists": true, "chat": true, "featureList": true, "readiness": true, "managedRooms": true}}}\r\n`);
	console.log(`Connected`);
	console.log(`Send message:\n${helloMessage}`);
	client.write(helloMessage);
	console.log("Message sent");
});

client.on('data', function(data) {
	console.log('Received: ' + data);
});

client.on('close', function() {
	console.log('Connection closed');
});
*/
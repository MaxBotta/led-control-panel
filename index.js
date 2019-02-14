var express = require('express');
var socket = require('socket.io');
var find = require("local-devices");

// App setup
var app = express();
var server = app.listen(5000, function () {
    console.log("listening to request on port 5000");
});

// // Static files
app.use(express.static('public'));

// Find all local network devices.
// find().then((devices) => {
//     console.log("Local devices:");
//     console.log(devices);
// });

var CLIENTS = [];
var DEVICES = [];
var USERS = [];
var PONG_TIMEOUT = 4000; //client has 1.5s to respond with pong

const WebSocket = require('ws');

var wss = new WebSocket.Server({ server });

// Broadcast to all.
wss.broadcast = function broadcast(event) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(event.data);
        }
    });
};

wss.on("connection", function connection(ws, req) {
    const ip = req.connection.remoteAddress;
    console.log("new websocket connected: " + ip);

    //Set ip of websocket as a unique id
    ws.ip = ip;

    //Add to list of connected websockets
    CLIENTS.push(ws);
    console.log("clients: ");
    CLIENTS.forEach(function each(client) {
        //console.log(client.ip);
    })

    //Tell new client, that it has successfully connected to our server
    ws.send(JSON.stringify({ type: "message", value: "Connected to Server" }));

    checkIfAlive(ws);

    ws.onmessage = function (event) {
        //ws.send( JSON.stringify( { type: "message", value: "The Server received your message!" } ));
        console.log(event.data);

        let message = JSON.parse(event.data);
        switch (message.type) {
            case "init":
                //After the first response, we check if its a device.
                //If it's a device, we add it to our device list
                if (message.isDevice == true) {
                    ws.isDevice = true;
                    DEVICES = getDevices();
                    // console.log("Devices:");
                    // console.log(DEVICES);

                    //Send list of devices (only ips) to our webapp
                    let devices = [];
                    DEVICES.forEach(function each(ws) {
                        devices.push(ws.ip);
                    })
                    console.log(devices);
                    sendToUsers({ type: "devices", value: devices });
                } else if (message.isDevice == false) {
                    ws.isDevice = false;
                    USERS.push(ws);
                    // console.log("Users:");
                    // console.log(USERS);
                }

                break;
            case "data":
                //send data to all devices
                sendToDevices(event.data);
                console.log(JSON.parse(event.data));
                break;
            case "message":
                //Broadcast message to all Users/Webapps
                sendToUsers(event.data);
                console.log(JSON.parse(event.data));
                break;
        }
    };

    ws.onclose = function (event) {
        // let devices = getDevices();
        // sendToUsers(JSON.stringify({ type: "message", value: "Device disconnected!" }));
        // sendToUsers(JSON.stringify({ type: "devices", value: devices }));
    }


});

function checkIfAlive(ws) {
    var lastPongReceived = Date.now();
    ws._socket.on('data', function (data) {
        if (data[0] == 0x8a) { //opcode of pong response
            lastPongReceived = Date.now();
        }
    });

    var x = setInterval(function () {
        if (Date.now() - lastPongReceived > PONG_TIMEOUT) {
            console.log('pong timeout elapsed');

            //...code to run if connection unavailable

            ws.close();
            clearInterval(x);
            ws._socket.destroy(); // won't raise 'close' event, because close message 
            //cannot be delivered to client   

            //Notify Users/Webapp
            DEVICES = getDevices();
            let devices = [];
            DEVICES.forEach(function each(ws) {
                devices.push(ws.ip);
            })
            sendToUsers({ type: "message", value: "Device disconnected!" });
            sendToUsers({ type: "devices", value: devices });
        }
        if (ws.readyState === 1) {
            ws.ping('.', false);
        }
    }, 1000);
}

function getDevices() {
    let devices = [];
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            if (client.isDevice) {
                devices.push(client);
            }
        }
    });
    console.log(devices.length);
    return devices;
}

function sendToDevices(data) {
    DEVICES.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

function sendToUsers(data) {
    USERS.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}




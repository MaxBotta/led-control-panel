var wifi = require("Wifi");
var WebSocket = require("ws");

var wifi_conf = { ssid: "FRITZ!Box 7412", password: { password: "98865898262495880356" } };

wifi.connect(wifi_conf.ssid, wifi_conf.password, function (err) {
  if (err) {
    console.log("Wifi connection error: " + err);
    return;
  }
  console.log("Connected to wifi!");
  console.log(wifi.getIP());
});

var host = "192.168.178.63";

var ws = new WebSocket(host, {
  path: '/',
  port: 5000, // default is 80
  protocol: "echo-protocol", // websocket protocol name (default is none)
  protocolVersion: 13, // websocket protocol version, default is 13
  origin: 'Espruino'
  //headers:{ some:'header', 'ultimate-question':42 } // websocket headers to be used e.g. for auth (default is none)
});

ws.on('open', function() {
  console.log("Connected to server");
});

ws.on('message', function (message) {
  console.log(message);
});

// ws.on('getState', function(data) {
//   console.log("Got Message: ");
//   console.log(data);
// });
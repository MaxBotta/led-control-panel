
var btnOn = document.getElementById("btn-on"),
    feedback = document.getElementById("feedback");

var data = { type: "data", value: { lightOn: false, color: "" } };
var DEVICES = [];

var logs = [];

var host_ip_home = "192.168.0.87";
var host_ip_iphone = "172.20.10.3";
var host = host_ip_home;
var port = "5000";
var ws = new WebSocket("ws://" + host + ":" + port);

ws.onopen = function () {
    console.log("Connected to server");
    //addLog("Connected to Server");
    ws.send(JSON.stringify({ type: "message", value: "Hello from webapp!" }));
    ws.send(JSON.stringify({ type: "init", isDevice: false }));
};
ws.onmessage = function (event) {
    let message = JSON.parse(event.data);
    console.log(message);

    if (message.type == "devices") {
        let devices = message.value;
        DEVICES = devices;
        updateDeviceStates();
    } else if (message.type == "message") {
        addLog( message.value);
    }
};

function addLog(text) {
    let p = document.createElement("p");
    p.innerHTML = "- " + text;
    feedback.appendChild(p);
}

function updateDeviceStates() {
    //Check list of devices and turn on control lights for each device
    var controlLights = document.getElementsByClassName("control-light");
    for (let e of controlLights)  {
        e.classList.remove("control-light-active");
    }
    for (let i = 0; i < DEVICES.length; i++) {
        controlLights[i].classList.add("control-light-active");
    }
    addLog("Currently " + DEVICES.length + " devices connected.");
}

btnOn.addEventListener("click", function () {
    data.value.lightOn = !data.value.lightOn;
    if (data.value.lightOn) {
        btnOn.style.backgroundColor = "rgba(0, 200, 100, 1)";
    } else {
        btnOn.style.backgroundColor = "rgba(210, 210, 210, 1)";
    }
    ws.send(JSON.stringify(data));
});

var colorButtons = document.getElementsByClassName("btn");
console.log(colorButtons);
for (var e of colorButtons) {
    e.addEventListener("click", (e) => {
        console.log(e.target.value);
        data.value.color = JSON.parse(e.target.value);
        ws.send(JSON.stringify(data));
    });
}

//Set styling of range sliders
var controlContainerHeight = document.getElementsByClassName("control-container")[0].clientHeight;
var rangeSliders = document.getElementsByClassName("range-slider");
for (var e of rangeSliders) {
    e.style.width = (e.parentNode.clientHeight - 40) + "px";
}

var colorPickerContainer = document.getElementById("color-picker-container");
var colorPicker = new iro.ColorPicker(colorPickerContainer, {
    width: colorPickerContainer.clientWidth,
    height: colorPickerContainer.clientHeight,
    color: { r: 255, g: 0, b: 0 },
    markerRadius: 8,
    padding: 0,
    sliderMargin: 24,
    sliderHeight: 20,
    borderWidth: 0,
    borderColor: "#fff",
    anticlockwise: true,
});

colorPicker.on("input:end", function (color, changes) {
    // Log the color's hex RGB value to the dev console
    console.log(color.rgb);
    data.value.color = color.rgb;
    ws.send(JSON.stringify(data));
});

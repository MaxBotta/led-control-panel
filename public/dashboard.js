
var btnOn = document.getElementById("btn-on"),
    feedback = document.getElementById("feedback"),
    buttons = document.getElementsByClassName("btn");

var data = { type: "data", value: { lightOn: true, color: "", speedMilli: 100 } };
var DEVICES = [];

var logs = [];

var host_ip_home = "192.168.0.87";
var host_ip_anna = "192.168.178.93";
var host_ip_iphone = "172.20.10.3";
var host = "localhost";
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
        addLog(message.value);
    }
};

function addLog(text) {
    let p = document.createElement("p");
    p.innerHTML = "- " + text;
    feedback.appendChild(p);
    updateScroll();
}
function updateScroll(){
    var element = document.getElementById("feedback");
    element.scrollTop = element.scrollHeight;
}

function updateDeviceStates() {
    //Check list of devices and turn on control lights for each device
    var controlLights = document.getElementsByClassName("control-light");
    for (let e of controlLights) {
        e.classList.remove("control-light-active");
    }
    for (let i = 0; i < DEVICES.length; i++) {
        controlLights[i].classList.add("control-light-active");
    }
    addLog("Currently " + DEVICES.length + " devices connected.");
}

function setButtons() {
    for (let e of buttons) {
        e.addEventListener("click", (event) => {
            //On button triggers different event
            let button = event.target.parentNode;
            if(button.id == "btn-on") {
                data.value.lightOn = !data.value.lightOn;
                ws.send(JSON.stringify(data));
            } else {
                let effect = button.dataset.effect;
                addLog(effect);
                ws.send(JSON.stringify( { type: "effect", props: { name: effect , isActive: true } } ))
            }
        });
    }
}
setButtons();


//Set styling of range sliders
function setRangeSliders() {
    var rangeSliders = document.getElementsByClassName("range-slider");
    var rangeSliderBackgrounds = document.getElementsByClassName("range-slider-background");
    for (var e of rangeSliders) {
        e.style.width = (e.parentNode.clientHeight - 40) + "px";

        //Add input event and change lights
        e.addEventListener("input", (event) => { setRangeSliderLight(event.target) });
        setRangeSliderLight(e);

    }
    for (var e of rangeSliderBackgrounds) {
        e.style.height = (e.parentNode.clientHeight - 46) + "px";
    }
}
setRangeSliders();

//Checks the slider value and calculates percentage to height
function setRangeSliderLight(element) {
    let value = element.value;
    let slider = element.nextElementSibling.firstElementChild;
    slider.style.height = ((slider.parentNode.clientHeight / 100) * value) + "px";
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
    wheelLightness: false
});

colorPicker.on("input:end", function (color, changes) {
    // Log the color's hex RGB value to the dev console
    console.log(color.rgb);
    data.value.color = color.rgb;
    // setBackgroundColor(color.rgb);
    setColorPreview(color.rgb);
    ws.send(JSON.stringify(data));
});

function setColorPreview(rgb) {
    let wrapper = document.getElementById("color-picker-preview");
    wrapper.style.background = `linear-gradient(to bottom, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1))`;
}

function setBackgroundColor(gb) {
    let wrapper = document.getElementById("wrapper-background");
    wrapper.style.background = `linear-gradient(to bottom, rgba(${color.r}, ${color.g}, ${color.b}, 1), rgba(${color.r }, ${color.g - 60}, ${color.b - 60}, 1))`;
}

function initRangeSpeed() {
    let speedRange = document.getElementById("range-speed");
    speedRange.addEventListener("input", (event) => { 
        data.value.speedMilli = event.target.value * 10;
        console.log(event.target.value * 10);
        ws.send(JSON.stringify(data));
     });
}
initRangeSpeed();

//Threshold for beat detection

function initRangeThreshold() {
    let thresholdRange = document.getElementById("range-threshold");
    thresholdRange.addEventListener("input", (event) => { 
        threshold = event.target.value / 100;
        addLog("threshold: " + threshold);
     });
}
initRangeThreshold();

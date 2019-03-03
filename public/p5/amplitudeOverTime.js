
/*
  Store an array of amplitude values and draw them over time.

  Inspired by http://tybenz.com/visualizr.

  getLevel() from the p5.Amplitude object and map it to the ellipse position.

  Press "T" to toggle between a sound file and audio input (mic).
 */

var mic, soundFile;
var amplitude;

var prevLevels = new Array(60);
let song;
let fft;
let peak;
let ellipseSize = 0;
var threshold = 0.8;
let beatDetected = false;


function setup() {
  let soundwaveDisplay = document.getElementById("soundwave-screen");
  c = createCanvas(soundwaveDisplay.clientWidth - 40, soundwaveDisplay.clientHeight - 40);
  c.parent(soundwaveDisplay);
  noStroke();

  rectMode(CENTER);
  colorMode(HSB);


  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT();
  fft.setInput(mic);
 

  //background(8);


  // load the sound, but don't play it yet
  soundFile = loadSound('assets/Rapossa-OrientalTales.mp3')

  amplitude = new p5.Amplitude();
  amplitude.setInput(mic);
  amplitude.smooth(0.6);
}

function draw() {
  peak = new p5.PeakDetect(20, 20000, threshold, 20);

  clear();
  fill(255, 10)

  //Beat detection
  fft.analyze();
  peak.update(fft);

  if(peak.isDetected && !beatDetected){
    ws.send(JSON.stringify( { type: "effect", props: { name: "colorFadeOut" , isActive: true } } ))
    beatDetected = true;
    setTimeout( () => { beatDetected = false }, 100 );
  } 
  if(peak.isDetected){
    ellipseSize = 200;
  } else {
    ellipseSize *= 0.95; 
  }
  
  fill(255);
  ellipse(width/2, height/2, ellipseSize);

  var level = amplitude.getLevel();

  // rectangle variables
  var spacing = 10;
  var w = width/ (prevLevels.length * spacing);

  var minHeight = 2;
  var roundness = 20;

  // add new level to end of array
  prevLevels.push(level);

  // remove first item in array
  prevLevels.splice(0, 1);

  // loop through all the previous levels
  for (var i = 0; i < prevLevels.length; i++) {

    var x = map(i, prevLevels.length, 0, width/2, width);
    var h = map(prevLevels[i], 0, 0.5, minHeight, height);

    var alphaValue = logMap(i, 0, prevLevels.length, 1, 250);

    var hueValue = map(h, minHeight, height, 200, 255);

    fill(hueValue, 255, 255, alphaValue);

    rect(x, height/2, w, h);
    rect(width - x, height/2, w, h);
  }
}


// function setup(){
//   mic = new p5.AudioIn()
//   mic.start();
// }

// var mic;
// more info here https://p5js.org/reference/#/p5.PeakDetect

let song;
let fft;
let peak;
let ellipseSize = 0;
let threshold = 0.24;

function preload(){
  song = loadSound('assets/Rapossa-OrientalTales.mp3');
}

function setup() {
  createCanvas(400, 400);
  
  fft = new p5.FFT();
  peak = new p5.PeakDetect(20, 20000, threshold, 20);
  
  song.play();
}

function draw() {
  background(220);
  
  
  fft.analyze();
  peak.update(fft);
  
  if(peak.isDetected){
    ellipseSize = 200;
  } else {
    ellipseSize *= 0.95; 
  }
  
  ellipse(width/2, height/2, ellipseSize);
}
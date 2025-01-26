var c = 40;
var pin = [];
var speed = 60;
var timestep = 0.04;
var time = 0;
var isDrawing = false;
var centerX = 200;
var centerY = 400;
var velocityX = 2;
var velocityY = 1.5;
var currentColorIndex = 0;
var lineWidth = 1;
var lineWidthDirection = 1;

// Using newTone23 - a nice gradient from dark blue to orange-red
const colors = ["#001219", "#005f73", "#0a9396", "#94d2bd", "#e9d8a6", "#ee9b00", "#ca6702", "#bb3e03", "#ae2012", "#9b2226"];

function setup() {
  createCanvas(400, 800);
  for (var i = 0; i < c; i++) {
    pin[i] = new MovingPin(map(i, 0, c, 0, TWO_PI));
  }
  smooth();
  background(255);
}

function draw() {
  if (isDrawing) {
    time += timestep;
    
    // Update color index
    if (frameCount % 30 === 0) {
      currentColorIndex = (currentColorIndex + 1) % colors.length;
    }
    
    // Update line width
    lineWidth += 0.05 * lineWidthDirection;
    if (lineWidth > 3 || lineWidth < 0.5) {
      lineWidthDirection *= -1;
    }
    
    centerX += velocityX;
    centerY += velocityY;
    
    if (centerX > width - 100 || centerX < 100) velocityX *= -1;
    if (centerY > height - 100 || centerY < 100) velocityY *= -1;
    
    velocityX += random(-0.01, 0.01);
    velocityY += random(-0.01, 0.01);
    velocityX = constrain(velocityX, -3, 3);
    velocityY = constrain(velocityY, -3, 3);
    
    for (var i = 0; i < c; i++) {
      pin[i].time = time;
      pin[i].update();
    }
    
    beginShape();
    noFill();
    stroke(colors[currentColorIndex] + '4D'); // Adding 30% opacity
    strokeWeight(lineWidth);
    curveVertex(pin[c - 2].x, pin[c - 2].y);
    curveVertex(pin[c - 1].x, pin[c - 1].y);
    for (var i = 0; i < c; i++) {
      curveVertex(pin[i].x, pin[i].y);
    }
    curveVertex(pin[0].x, pin[0].y);
    endShape();
  }
}

function MovingPin(a) {
  this.x;
  this.y;
  this.theta = a;
  this.magnitude = 0.0;
  this.omega = 0.1;
  this.time = 0.1;
  
  this.update = function() {
    this.omega = noise(this.theta, this.time + 1) / 2;
    this.magnitude = noise(this.theta, this.time) * 200;
    this.x = round(this.magnitude * cos(this.theta + this.omega) + centerX);
    this.y = round(this.magnitude * sin(this.theta + this.omega) + centerY);
  }
}

function mousePressed() {
  isDrawing = !isDrawing;
  time = 0;
}

function keyPressed() {
  background(255);
}
let shapes = [];
let curTime = 0.0;
let speed = 8.0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  background(100);
  
  let num = 180;
  for(let i = 0; i < num; i++) {
    let shape = new Shape(i, num, width/3);  // width/3 is the boxSize parameter
    shapes.push(shape);
  }
}

function draw() {
  // Create a subtle vignette effect
  let bgColor = color("#1a1a1a");
  let centerColor = color("#2a2a2a");
  
  let pulse = map(sin(curTime * 2), -1, 1, 0, 0.2);
  background(lerpColor(bgColor, centerColor, pulse));
  
  push();
  translate(0, 0, -200);
  noStroke();
  for(let i = 0; i < 50; i++) {
    let alpha = map(i, 0, 50, 50, 0);
    let sizeVal = map(i, 0, 50, width * 1.5, 0);
    fill(0, alpha * (1 - pulse));
    ellipse(0, 0, sizeVal, sizeVal);
  }
  pop();
  
  for(let shape of shapes) {
    shape.draw();
  }
  
  curTime += deltaTime * 0.0005;
}

class Shape {
  constructor(id, maxnum, boxSize) {  // Changed 'size' to 'boxSize'
    this.id = id;
    this.maxnum = maxnum;
    this.boxSize = boxSize;  // Changed property name
    this.col1 = color("#ffffff");
    this.col2 = color("#ff3366");
  }
  
  draw() {
    noFill();
    let maxid = this.maxnum * 0.1;
    let thresh = map(max(this.id, maxid), maxid, this.maxnum-1, 0, 1.0);
    
    let pulseColor = lerpColor(this.col2, color("#ff1a4d"), map(sin(curTime * 2), -1, 1, 0, 0.3));
    stroke(lerpColor(pulseColor, this.col1, thresh));
    
    strokeWeight(map(max(thresh, 0.5), 0.5, 1.0, 0.0, 1.5));
    
    push();
    let angle = curTime * speed + (this.id / this.maxnum * TWO_PI);
    
    rotateX(angle * 0.5);
    rotateY(angle * 0.3);
    rotateZ(angle * 0.1);
    
    let scale = map(this.id, 0, this.maxnum, 0.1, 1.0);
    scale *= map(sin(curTime * 2), -1, 1, 0.8, 1.2);
    
    box(this.boxSize * scale);  // Changed to use boxSize
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
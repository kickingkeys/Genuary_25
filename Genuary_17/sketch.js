let cam;
const PI4 = 4;
const CELL_SIZE = 15;
let quantumCells = [];
let transitionStarted = false;
let transitionTime = 0;
const TRANSITION_DURATION = 4000;
const RIPPLE_SPEED = 0.3;

class QuantumCell {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.origin = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(0.35);
    this.waveFunction = random(TWO_PI);
    this.piState = 0;
    this.color = { r: 0, g: 0, b: 0 };
  }

  update(centerX, centerY) {
    this.waveFunction += 0.05;
    
    if (transitionStarted) {
      let distance = dist(
        this.origin.x, 
        this.origin.y, 
        centerX, 
        centerY
      );
      
      let transitionProgress = (millis() - transitionTime) / TRANSITION_DURATION;
      let ripplePosition = transitionProgress * width * RIPPLE_SPEED;
      
      if (distance < ripplePosition) {
        let rippleFade = constrain(
          map(ripplePosition - distance, 0, 100, 0, 1),
          0, 1
        );
        this.piState = rippleFade;
      }
    }

    let angle = noise(
      this.pos.x * 0.003, 
      this.pos.y * 0.003, 
      frameCount * 0.01
    ) * TWO_PI * (1 + this.piState);
    
    this.vel.add(p5.Vector.fromAngle(angle).mult(0.065));
    this.vel.mult(0.925);
    this.pos.add(this.vel);

    let toOrigin = p5.Vector.sub(this.origin, this.pos);
    toOrigin.mult(0.01);
    this.vel.add(toOrigin);
  }

  draw() {
    push();
    translate(this.pos.x + CELL_SIZE/2, this.pos.y + CELL_SIZE/2);

    let quantumEffect = map(sin(this.waveFunction), -1, 1, 0.9, 1.1);
    
    noStroke();
    fill(
      this.color.r * quantumEffect,
      this.color.g * quantumEffect,
      this.color.b * quantumEffect
    );
    
    let dimension = CELL_SIZE;
    
    beginShape();
    let steps = 16;
    for(let i = 0; i < steps; i++) {
      let angle = (i / steps) * TWO_PI;
      let radius = dimension/2;
      
      radius *= lerp(
        1,
        abs(cos(angle * 2) * 0.8 + 0.6),
        this.piState
      );
      
      let px = cos(angle) * radius;
      let py = sin(angle) * radius;
      vertex(px, py);
    }
    endShape(CLOSE);
    
    pop();
  }
}

function setup() {
  createCanvas(400, 800);
  cam = createCapture(VIDEO);
  cam.hide();
  colorMode(RGB);
  background(0);
  initQuantumCells();
  
  setTimeout(() => {
    transitionStarted = true;
    transitionTime = millis();
  }, 6000);
}

function initQuantumCells() {
  quantumCells = [];
  for(let x = 0; x < width; x += CELL_SIZE) {
    for(let y = 0; y < height; y += CELL_SIZE) {
      quantumCells.push(new QuantumCell(x, y));
    }
  }
}

function draw() {
  background(0);
  
  if (cam.width > 0) {
    cam.loadPixels();
    
    let vScale = height/cam.height;
    let scaledWidth = cam.width * vScale;
    let xOffset = (width - scaledWidth) / 2 - 50;
    
    push();
    translate(xOffset + scaledWidth/2, 0);
    scale(-vScale, vScale);
    translate(-cam.width/2, 0);
    
    let centerX = width/2;
    let centerY = height/2;
    
    for(let cell of quantumCells) {
      let camX = floor(cell.origin.x);
      let camY = floor(cell.origin.y);
      
      if (camX < cam.width && camY < cam.height) {
        cell.color = getAverageCellColor(camX, camY, cam);
      }
      
      cell.update(centerX, centerY);
      cell.draw();
    }
    
    pop();
  }
}

function getAverageCellColor(x, y, cam) {
  let r = 0, g = 0, b = 0;
  let count = 0;
  
  for(let i = 0; i < CELL_SIZE; i++) {
    for(let j = 0; j < CELL_SIZE; j++) {
      if (x + i < cam.width && y + j < cam.height) {
        let index = ((y + j) * cam.width + (x + i)) * 4;
        r += cam.pixels[index];
        g += cam.pixels[index + 1];
        b += cam.pixels[index + 2];
        count++;
      }
    }
  }
  
  return {
    r: r / count,
    g: g / count,
    b: b / count
  };
}
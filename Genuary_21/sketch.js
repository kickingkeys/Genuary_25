let flowers = [];
let oscillators = [];
const MAX_OSCILLATORS = 8;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
  
  for (let i = 0; i < MAX_OSCILLATORS; i++) {
    let osc = new p5.Oscillator('sine');
    osc.start();
    osc.amp(0);
    oscillators.push(osc);
  }
  
  userStartAudio();
  
  for (let i = 0; i < 15; i++) {
    bees.push(new Bee(random(width), random(height)));
  }
}

class Bee {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 3));
    this.wingSpan = random(20, 40);
    this.angle = 0;
    this.wingSpeed = random(0.1, 0.2);
  }
  
  update() {
    this.pos.add(this.vel);
    this.angle = sin(frameCount * this.wingSpeed) * PI/3;
    
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;
  }
  
  checkCollision(other) {
    let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
    if (d < this.wingSpan) {
      flowers.push(new Flower(
        (this.pos.x + other.pos.x) / 2,
        (this.pos.y + other.pos.y) / 2
      ));
      
      let availableOsc = oscillators.find(osc => osc.amp().value === 0);
      if (availableOsc) {
        const notes = [293.66, 369.99, 440.00, 554.37, 659.25];
        availableOsc.freq(random(notes));
        availableOsc.amp(0.1, 0.05);
        availableOsc.amp(0, 0.2);
      }
      
      this.vel.rotate(random(-PI/2, PI/2));
      other.vel.rotate(random(-PI/2, PI/2));
      return true;
    }
    return false;
  }
  
  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    
    fill(255, 215, 0);
    stroke(0);
    strokeWeight(1);
    ellipse(0, 0, this.wingSpan * 0.6, this.wingSpan * 0.4);
    
    fill(0);
    noStroke();
    rect(-this.wingSpan * 0.15, -this.wingSpan * 0.15, 
         this.wingSpan * 0.1, this.wingSpan * 0.3);
    rect(this.wingSpan * 0.05, -this.wingSpan * 0.15, 
         this.wingSpan * 0.1, this.wingSpan * 0.3);
    
    fill('rgba(255, 255, 255, 0.7)');
    noStroke();
    push();
    rotate(this.angle);
    ellipse(0, 0, this.wingSpan, this.wingSpan/2);
    pop();
    push();
    rotate(-this.angle);
    ellipse(0, 0, this.wingSpan, this.wingSpan/2);
    pop();
    
    pop();
  }
}

class Flower {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.size = 0;
    this.maxSize = random(20, 35);
    this.petalCount = floor(random(6, 9));
    this.rotation = random(TWO_PI);
    this.growthSpeed = random(0.8, 1.2);
    
    this.colors = [
      color(255, 182, 193),
      color(255, 218, 185),
      color(221, 160, 221)
    ];
    
    this.mainColor = random(this.colors);
  }
  
  grow() {
    if (this.size < this.maxSize) {
      this.size += this.growthSpeed;
    }
  }
  
  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation + frameCount * 0.01);
    
    for (let i = 0; i < this.petalCount; i++) {
      push();
      rotate((TWO_PI / this.petalCount) * i);
      
      fill(red(this.mainColor), 
           green(this.mainColor), 
           blue(this.mainColor), 
           200);
      stroke(100);
      strokeWeight(0.5);
      
      ellipse(this.size * 0.5, 0, 
              this.size, 
              this.size * 0.4);
      pop();
    }
    
    noStroke();
    fill(255, 220, 0);
    circle(0, 0, this.size * 0.4);
    
    pop();
  }
}

let bees = [];

function draw() {
  background(135, 206, 235);
  
  flowers.forEach(f => {
    f.grow();
    f.draw();
  });
  
  for (let i = 0; i < bees.length; i++) {
    bees[i].update();
    for (let j = i + 1; j < bees.length; j++) {
      bees[i].checkCollision(bees[j]);
    }
    bees[i].draw();
  }
}

function mousePressed() {
  bees.push(new Bee(mouseX, mouseY));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
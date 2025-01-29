
/*
INFINITE SCROLL PARTICLE SYSTEM
------------------------------

SETUP
1. Canvas setup: 400x800
2. Color arrays: 5 schemes x 8 colors (light/dark pairs)
3. Init 150 particles

MAIN COMPONENTS
--------------
State tracking:
  - scrollOffset (y-position)
  - speeds (current/target)
  - particle array
  - active color scheme

Particle properties:
  - position(x,y)
  - wave motion (angle, speed, amplitude) 
  - color from scheme
  - size range 3-12px

Core loops:
  1. Handle input (arrow keys)
  2. Update scroll position with momentum
  3. Move/wrap particles
  4. Apply wave motion
  5. Draw with glow effect
  6. Cycle colors every 300 frames

Motion math:
  speed += (target - current) * 0.2  // acceleration
  speed *= 0.95                      // friction
  y += speed                         // movement

Constants to tune:
  SCROLL_SPEED = 6.5
  ACCELERATION = 0.2
  FRICTION = 0.95
  PARTICLES = 150
*/


let particles = [];
let scrollOffset = 0;
let targetSpeed = 0;
let currentSpeed = 0;
const SCROLL_SPEED = 6.5;
const ACCELERATION = 0.2;
const FRICTION = 0.95;
let currentScheme;
let colorSchemes;
let colorIndex = 0;

function setup() {
  createCanvas(400, 800);
  colorMode(RGB);
  
  colorSchemes = [
    ["#607274", "#faeed1", "#ded0b6", "#b2a59b", "#445152", "#e6dbb9", "#c4b49d", "#998d84"],
    ["#637E76", "#C69774", "#F8DFD4", "#FFEFE8", "#4a5e58", "#b37d5c", "#e6c3b3", "#ebd9d0"],
    ["#6B240C", "#994D1C", "#E48F45", "#F5CCA0", "#4d1a09", "#803f17", "#c97b3a", "#ddb68c"],
    ["#4C3D3D", "#C07F00", "#FFD95A", "#FFF7D4", "#332929", "#a66b00", "#e6c251", "#e6dfbf"],
    ["#B5C99A", "#862B0D", "#FFF9C9", "#FFC95F", "#9ab17f", "#6b220a", "#e6e0b5", "#e6b456"]
  ];
  
  currentScheme = random(colorSchemes);
  
  for (let i = 0; i < 150; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  background(0, 0, 0, 20);
  
  handleKeyInput();
  
  // Smooth acceleration
  currentSpeed += (targetSpeed - currentSpeed) * ACCELERATION;
  currentSpeed *= FRICTION;
  scrollOffset += currentSpeed;
  
  for (let p of particles) {
    p.update();
    p.display();
  }
  
  if (frameCount % 300 === 0) {
    currentScheme = random(colorSchemes);
    colorIndex = 0;
    for (let p of particles) {
      p.updateColor();
      colorIndex = (colorIndex + 1) % currentScheme.length;
    }
  }
}

function handleKeyInput() {
  if (keyIsDown(UP_ARROW)) {
    targetSpeed = -SCROLL_SPEED;
  } else if (keyIsDown(DOWN_ARROW)) {
    targetSpeed = SCROLL_SPEED;
  } else {
    targetSpeed = 0;
  }
}

class Particle {
  constructor() {
    this.reset();
    this.y = random(height);
    this.updateColor();
  }
  
  updateColor() {
    this.color = color(currentScheme[colorIndex]);
    colorIndex = (colorIndex + 1) % currentScheme.length;
  }
  
  reset() {
    this.x = random(width);
    this.baseY = random(height);
    this.size = random(3, 12);
    this.angle = random(TWO_PI);
    this.angleSpeed = random(0.02, 0.05);
    this.amplitude = random(20, 40);
  }
  
  update() {
    this.angle += this.angleSpeed;
    let wave = sin(this.angle) * this.amplitude;
    
    this.y = (this.baseY + scrollOffset + wave) % height;
    if (this.y < 0) this.y += height;
    
    this.x += sin(this.angle * 0.5) * 0.5;
    if (this.x < 0) this.x += width;
    if (this.x > width) this.x -= width;
  }
  
  display() {
    noStroke();
    let alpha = map(sin(this.angle), -1, 1, 100, 255);
    let c = color(this.color);
    fill(red(c), green(c), blue(c), alpha);
    
    push();
    translate(this.x, this.y);
    rotate(this.angle * 0.5);
    
    beginShape();
    for (let i = 0; i < TWO_PI; i += PI/6) {
      let rad = this.size + sin(i * 2 + this.angle) * 2;
      let px = cos(i) * rad;
      let py = sin(i) * rad;
      curveVertex(px, py);
    }
    endShape(CLOSE);
    
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = color(red(c), green(c), blue(c), 0.2);
    pop();
  }
}
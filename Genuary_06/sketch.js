let shapes = [];
let colors = ['#00A5E3', '#8DD7BF', '#FF96C5', '#FF5768', '#FFBF65'];
let time = 0;
let mousePos;
let prevMousePos;
let mouseVel;
let isMousePressed = false;

class Stalk {
  constructor(x, y, length) {
    this.basePos = createVector(x, y);
    this.points = [];
    this.length = length;
    this.segments = 5;
    
    for (let i = 0; i <= this.segments; i++) {
      this.points.push(createVector(x, y - (length * i) / this.segments));
    }
  }

  update(headPosition) {
    this.points[0] = this.basePos.copy();
    for (let i = 1; i <= this.segments; i++) {
      let t = i / this.segments;
      let x = lerp(this.basePos.x, headPosition.x, t);
      let y = lerp(this.basePos.y, headPosition.y, t);
      this.points[i].set(x, y);
    }
  }

  draw() {
    stroke('#8DD7BF');
    strokeWeight(1);
    noFill();
    beginShape();
    this.points.forEach(p => vertex(p.x, p.y));
    endShape();
  }

  getTopPosition() {
    return this.points[this.segments];
  }
}

class Shape {
  constructor(type, x, y, options) {
    this.type = type;
    this.originalPos = createVector(x, y);
    this.pos = this.originalPos.copy();
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.stalk = new Stalk(x, y + options.stalkLength, options.stalkLength);
    this.options = options;
    this.hasAmbientMotion = random() < 0.15;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    if (this.hasAmbientMotion) {
      let swayX = map(noise(time * 2 + this.pos.x * 0.01), 0, 1, -1, 1);
      let swayY = map(noise(time * 2 + this.pos.y * 0.01), 0, 1, -0.5, 0.5);
      this.acc.add(createVector(swayX, swayY).mult(0.2));
    }
    if (isMousePressed && mouseVel && mouseVel.mag() > 0.1) {
      let d = p5.Vector.dist(this.pos, mousePos);
      let angle = mouseVel.heading();
      
      let relativePos = p5.Vector.sub(this.pos, mousePos);
      let relativeAngle = relativePos.heading() - angle;
      let relativeDist = relativePos.mag();
      
      let maxWidth = map(relativeDist, 0, 80, 40, 10);
      let angleThreshold = map(relativeDist, 0, 80, PI/2, PI/6);
      
      if (relativeDist < 80 && abs(relativeAngle) < angleThreshold) {
        let force = p5.Vector.sub(this.pos, mousePos);
        let strength = map(relativeDist, 0, maxWidth, 0.4, 0);
        force.setMag(strength);
        this.applyForce(force);
      }
    }
    
    this.vel.add(this.acc);
    this.vel.mult(0.4);
    this.pos.add(this.vel);
    
    let springForce = p5.Vector.sub(this.originalPos, this.pos);
    let distFromOrigin = springForce.mag();
    springForce.mult(0.8 + (distFromOrigin * 0.01));
    this.applyForce(springForce);
    
    this.acc.mult(0);
    this.stalk.update(this.pos);
  }

  draw() {
    let pos = this.pos;
    push();
    translate(pos.x, pos.y);
    
    let angle = this.vel.heading() * 0.5;
    rotate(angle);
    
    noStroke();
    fill(this.options.color);
    
    if (this.type === 'rectangle') {
      rect(0, 0, this.options.w, this.options.h);
      fill(255, this.options.alpha * 0.3);
      rect(-this.options.w/4, -this.options.h/4, this.options.w/2, this.options.h/2);
    } else {
      drawFlower(this.options);
    }
    pop();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  mousePos = createVector(0, 0);
  prevMousePos = createVector(0, 0);
  mouseVel = createVector(0, 0);
  
  let density = 2500 / (800 * 800);
  let totalShapes = round(density * windowWidth * windowHeight);
  
  for (let i = 0; i < totalShapes; i++) {
    if (random() < 0.7) {
      addRectangle();
    } else {
      addFlower();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  shapes = [];
  setup();
}

function draw() {
  background('#fffbe6');
  time += 0.01;
  
  mousePos.set(mouseX, mouseY);
  mouseVel = p5.Vector.sub(mousePos, prevMousePos);
  prevMousePos.set(mousePos);
  
  shapes.forEach(shape => {
    shape.update();
    shape.stalk.draw();
  });
  
  shapes.forEach(shape => {
    shape.draw();
  });
}

function mousePressed() {
  isMousePressed = true;
}

function mouseReleased() {
  isMousePressed = false;
}

function drawFlower(f) {
  let petalCount = 5;
  let petalSize = f.size;
  
  for (let i = 0; i < petalCount; i++) {
    push();
    rotate(TWO_PI * i / petalCount);
    ellipse(petalSize/2, 0, petalSize, petalSize/2);
    pop();
  }
  
  fill(f.centerColor);
  ellipse(0, 0, petalSize/2, petalSize/2);
}

function addRectangle() {
  let y = random(height * 0.3, height);
  let sizeVariation = map(y, height, height * 0.3, 15, 5);
  let stalkLength = map(y, height * 0.3, height, 20, 60);
  
  shapes.push(new Shape('rectangle', random(width), y - stalkLength, {
    w: random(5, sizeVariation),
    h: random(10, sizeVariation * 2),
    color: random(colors),
    alpha: map(y, height, 0, 0.8, 0.3),
    stalkLength: stalkLength
  }));
}

function addFlower() {
  let y = random(height * 0.3, height);
  let sizeVariation = map(y, height, height * 0.3, 20, 8);
  let stalkLength = map(y, height * 0.3, height, 20, 60);
  
  shapes.push(new Shape('flower', random(width), y - stalkLength, {
    size: random(5, sizeVariation),
    color: random(colors),
    centerColor: random(colors),
    alpha: map(y, height, 0, 0.8, 0.3),
    stalkLength: stalkLength
  }));
}
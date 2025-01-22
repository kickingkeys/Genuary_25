let theta = 0;
let xNoise, yNoise;
let xMove;
let yMove;
let scaler = 1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  noiseSeed(random(1000));
  xNoise = new noiseLoop(5, 83, 125);
  yNoise = new noiseLoop(3, 42, 521);
  xMove = random(1000);
  yMove = random(1000);
  rectMode(CENTER);
}

function draw() {
  if (scaler > 0) {
    fill(0, 100);
    stroke(255);
    push();

    xMove += 0.005;
    yMove += 0.008;

    let xmover = map(noise(xMove, frameCount / 1000), 0, 1, -width / 3, width / 3);
    let ymover = map(noise(yMove, frameCount / 1000), 0, 1, -height / 3, height / 3);

    translate(width / 2 + xmover, height / 2 + ymover);
    scale(scaler);

    // Draw squares around the circle
    for (let i = 0; i <= TAU; i += TAU / 24) {
      let x = cos(i) * xNoise.value(i);
      let y = sin(i) * yNoise.value(i);
      let rectSize = map(noise(frameCount / 100 + i), 0, 1, 20, 40);

      push();
      translate(x, y);
      rotate(i + frameCount * 0.01);
      rect(0, 0, rectSize, rectSize);
      pop();
    }

    pop();
    scaler -= random(-0.0043, 0.0045);
  }
}

class noiseLoop {
  constructor(diameter, min, max) {
    this.diameter = diameter;
    this.min = min;
    this.max = max;
    this.offsetX = random(1000);
    this.offsetY = random(1000);
  }

  value(theta) {
    let xoff = map(cos(theta), -2, 4, 0, this.diameter) + this.offsetX;
    let yoff = map(sin(theta), -0.5, 3, 0, this.diameter) + this.offsetY;
    let r = noise(xoff, yoff, frameCount / 83);
    return map(r, 0, 1, this.min, this.max);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

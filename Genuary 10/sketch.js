const TAU = Math.PI * 2;
let particles = [];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, TAU, TAU, TAU);
  blendMode(ADD);
  background(0);
  initParticles();
}

function initParticles() {
  particles = [];
  let count = TAU * TAU;
  for (let i = 0; i < count; i++) {
    particles.push({
      angle: i * (TAU/count),
      radius: Math.log(TAU) * TAU,
      speed: Math.log(i + TAU),
      originalX: 0,
      originalY: 0,
      targetX: 0,
      targetY: 0
    });
  }
}

function draw() {
  background(0, TAU/8);
  
  let timeFlow = frameCount / (TAU * TAU);
  let mouseXNorm = (mouseX - width/2) / (width/2);
  let mouseYNorm = (mouseY - height/2) / (height/2);
  
  // Camera movement
  let cameraX = mouseXNorm * width/2;
  let cameraY = mouseYNorm * height/2;
  let cameraZ = -TAU * 8 + mouseYNorm * TAU * 4;
  translate(cameraX, cameraY, cameraZ);
  
  rotateX(mouseYNorm * TAU/2);
  rotateY(mouseXNorm * TAU/2);
  rotateZ(timeFlow);
  
  let mouseDist = dist(mouseX, mouseY, width/2, height/2);
  let particleScale = map(mouseDist, 0, width/2, 3, 0.5);
  
  particles.forEach((p, i) => {
    push();
    // Dynamic radius based on mouse position
    let distortionAmount = map(mouseDist, 0, width/2, 0, TAU * 2);
    p.targetX = mouseX - width/2;
    p.targetY = mouseY - height/2;
    
    p.originalX = lerp(p.originalX, p.targetX, 0.1);
    p.originalY = lerp(p.originalY, p.targetY, 0.1);
    
    let r = p.radius + sin(timeFlow * p.speed) * distortionAmount;
    r *= map(mouseDist, 0, width/2, 2, 1);
    
    let x = cos(p.angle) * r + p.originalX;
    let y = sin(p.angle) * r + p.originalY;
    let z = cos(timeFlow * p.speed + p.angle) * TAU * 4;
    
    translate(x, y, z);
    
    // Color based on mouse movement
    let hue = (p.angle + atan2(mouseYNorm, mouseXNorm)) % TAU;
    let saturation = map(mouseDist, 0, width/2, TAU * 0.8, TAU);
    let brightness = map(abs(z), 0, TAU * 4, TAU * 0.3, TAU * 0.8);
    
    let sphereSize = (Math.log(TAU + cos(timeFlow + p.angle)) + 1) * TAU/2;
    sphereSize *= particleScale;
    
    // Multi-layered glow effect
    for(let i = 4; i > 0; i--) {
      let alpha = map(i, 4, 0, TAU/12, TAU/3);
      fill(hue, saturation, brightness, alpha);
      noStroke();
      sphere(sphereSize * (i/2) * (1 + sin(timeFlow * 2 + p.angle)));
    }
    pop();
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initParticles();
}
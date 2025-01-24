let radius = 0;
let markLayers = [];
let isDrawing = false;
let colors = [
  '#2a0404', // Darkest
  '#4a0404',
  '#800909',
  '#b30f0f',
  '#ff6b6b',
  '#ffd6a5',
  '#ffee93'  // Brightest
];

function setup() {
  createCanvas(400, 800, WEBGL);
  brush.load();
  background(255);
  
  // Initialize mark layers
  for (let i = 0; i < colors.length; i++) {
    markLayers[i] = [];
  }
}

function draw() {
  if (!isDrawing) return;
  
  translate(-width/2, -height/2);
  
  // Grow the central glow
  radius += 0.5;
  
  // Draw base glow
  for (let i = 0; i < colors.length; i++) {
    let size = map(i, 0, colors.length - 1, radius * 1.2, radius * 0.5);
    let opacity = map(i, 0, colors.length - 1, 30, 70);
    
    brush.fill(colors[i], opacity);
    brush.bleed(0.3, 'out');
    brush.circle(width/2, height/2, size, true);
  }
  
  // Add texture marks
  if (frameCount % 3 === 0) {
    let angle = random(TWO_PI);
    let baseDistance = radius + random(-20, 20);
    
    // Determine which color layer based on distance
    let layerIndex = floor(map(baseDistance, 0, 300, colors.length - 1, 0));
    layerIndex = constrain(layerIndex, 0, colors.length - 1);
    
    let mark = {
      x: width/2 + cos(angle) * baseDistance,
      y: height/2 + sin(angle) * baseDistance,
      angle: angle,
      length: random(10, 30),
      opacity: map(layerIndex, 0, colors.length - 1, 90, 40)
    };
    
    markLayers[layerIndex].push(mark);
  }
  
  // Draw texture marks
  for (let i = 0; i < markLayers.length; i++) {
    brush.pick('charcoal');
    for (let mark of markLayers[i]) {
      brush.set('charcoal', colors[i], 0.8);
      brush.line(
        mark.x,
        mark.y,
        mark.x + cos(mark.angle) * mark.length,
        mark.y + sin(mark.angle) * mark.length
      );
    }
  }
  
  // Stop when reaching max size
  if (radius > 300) {
    isDrawing = false;
  }
}

function mousePressed() {
  isDrawing = true;
  radius = 20;
  markLayers = colors.map(() => []);
  background(255);
}

function keyPressed() {
  if (key === 's') {
    saveCanvas('sun-glow', 'png');
  }
}
let radius = 0;
let markLayers = {
  top: [],
  bottom: []
};
let isDrawing = false;

// Two contrasting color sets from the palette
let colors = {
  top: ['#82954B', '#BABD42', '#EFD345'],
  bottom: ['#004225', '#FFEF82', '#82954B']
};

function setup() {
  createCanvas(400, 800, WEBGL);
  brush.load();
  background(255);
  initializeLayers();
}

function initializeLayers() {
  markLayers.top = colors.top.map(() => []);
  markLayers.bottom = colors.bottom.map(() => []);
}

function draw() {
  if (!isDrawing) return;
  
  translate(-width/2, -height/2);
  radius += 0.5;
  
  // Draw both circles
  drawCircle('top', height/4);
  drawCircle('bottom', (height/4) * 3);
  
  if (radius > 300) {
    isDrawing = false;
  }
}

function drawCircle(position, yPos) {
  let currentColors = colors[position];
  let currentLayers = markLayers[position];
  
  // Draw base glow
  for (let i = 0; i < currentColors.length; i++) {
    let currentRadius = map(i, 0, currentColors.length - 1, radius * 1.2, radius * 0.5);
    let opacity = map(i, 0, currentColors.length - 1, 30, 70);
    
    brush.fill(currentColors[i], opacity);
    brush.bleed(0.3, 'out');
    brush.circle(width/2, yPos, currentRadius * 2, true);
  }
  
  // Add texture marks
  if (frameCount % 2 === 0) {
    let angle = random(TWO_PI);
    let baseDistance = radius + random(-20, 20);
    
    let layerIndex = floor(map(baseDistance, 0, 300, currentColors.length - 1, 0));
    layerIndex = constrain(layerIndex, 0, currentColors.length - 1);
    
    let mark = {
      x: width/2 + cos(angle) * baseDistance,
      y: yPos + sin(angle) * (baseDistance * 2),
      angle: angle,
      length: random(15, 40),
      opacity: map(layerIndex, 0, currentColors.length - 1, 90, 40)
    };
    
    currentLayers[layerIndex].push(mark);
  }
  
  // Draw texture marks
  for (let i = 0; i < currentLayers.length; i++) {
    brush.pick('charcoal');
    for (let mark of currentLayers[i]) {
      brush.set('charcoal', currentColors[i], 0.8);
      brush.line(
        mark.x,
        mark.y,
        mark.x + cos(mark.angle) * mark.length,
        mark.y + sin(mark.angle) * mark.length
      );
      
      if (random() > 0.7) {
        let offsetAngle = mark.angle + random(-PI/4, PI/4);
        brush.line(
          mark.x,
          mark.y,
          mark.x + cos(offsetAngle) * (mark.length * 0.7),
          mark.y + sin(offsetAngle) * (mark.length * 0.7)
        );
      }
    }
  }
}

function mousePressed() {
  isDrawing = true;
  radius = 20;
  initializeLayers();
  background(255);
}

function keyPressed() {
  if (key === 's') {
    saveCanvas('dual-glow', 'png');
  }
}
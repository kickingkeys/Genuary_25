let shapes = [];
const colors = ['#E63946', '#1D3557', '#F4A261', '#000000']; // Red, Blue, Yellow, Black
const gridSize = 100; // Size of each grid cell
let lastUpdateTime = 0;
const updateInterval = 500; // Update every 500ms

function setup() {
  createCanvas(400, 800);
  background('#F5F1E6');
  frameRate(30);
  
  // Create initial shapes
  for (let y = 0; y < height; y += gridSize) {
    for (let x = 0; x < width; x += gridSize) {
      let shapeType = random(['circle', 'quarterCircle', 'triangle', 'dot']);
      shapes.push({
        x: x,
        y: y,
        type: shapeType,
        color: random(colors),
        rotation: random([0, 90, 180, 270]),
        lastUpdate: 0,
        size: gridSize
      });
    }
  }
}

function draw() {
  background('#FAF8F4');
  
  // Update colors periodically
  if (millis() - lastUpdateTime > updateInterval) {
    updateRandomShapes();
    lastUpdateTime = millis();
  }
  
  // Draw all shapes
  for (let shape of shapes) {
    drawTexturedShape(shape);
  }
}

function drawTexturedShape(shape) {
  push();
  translate(shape.x + shape.size/2, shape.y + shape.size/2);
  rotate(radians(shape.rotation));
  translate(-shape.size/2, -shape.size/2);
  
  let strokeLength = 8;
  let strokeSpacing = 4;
  
  // Set color with multiply blend mode
  blendMode(MULTIPLY);
  
  switch(shape.type) {
    case 'circle':
      drawTexturedCircle(shape.size/2, shape.size/2, shape.size * 0.8, shape.color);
      break;
    case 'quarterCircle':
      drawTexturedQuarterCircle(0, 0, shape.size, shape.color);
      break;
    case 'triangle':
      drawTexturedTriangle(0, 0, shape.size, shape.color);
      break;
    case 'dot':
      drawTexturedDot(shape.size/2, shape.size/2, shape.size * 0.2, shape.color);
      break;
  }
  
  pop();
  blendMode(BLEND);
}

function drawTexturedCircle(x, y, diameter, color) {
  let resolution = 2;
  for (let dy = -diameter/2; dy < diameter/2; dy += resolution) {
    for (let dx = -diameter/2; dx < diameter/2; dx += resolution) {
      let distance = sqrt(dx*dx + dy*dy);
      if (distance < diameter/2) {
        stroke(color);
        strokeWeight(random(0.5, 1.5));
        let angle = random(TWO_PI);
        let length = random(4, 8);
        let px = x + dx;
        let py = y + dy;
        line(
          px + cos(angle) * length/2,
          py + sin(angle) * length/2,
          px - cos(angle) * length/2,
          py - sin(angle) * length/2
        );
      }
    }
  }
}

function drawTexturedQuarterCircle(x, y, size, color) {
  let resolution = 2;
  for (let dy = 0; dy < size; dy += resolution) {
    for (let dx = 0; dx < size; dx += resolution) {
      let distance = sqrt(dx*dx + dy*dy);
      if (distance < size && dx >= 0 && dy >= 0) {
        stroke(color);
        strokeWeight(random(0.5, 1.5));
        let angle = random(TWO_PI);
        let length = random(4, 8);
        line(
          dx + cos(angle) * length/2,
          dy + sin(angle) * length/2,
          dx - cos(angle) * length/2,
          dy - sin(angle) * length/2
        );
      }
    }
  }
}

function drawTexturedTriangle(x, y, size, color) {
  let resolution = 2;
  for (let dy = 0; dy < size; dy += resolution) {
    for (let dx = 0; dx < size - dy; dx += resolution) {
      stroke(color);
      strokeWeight(random(0.5, 1.5));
      let angle = random(TWO_PI);
      let length = random(4, 8);
      line(
        dx + cos(angle) * length/2,
        dy + sin(angle) * length/2,
        dx - cos(angle) * length/2,
        dy - sin(angle) * length/2
      );
    }
  }
}

function drawTexturedDot(x, y, diameter, color) {
  let resolution = 2;
  for (let dy = -diameter/2; dy < diameter/2; dy += resolution) {
    for (let dx = -diameter/2; dx < diameter/2; dx += resolution) {
      let distance = sqrt(dx*dx + dy*dy);
      if (distance < diameter/2) {
        stroke(color);
        strokeWeight(random(0.5, 1));
        point(x + dx, y + dy);
      }
    }
  }
}

function updateRandomShapes() {
  // Update random shapes
  let numToUpdate = floor(random(3, 6));
  for (let i = 0; i < numToUpdate; i++) {
    let shape = random(shapes);
    shape.color = random(colors);
    shape.type = random(['circle', 'quarterCircle', 'triangle', 'dot']);
    shape.rotation = random([0, 90, 180, 270]);
  }
}

function mousePressed() {
  // Randomize all shapes on mouse press
  for (let shape of shapes) {
    shape.color = random(colors);
    shape.type = random(['circle', 'quarterCircle', 'triangle', 'dot']);
    shape.rotation = random([0, 90, 180, 270]);
  }
}
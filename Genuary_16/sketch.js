// Grid configuration
const gridWidth = 3;  // 3x6 grid of textured blocks
const gridHeight = 6;
const blockSize = 133; // Adjusted to better fit canvas (400/3 ≈ 133)

// Arrays to store our grid data
let pixels = [];
let emptyPixels = [];
let fillingComplete = false;
let seedColors = [];

function initializeSeedColors() {
  seedColors = [
    color("#F2385A"),
    color("#F5A503"),
    color("#E9F1DF"),
    color("#4AD9D9"),
    color("#36B1BF")
  ];
}

function getNeighbors(index) {
  const row = Math.floor(index / gridWidth);
  const col = index % gridWidth;
  const neighbors = [];
  
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      
      const newRow = row + i;
      const newCol = col + j;
      
      if (newRow >= 0 && newRow < gridHeight && newCol >= 0 && newCol < gridWidth) {
        const neighborIndex = newRow * gridWidth + newCol;
        if (pixels[neighborIndex]) {
          neighbors.push(pixels[neighborIndex][0]); // Use the first color of each neighbor
        }
      }
    }
  }
  
  return neighbors;
}

function generateColor(neighbors) {
  let c;
  if (neighbors.length === 0) {
    c = random(seedColors);
  } else {
    c = random(neighbors);
  }
  
  colorMode(HSB);
  const h = (hue(c) + random(-15, 15) + 360) % 360;
  const s = constrain(saturation(c) + random(-10, 10), 0, 100);
  const b = constrain(brightness(c) + random(-10, 10), 0, 100);
  const newColor = color(h, s, b);
  colorMode(RGB);
  
  return newColor;
}

function drawTexturedBlock(x, y, w, h, colorA, colorB) {
  let strokeLength = 10;  // Halved to match smaller blocks
  let strokeSpaceX = 4;   // Halved to maintain density
  let strokeSpaceY = 2;   // Halved to maintain density
  let noiseScale = 0.005;
  
  blendMode(MULTIPLY);
  
  for (let dy = 0; dy < h; dy += strokeSpaceY) {
    let t = dy / h;
    let currentColor = lerpColor(colorA, colorB, t);
    
    stroke(currentColor);
    noFill();
    
    for (let dx = 0; dx < w; dx += strokeSpaceX) {
      let posX = x + dx;
      let posY = y + dy;
      
      let rotation = noise(posX * noiseScale, posY * noiseScale) * 720;
      strokeWeight(random(1, 3));
      let lineLength = random(0.5, 1.0) * strokeLength;
      
      push();
      translate(posX, posY);
      rotate(radians(rotation));
      line(-lineLength/2, 0, lineLength/2, 0);
      pop();
    }
  }
  
  blendMode(BLEND);
}

function fillPixel() {
  if (emptyPixels.length > 0) {
    const index = floor(random(emptyPixels.length));
    const pixelIndex = emptyPixels[index];
    
    const neighbors = getNeighbors(pixelIndex);
    const color1 = generateColor(neighbors);
    const color2 = generateColor([color1]); // Generate second color based on first
    
    pixels[pixelIndex] = [color1, color2];
    emptyPixels.splice(index, 1);
  } else {
    fillingComplete = true;
  }
}

function drawPixels() {
  for (let i = 0; i < pixels.length; i++) {
    if (pixels[i]) {
      const x = (i % gridWidth) * blockSize;
      const y = Math.floor(i / gridWidth) * blockSize;
      drawTexturedBlock(x, y, blockSize, blockSize, pixels[i][0], pixels[i][1]);
    }
  }
}

function setup() {
  createCanvas(400, 800);
  background('#FAF8F4');
  initializeSeedColors();
  
  // Initialize grid
  for (let i = 0; i < gridWidth * gridHeight; i++) {
    pixels.push(null);
    emptyPixels.push(i);
  }
}

function draw() {
  if (!fillingComplete) {
    background('#FAF8F4');
    fillPixel();
    drawPixels();
  }
}

function mousePressed() {
  // Reset and start over
  pixels = [];
  emptyPixels = [];
  fillingComplete = false;
  
  // Reinitialize seed colors
  initializeSeedColors();
  
  for (let i = 0; i < gridWidth * gridHeight; i++) {
    pixels.push(null);
    emptyPixels.push(i);
  }
  
  background('#FAF8F4');
}
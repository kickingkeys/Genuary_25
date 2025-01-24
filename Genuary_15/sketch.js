let colors = ['#fe938c','#e6b89c','#ead2ac','#9cafb7','#4281a4'];
let pattern = [];
let currentPattern = [];
let currentRow = 0;
let currentCol = 0;
let isAnimating = false;
let rugWidth = 30;
let rugHeight = 60;
let offsetX;
let offsetY;
let isFirstPattern = true;
let weaveDirection = 1;

function setup() {
  createCanvas(400, 800);
  pixelDensity(2);
  
  offsetX = (width - (rugWidth * 10)) / 2;
  offsetY = (height - (rugHeight * 10)) / 2;
  
  background('#FAF8F4');
  initializePatterns();
  generateNewPattern();
}

function drawGridBackground() {
  background('#FAF8F4');
  stroke(220);
  strokeWeight(0.5);
  
  for (let x = 0; x < width; x += 20) {
    line(x, 0, x, height);
  }
  for (let y = 0; y < height; y += 20) {
    line(0, y, width, y);
  }
}

function drawFrills(y, isTop, colorIndex) {
  let frillSize = 15;
  let frillCount = rugWidth;
  blendMode(MULTIPLY);
  
  for (let i = 0; i < frillCount; i++) {
    let x = offsetX + i * 10;
    let colorA = color(colors[colorIndex]);
    let colorB = color(colors[(colorIndex + 1) % colors.length]);
    colorA.setAlpha(200);
    colorB.setAlpha(200);
    
    if (isTop) {
      for (let j = 0; j < frillSize; j += 2) {
        let t = j / frillSize;
        let nowColor = lerpColor(colorA, colorB, t);
        stroke(nowColor);
        strokeWeight(random(0.5, 1.5));
        let startX = x + random(-2, 2);
        let startY = y + j;
        let endX = x + 10 + random(-2, 2);
        let endY = y + j;
        line(startX, startY, endX, endY);
      }
    } else {
      for (let j = 0; j < frillSize; j += 2) {
        let t = j / frillSize;
        let nowColor = lerpColor(colorA, colorB, t);
        stroke(nowColor);
        strokeWeight(random(0.5, 1.5));
        let startX = x + random(-2, 2);
        let startY = y - j;
        let endX = x + 10 + random(-2, 2);
        let endY = y - j;
        line(startX, startY, endX, endY);
      }
    }
  }
  blendMode(BLEND);
}

function GradientRect(x, y, w, h, colorA, colorB) {
  let strokeLength = 8;
  let strokeSpaceX = 2;
  let strokeSpaceY = 1;
  let noiseScaleX = 0.005;
  let noiseScaleY = 0.005;
  
  for (let dy = 0; dy < h; dy += strokeSpaceY) {
    let t = dy / h;
    let nowColor = lerpColor(colorA, colorB, t);
    noFill();
    stroke(nowColor);
    
    for (let dx = 0; dx < w; dx += strokeSpaceX) {
      let nowX = x + dx;
      let nowY = y + dy;
      let nowStrokeLength = random(0.3, 1.0) * strokeLength;
      let rot = noise(nowX * noiseScaleX, nowY * noiseScaleY) * 720.0;
      strokeWeight(random(0.5, 1.5));
      
      push();
      translate(nowX, nowY);
      rotate(radians(rot));
      line(-0.5 * nowStrokeLength, 0, 0.5 * nowStrokeLength, 0);
      pop();
    }
  }
}

function initializePatterns() {
  pattern = new Array(rugHeight);
  currentPattern = new Array(rugHeight);
  for (let y = 0; y < rugHeight; y++) {
    pattern[y] = new Array(rugWidth);
    currentPattern[y] = new Array(rugWidth).fill(-1);
  }
}

function generateNewPattern() {
  currentRow = 0;
  currentCol = 0;
  isAnimating = true;
  weaveDirection = 1;
  
  for (let y = 0; y < rugHeight; y++) {
    currentPattern[y].fill(-1);
  }

  let centerX = floor(rugWidth/2);
  let centerY = floor(rugHeight/2);
  
  for (let y = 0; y < rugHeight/2; y++) {
    for (let x = 0; x < rugWidth/2; x++) {
      let distFromCenter = dist(x, y, centerX/2, centerY/2);
      let randomValue = random();
      
      if (distFromCenter < 4) {
        pattern[y][x] = 0;
      } else if (distFromCenter < 8) {
        pattern[y][x] = randomValue < 0.7 ? 1 : 2;
      } else if (distFromCenter < 12) {
        pattern[y][x] = randomValue < 0.6 ? 3 : 1;
      } else {
        pattern[y][x] = randomValue < 0.4 ? 2 : 1;
      }
    }
  }
  
  for (let y = 0; y < rugHeight/2; y++) {
    for (let x = rugWidth/2; x < rugWidth; x++) {
      pattern[y][x] = pattern[y][rugWidth - 1 - x];
    }
  }
  
  for (let y = rugHeight/2; y < rugHeight; y++) {
    for (let x = 0; x < rugWidth; x++) {
      pattern[y][x] = pattern[rugHeight - 1 - y][x];
    }
  }
  
  addBorder();
}

function addBorder() {
  for (let x = 0; x < rugWidth; x++) {
    pattern[0][x] = x % 2;
    pattern[rugHeight-1][x] = x % 2;
  }
  for (let y = 0; y < rugHeight; y++) {
    pattern[y][0] = y % 2;
    pattern[y][rugWidth-1] = y % 2;
  }
}

function draw() {
  if (frameCount === 1) {
    drawGridBackground();
  }
  
  if (isAnimating) {
    for (let i = 0; i < 8; i++) {
      if (currentRow < rugHeight) {
        currentPattern[currentRow][currentCol] = pattern[currentRow][currentCol];
        
        let x = offsetX + currentCol * 10;
        let y = offsetY + currentRow * 10;
        let colorA = color(colors[pattern[currentRow][currentCol]]);
        let colorB = color(colors[(pattern[currentRow][currentCol] + 1) % colors.length]);
        colorA.setAlpha(200);
        colorB.setAlpha(200);
        
        blendMode(MULTIPLY);
        GradientRect(x, y, 10, 10, colorA, colorB);
        blendMode(BLEND);
        
        currentCol += weaveDirection;
        
        if (currentCol >= rugWidth || currentCol < 0) {
          currentRow++;
          weaveDirection *= -1;
          currentCol = (weaveDirection === 1) ? 0 : rugWidth - 1;
        }
      }
    }
    
    if (currentRow >= rugHeight) {
      // Draw frills
      drawFrills(offsetY - 5, true, 0);
      drawFrills(offsetY + rugHeight * 10 + 5, false, 0);
      
      isAnimating = false;
      // Add final soft white overlay
      noStroke();
      fill(255, 25);
      rect(0, 0, width, height);
    }
  }
}

function mousePressed() {
  if (!isAnimating) {
    clear();
    drawGridBackground();
    generateNewPattern();
  }
}
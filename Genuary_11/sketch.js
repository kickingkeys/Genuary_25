/*
Space: Reset image
V: Toggle vertical/horizontal
D: Diagonal sort
G/P/C/E/B: Different sorting modes
1-6: Switch images
Mouse click: Start/stop processing

*/

let myImg = [];        // Array to hold all images
let img, originalImg;  // Current working image and its original state
let imgIndex = 0;      // Current image index
let isProcessing = false;
let amp = 130;         // Animation speed (higher = slower)
let sortMode = 'brightness';  // Default sorting mode
let sortDirection = 'vertical';
let processingIndex = 0;
let rowPix = [];
let index = [];
let transitionEase = 0.15;

function preload() {
  for(let i = 1; i <= 6; i++) {
    myImg[i-1] = loadImage(`g${i}.jpg`);
  }
}

function setup() {
  createCanvas(892, 642);
  pixelDensity(1);
  img = myImg[0].get();
  originalImg = myImg[0].get();
  img.loadPixels();
  originalImg.loadPixels();
  resetIndex();
  logState();
}

// 1. SORTING ALGORITHMS AND PIXEL PROCESSING

function processVerticalSort() {
  if (processingIndex >= width) {
    isProcessing = false;
    processingIndex = 0;
    return;
  }

  let x = processingIndex;
  let sortSegment = [];
  
  // Collect pixels in column
  for (let y = 0; y < height; y++) {
    let index = (x + y * width) * 4;
    sortSegment.push([
      img.pixels[index],
      img.pixels[index + 1],
      img.pixels[index + 2],
      img.pixels[index + 3]
    ]);
  }
  
  // Sort based on current mode
  sortSegment.sort((a, b) => {
    switch(sortMode) {
      case 'brightness':
        return getBrightness(a) - getBrightness(b);
      case 'gold':
        return getGoldness(a) - getGoldness(b);
      case 'pattern':
        return getPatternValue(a) - getPatternValue(b);
      case 'contrast':
        return getContrast(a) - getContrast(b);
      case 'edge':
        return getEdgeValue(a) - getEdgeValue(b);
      default:
        return getBrightness(a) - getBrightness(b);
    }
  });
  
  // Write back sorted pixels
  for (let y = 0; y < height; y++) {
    let index = (x + y * width) * 4;
    img.pixels[index] = sortSegment[y][0];
    img.pixels[index + 1] = sortSegment[y][1];
    img.pixels[index + 2] = sortSegment[y][2];
    img.pixels[index + 3] = sortSegment[y][3];
  }
  
  processingIndex++;
}

function processHorizontalSort() {
  if (processingIndex >= height) {
    isProcessing = false;
    processingIndex = 0;
    return;
  }

  let y = processingIndex;
  let sortSegment = [];
  
  // Collect pixels in row
  for (let x = 0; x < width; x++) {
    let index = (x + y * width) * 4;
    sortSegment.push([
      img.pixels[index],
      img.pixels[index + 1],
      img.pixels[index + 2],
      img.pixels[index + 3]
    ]);
  }
  
  // Sort using same criteria as vertical
  sortSegment.sort((a, b) => {
    switch(sortMode) {
      case 'brightness':
        return getBrightness(a) - getBrightness(b);
      case 'gold':
        return getGoldness(a) - getGoldness(b);
      case 'pattern':
        return getPatternValue(a) - getPatternValue(b);
      case 'contrast':
        return getContrast(a) - getContrast(b);
      case 'edge':
        return getEdgeValue(a) - getEdgeValue(b);
      default:
        return getBrightness(a) - getBrightness(b);
    }
  });
  
  // Write back sorted pixels
  for (let x = 0; x < width; x++) {
    let index = (x + y * width) * 4;
    img.pixels[index] = sortSegment[x][0];
    img.pixels[index + 1] = sortSegment[x][1];
    img.pixels[index + 2] = sortSegment[x][2];
    img.pixels[index + 3] = sortSegment[x][3];
  }
  
  processingIndex++;
}

function processDiagonalSort() {
  if (processingIndex >= width + height) {
    isProcessing = false;
    processingIndex = 0;
    return;
  }
  
  let sortSegment = [];
  
  // Collect pixels in diagonal
  for (let i = 0; i < max(width, height); i++) {
    let x = i;
    let y = processingIndex - i;
    
    if (x >= 0 && x < width && y >= 0 && y < height) {
      let index = (x + y * width) * 4;
      sortSegment.push([
        img.pixels[index],
        img.pixels[index + 1],
        img.pixels[index + 2],
        img.pixels[index + 3]
      ]);
    }
  }
  
  // Sort using current mode
  sortSegment.sort((a, b) => {
    switch(sortMode) {
      case 'brightness':
        return getBrightness(a) - getBrightness(b);
      case 'gold':
        return getGoldness(a) - getGoldness(b);
      case 'pattern':
        return getPatternValue(a) - getPatternValue(b);
      case 'contrast':
        return getContrast(a) - getContrast(b);
      case 'edge':
        return getEdgeValue(a) - getEdgeValue(b);
      default:
        return getBrightness(a) - getBrightness(b);
    }
  });
  
  // Write back sorted pixels
  let segmentIndex = 0;
  for (let i = 0; i < max(width, height); i++) {
    let x = i;
    let y = processingIndex - i;
    
    if (x >= 0 && x < width && y >= 0 && y < height) {
      let index = (x + y * width) * 4;
      img.pixels[index] = sortSegment[segmentIndex][0];
      img.pixels[index + 1] = sortSegment[segmentIndex][1];
      img.pixels[index + 2] = sortSegment[segmentIndex][2];
      img.pixels[index + 3] = sortSegment[segmentIndex][3];
      segmentIndex++;
    }
  }
  
  processingIndex++;
}

// 2. PIXEL VALUE CALCULATION FUNCTIONS

function getBrightness(pixel) {
  return (pixel[0] + pixel[1] + pixel[2]) / 3;
}

function getGoldness(pixel) {
  // Gold detection based on RGB ratios typical for gold colors
  let r = pixel[0], g = pixel[1], b = pixel[2];
  let goldness = (r > g && g > b) ? // typical gold has R > G > B
    (r * 0.5 + g * 0.3 - b * 0.2) : 0;
  return goldness;
}

function getPatternValue(pixel) {
  // Pattern detection using local contrast
  return Math.abs(pixel[0] - pixel[1]) + 
         Math.abs(pixel[1] - pixel[2]) +
         Math.abs(pixel[2] - pixel[0]);
}

function getContrast(pixel) {
  let brightness = getBrightness(pixel);
  return Math.abs(brightness - 128); // Distance from middle gray
}

function getEdgeValue(pixel) {
  // Simple edge detection using color differences
  return Math.max(
    Math.abs(pixel[0] - pixel[1]),
    Math.abs(pixel[1] - pixel[2]),
    Math.abs(pixel[2] - pixel[0])
  );
}

// 3. INTERACTION HANDLERS

function keyPressed() {
  switch(key.toLowerCase()) {
    case ' ':
      // Reset image
      img = originalImg.get();
      img.loadPixels();
      isProcessing = false;
      processingIndex = 0;
      break;
    case 'v':
      sortDirection = sortDirection === 'vertical' ? 'horizontal' : 'vertical';
      processingIndex = 0;
      break;
    case 'd':
      sortDirection = 'diagonal';
      processingIndex = 0;
      break;
    case 'g':
      sortMode = 'gold';
      processingIndex = 0;
      break;
    case 'p':
      sortMode = 'pattern';
      processingIndex = 0;
      break;
    case 'c':
      sortMode = 'contrast';
      processingIndex = 0;
      break;
    case 'e':
      sortMode = 'edge';
      processingIndex = 0;
      break;
    case 'b':
      sortMode = 'brightness';
      processingIndex = 0;
      break;
  }
  
  // Number keys for image selection
  if (key >= '1' && key <= '6') {
    imgIndex = int(key) - 1;
    img = myImg[imgIndex].get();
    originalImg = myImg[imgIndex].get();
    img.loadPixels();
    originalImg.loadPixels();
    processingIndex = 0;
  }
  
  logState();
}

function mousePressed() {
  isProcessing = !isProcessing;
  if (isProcessing) {
    processingIndex = 0;
  }
}

function draw() {
  background(0);
  
  let progress = (1 - sin(PI/2 + frameCount/amp)) / 2;
  let easedProgress = ease(progress);
  
  if(isProcessing) {
    for(let i = 0; i < 4; i++) {
      if(sortDirection === 'vertical') {
        processVerticalSort();
      } else if(sortDirection === 'horizontal') {
        processHorizontalSort();
      } else {
        processDiagonalSort();
      }
    }
    img.updatePixels();
    logState(easedProgress);
  }
  
  image(img, 0, 0);
  
  // Progress bar
  noStroke();
  fill(255);
  rect(0, height - 5, width * easedProgress, 5);
}

function resetIndex() {
  index = [];
  for(let i = 0; i < width; i++) {
    index[i] = [];
    for(let j = 0; j < height; j++) {
      index[i][j] = i + j * width;
    }
  }
}

function ease(p) {
  return transitionEase * Math.pow(p, 3) + (1 - transitionEase) * p;
}

function logState(progress = 0) {
  console.log({
    mode: sortMode,
    direction: sortDirection,
    imageNumber: imgIndex + 1,
    progress: Math.round(progress * 100) + '%',
    frameRate: Math.round(frameRate())
  });
}
let img;
let isLoaded = false;
let offset = 0;
let isAnimating = false;  // New flag for animation state
let osc, env;            // Sound oscillator and envelope
let delay;              // Delay effect for arcade feel

function preload() {
  img = loadImage('pexels-photo-1830667.jpeg');
}

function setup() {
  createCanvas(400, 800);
  img.resize(400, 800);
  pixelDensity(1);
  frameRate(30);
  
  // Setup sound synthesis
  osc = new p5.Oscillator('sawtooth');
  env = new p5.Envelope();
  delay = new p5.Delay();
  
  // Configure envelope
  env.setADSR(0.01, 0.1, 0.2, 0.1);
  env.setRange(0.5, 0);
  
  // Configure delay
  delay.process(osc, 0.12, 0.7, 2300);
  delay.setType('pingPong');
  
  // Start oscillator silent
  osc.start();
  osc.amp(0);
}

function draw() {
  if (!isLoaded && img.width > 0) {
    image(img, 0, 0);
    loadPixels();
    isLoaded = true;
  }

  if (!isLoaded || !isAnimating) return;

  // Process multiple columns each frame
  for(let i = 0; i < 40; i++) {
    let x = floor(random(width));
    sortWaterColumnDownward(x);
    
    // Play sound based on sorting
    if (i % 8 === 0) { // Reduce frequency of sound triggers
      playPixelSound(x);
    }
  }
  
  offset += 0.1;
  updatePixels();
}

function playPixelSound(x) {
  // Calculate frequency based on x position
  let freq = map(x, 0, width, 200, 800);
  osc.freq(freq);
  
  // Trigger envelope
  env.play(osc);
}

function sortWaterColumnDownward(x) {
  let waterPixels = [];
  
  for (let y = 100; y < height; y++) {
    let index = (x + y * width) * 4;
    
    if (isWaterPixel(index, x, y)) {
      waterPixels.push({
        index: index,
        y: y,
        x: x,
        brightness: getBrightness(index),
        color: [
          pixels[index],
          pixels[index + 1],
          pixels[index + 2],
          pixels[index + 3]
        ]
      });
    }
  }
  
  if (waterPixels.length > 0) {
    waterPixels.sort((a, b) => {
      let waveIntensity = (a.y > height * 0.7) ? 30 : 20;
      let waveA = sin((a.y * 0.05) + offset + (a.x * 0.02)) * waveIntensity;
      let waveB = sin((b.y * 0.05) + offset + (b.x * 0.02)) * waveIntensity;
      let mistFactor = (a.y > height * 0.7) ? random(-10, 10) : 0;
      
      return (a.y + waveA + a.brightness * 0.3 + mistFactor) - 
             (b.y + waveB + b.brightness * 0.3);
    });
    
    waterPixels.forEach((pixel, i) => {
      const targetIndex = waterPixels[(i + 1) % waterPixels.length].index;
      for (let j = 0; j < 4; j++) {
        pixels[targetIndex + j] = pixel.color[j];
      }
    });
  }
}

function getBrightness(index) {
  return (pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114);
}

function isWaterPixel(index, x, y) {
  const r = pixels[index];
  const g = pixels[index + 1];
  const b = pixels[index + 2];
  const brightness = (r + g + b) / 3;
  
  if (y > height * 0.7) {
    return (
      (brightness > 100 && b > r * 0.8) ||
      (brightness > 130 && b > 100) ||
      (brightness > 180) ||
      (b > 130 && brightness > 80)
    );
  } else {
    return (
      (b > r * 0.9 || b > 170) &&
      (brightness > 150 ||
      (b > 130 && brightness > 100) ||
      (r > 180 && g > 180 && b > 180)) &&
      brightness > 30 &&
      !(r > b && g > b && brightness < 150)
    );
  }
}

function mousePressed() {
  if (!isAnimating) {
    // Start animation
    isAnimating = true;
    // Start with fresh image
    image(img, 0, 0);
    loadPixels();
  } else {
    // Stop animation and reset
    isAnimating = false;
    image(img, 0, 0);
    loadPixels();
  }
  return false;
}

function keyPressed() {
  // Space bar to toggle animation
  if (keyCode === 32) {
    mousePressed();
  }
}
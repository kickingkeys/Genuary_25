let seed = Math.random() * 1247;
let t = 0;
let currentPaletteIndex = 0;

// Sound variables
let osc, env;
let notes = [48, 50, 52, 55, 57, 60, 62, 64, 67, 69];
let lastSoundTime = 0;
let soundDelay = 80; 
let reverb;

// Noise influence map for user interaction
let noiseInfluence;

// All palettes 
const allPalettes = {
  tone1: ["#2450A6", "#639CBF", "#F2EFBD", "#F28705", "#F2380F"],
  tone2: ["#381A40", "#90BF2A", "#F2CB05", "#BF751B", "#F24F13"],
  tone3: ["#D7D7D9", "#038C33", "#ACF216", "#698C1C", "#97BF04"],
  tone4: ["#192E40", "#326A8C", "#3B758C", "#7AACBF", "#C4EAF2"],
  tone5: ["#6595BF", "#55B3D9", "#027373", "#5A7302", "#F2AB6D"],
  tone6: ["#024059", "#A0A603", "#D98E04", "#A67F5D", "#D9C9BA"],
  tone7: ["#51608C", "#6A8AA6", "#BFCDD9", "#BF8756", "#8C512E"],
  tone8: ["#635C73", "#272B40", "#F2DAAC", "#D99E6A", "#D97E6A"]
};

const palettesList = Object.values(allPalettes);
let currentPalettes;

function setup() {
  createCanvas(400, 800);
  noiseInfluence = createGraphics(400, 800);
  noiseInfluence.pixelDensity(1);
  
  randomSeed(seed);
  background(0);
  frameRate(30);
  updatePalettes();
  
  const audioContext = getAudioContext();
  audioContext.resume();
  
  setInterval(() => {
    if (audioContext.state !== 'running') {
      audioContext.resume();
    }
  }, 1000);
  
  osc = new p5.Oscillator('sine');
  env = new p5.Envelope();
  env.setADSR(0.001, 0.1, 0.2, 0.1);
  env.setRange(0.5, 0);
  osc.start();
  osc.amp(0);
  
  reverb = new p5.Reverb();
  reverb.process(osc, 2, 2);
  
  // Initialize influence layer
  noiseInfluence.background(0);
}

function updatePalettes() {
  currentPalettes = [
    palettesList[currentPaletteIndex],
    palettesList[(currentPaletteIndex + 1) % palettesList.length],
    palettesList[(currentPaletteIndex + 2) % palettesList.length]
  ];
}

function playSound(x, y, size, noiseVal) {
  if (millis() - lastSoundTime > soundDelay) {
    let noteIndex = floor(map(x, 0, 400, 0, notes.length));
    let note = notes[noteIndex];
    
    let octave = floor(map(y, 0, 800, 0, 2)) * 12;
    let freq = midiToFreq(note + octave);
    osc.freq(freq);
    
    let attackTime = map(size, 5, 15, 0.001, 0.1);
    let releaseTime = map(noiseVal, 0.5, 1, 0.1, 0.3);
    env.setADSR(attackTime, 0.1, 0.2, releaseTime);
    
    let amplitude = map(noiseVal, 0.5, 1, 0.2, 0.5);
    env.setRange(amplitude, 0);
    
    env.play(osc);
    lastSoundTime = millis();
  }
}

function playPaletteChange() {
  for(let i = 0; i < 4; i++) {
    setTimeout(() => {
      osc.freq(midiToFreq(notes[i * 2] + 24));
      env.play(osc);
    }, i * 100);
  }
}

function draw() {
  background(0, 200);
  
  // Update influence layer
  noiseInfluence.background(0, 5);
  
  // Add new influence from mouse if pressed
  if (mouseIsPressed) {
    let mx = (mouseX - width/2) / 1.3 + width/2;
    let my = (mouseY - height/2) / 1.3 + height/2;
    noiseInfluence.fill(255, 100);
    noiseInfluence.noStroke();
    noiseInfluence.circle(mx, my, 40);
    playSound(mx, my, 15, 0.8);
  }
  
  push();
  translate(width/2, height/2);
  scale(1.3);
  translate(-width/2, -height/2);
  
  for(let layer = 0; layer < 3; layer++) {
    let offset = layer * 5;
    let gridSize = 15 - (layer * 2);
    drawGrid(gridSize, offset, layer);
  }
  
  pop();
  
  t += 0.01;
}

function drawGrid(size, offset, layer) {
  let palette = currentPalettes[layer];
  noiseInfluence.loadPixels();
  
  for(let x = -offset; x < width + offset; x += size) {
    for(let y = -offset; y < height + offset; y += size) {
      // Get influence value from the graphics buffer
      let idx = 4 * (floor(y) * width + floor(x));
      let influence = 0;
      if (idx >= 0 && idx < noiseInfluence.pixels.length) {
        influence = noiseInfluence.pixels[idx] / 255;
      }
      
      // Combine noise with influence
      let n = noise(x * 0.002 + t, y * 0.002 + t) + influence * 0.3;
      
      if(n > 0.5) {
        fill(random(palette));
        stroke(255, 30);
        strokeWeight(0.5);
        rect(x, y, size * n, size * n);
        
        if(random() < 0.06 && n > 0.65) {
          playSound(x, y, size, n);
        }
      }
    }
  }
}

function mouseClicked() {
  if (mouseButton === RIGHT) {
    currentPaletteIndex = (currentPaletteIndex + 1) % palettesList.length;
    updatePalettes();
    playPaletteChange();
  }
}

function keyPressed() {
  if(key === 's' || key === 'S') {
    saveCanvas('AnimatedLayeredGrid', 'png');
  } else if (key === 'c' || key === 'C') {
    currentPaletteIndex = (currentPaletteIndex + 1) % palettesList.length;
    updatePalettes();
    playPaletteChange();
  }
}

document.addEventListener('fullscreenchange', function() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
});
let modules = [];
const PHI = (1 + Math.sqrt(5)) / 2;
const SCALE = 15; // Slightly reduced scale to fit narrower canvas
let growing = false;
let maxHorizontalSpread = 3;
let currentHeight = 0;

// Sound variables
let osc, env, reverb, delay;
let pentatonicScale = [60, 62, 65, 67, 69, 72, 74, 77, 79, 82]; // C pentatonic scale
let lastSoundTime = 0;
let soundDelay = 100;

const palettes = {
  darks: [
    ["#577455", "#8C3F4D", "#6B8E9B"], // UK color palette
    ["##D9C9A1", "#F1A7A6 ", "#3A5A40"], // Duplicated to maintain existing color variety
  ],
  lights: [
    ["#EE8838", "#F4F2EF", "#6B8E9B"], // NY color palette
    ["#C2B1A3", "#2D3A3B", "#C7D6D1"], // Duplicated to maintain existing color variety
  ],
};

const MAT_GREEN = "#1B453D";
const MAT_GRID = "rgba(255, 255, 255, 0.15)";
const MAT_LINES = "rgba(255, 255, 255, 0.9)";
const MAT_TEXT = "rgba(255, 255, 255, 0.95)";
const MAT_EDGE = "#163832";
const MAT_THICKNESS = 0.4;
const CORNER_RADIUS = 0.5;
const RULER_INSET = 1;

let lastPlayedModule = null;
let soundEnabled = true;

class Module {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.connected = false;
    this.age = 0;
    this.birth = frameCount;
    this.type = this.determineType(x, y, z);
    this.highlighted = false;
    this.color = this.assignColor();
    this.soundPlayed = false;
  }

  assignColor() {
    const darkColors = random(palettes.darks);
    const lightColors = random(palettes.lights);

    switch (this.type) {
      case "core":
        return color(darkColors[0]);
      case "living":
        return color(lightColors[0]);
      case "community":
        return color(lightColors[1]);
      case "circulation":
        return color(darkColors[1]);
      case "garden":
        return color(lightColors[2]);
      default:
        return color(0);
    }
  }

  determineType(x, y, z) {
    // Core atrium and center space logic
    if (z > 2 && x === 0 && y === 0) {
      return random() > 0.3 ? "core" : "garden";
    }
    if (x === 0 && y === 0) return "core";

    // Void space creation
    let distanceFromCenter = abs(x) + abs(y);
    if (z > 3 && distanceFromCenter < 2 && random() > 0.7) {
      return null;
    }

    // Module type distribution
    if (z % 4 === 0 && (x !== 0 || y !== 0)) return "circulation";
    if (z % 3 === 0 && random() > 0.7) return "garden";
    if (random() > 0.8) return "community";
    return "living";
  }

  playGrowthSound() {
    if (!this.soundPlayed && this.type !== null) {
      // Calculate distance from center for spatial sound
      let distanceFromCenter = sqrt(this.x * this.x + this.y * this.y);

      // Base note selection on module type and position
      let baseNote =
        pentatonicScale[
          floor(map(distanceFromCenter, 0, 3, 0, pentatonicScale.length))
        ];

      // Add chord harmonies based on module type
      if (this.type === "core") {
        playChord([baseNote, baseNote + 4, baseNote + 7]); // Major chord
      } else if (this.type === "garden") {
        playChord([baseNote, baseNote + 5, baseNote + 9]); // Add9 chord
      } else {
        // Add height influence to the note
        let heightNote = baseNote + floor(map(this.z, 0, 10, 0, 7));
        playNote(heightNote);
      }

      this.soundPlayed = true;
    }
  }

  display() {
    push();
    translate(width / 2, height * 0.85);

    let p0 = iso(this.x, this.y, this.z);
    let p1 = iso(this.x + 1, this.y, this.z);
    let p2 = iso(this.x + 1, this.y + 1, this.z);
    let p3 = iso(this.x, this.y + 1, this.z);
    let p4 = iso(this.x, this.y, this.z + 1);
    let p5 = iso(this.x + 1, this.y, this.z + 1);
    let p6 = iso(this.x + 1, this.y + 1, this.z + 1);
    let p7 = iso(this.x, this.y + 1, this.z + 1);

    let col = this.color;
    if (this.highlighted) {
      col = color(255, 255, 0);
    }

    let breathe = sin(frameCount * 0.05 + this.x * 0.5 + this.y * 0.5) * 2;

    stroke(0, 100);
    strokeWeight(this.highlighted ? 2 : 1);

    // Bottom face
    fill(red(col) * 0.7, green(col) * 0.7, blue(col) * 0.7);
    beginShape();
    vertex(p0.x, p0.y);
    vertex(p1.x, p1.y);
    vertex(p2.x, p2.y);
    vertex(p3.x, p3.y);
    endShape(CLOSE);

    // Back face
    fill(red(col) * 0.85, green(col) * 0.85, blue(col) * 0.85);
    beginShape();
    vertex(p1.x, p1.y);
    vertex(p5.x, p5.y + breathe);
    vertex(p6.x, p6.y + breathe);
    vertex(p2.x, p2.y);
    endShape(CLOSE);

    // Left face
    fill(red(col) * 0.75, green(col) * 0.75, blue(col) * 0.75);
    beginShape();
    vertex(p0.x, p0.y);
    vertex(p4.x, p4.y + breathe);
    vertex(p5.x, p5.y + breathe);
    vertex(p1.x, p1.y);
    endShape(CLOSE);

    // Top face
    fill(col);
    beginShape();
    vertex(p4.x, p4.y + breathe);
    vertex(p5.x, p5.y + breathe);
    vertex(p6.x, p6.y + breathe);
    vertex(p7.x, p7.y + breathe);
    endShape(CLOSE);

    // Front face
    fill(red(col) * 0.8, green(col) * 0.8, blue(col) * 0.8);
    beginShape();
    vertex(p0.x, p0.y);
    vertex(p3.x, p3.y);
    vertex(p7.x, p7.y + breathe);
    vertex(p4.x, p4.y + breathe);
    endShape(CLOSE);

    // Right face
    fill(red(col) * 0.9, green(col) * 0.9, blue(col) * 0.9);
    beginShape();
    vertex(p3.x, p3.y);
    vertex(p2.x, p2.y);
    vertex(p6.x, p6.y + breathe);
    vertex(p7.x, p7.y + breathe);
    endShape(CLOSE);

    pop();
  }
}

function drawCuttingMat() {
  push();
  translate(width / 2, height * 0.85);

  let matSize = 15;

  let topCorners = [
    iso(-matSize / 2, -matSize / 2, 0),
    iso(matSize / 2, -matSize / 2, 0),
    iso(matSize / 2, matSize / 2, 0),
    iso(-matSize / 2, matSize / 2, 0),
  ];

  let bottomCorners = [
    iso(-matSize / 2, -matSize / 2, -MAT_THICKNESS),
    iso(matSize / 2, -matSize / 2, -MAT_THICKNESS),
    iso(matSize / 2, matSize / 2, -MAT_THICKNESS),
    iso(-matSize / 2, matSize / 2, -MAT_THICKNESS),
  ];

  // Draw bottom edges
  fill(MAT_EDGE);
  stroke(MAT_EDGE);
  strokeWeight(1);

  // Side edges
  beginShape();
  vertex(topCorners[3].x, topCorners[3].y);
  vertex(bottomCorners[3].x, bottomCorners[3].y);
  vertex(bottomCorners[2].x, bottomCorners[2].y);
  vertex(topCorners[2].x, topCorners[2].y);
  endShape(CLOSE);

  beginShape();
  vertex(topCorners[1].x, topCorners[1].y);
  vertex(bottomCorners[1].x, bottomCorners[1].y);
  vertex(bottomCorners[2].x, bottomCorners[2].y);
  vertex(topCorners[2].x, topCorners[2].y);
  endShape(CLOSE);

  // Mat top surface
  fill(MAT_GREEN);
  stroke(MAT_GRID);
  strokeWeight(1);
  beginShape();
  for (let corner of topCorners) {
    vertex(corner.x, corner.y);
  }
  endShape(CLOSE);

  // Front edge
  fill(MAT_EDGE);
  stroke(MAT_EDGE);
  strokeWeight(1);
  beginShape();
  vertex(topCorners[0].x, topCorners[0].y);
  vertex(topCorners[1].x, topCorners[1].y);
  vertex(bottomCorners[1].x, bottomCorners[1].y);
  vertex(bottomCorners[0].x, bottomCorners[0].y);
  endShape(CLOSE);

  // Grid lines
  stroke(MAT_GRID);
  strokeWeight(0.8);

  for (let i = -matSize / 2 + 1; i <= matSize / 2 - 1; i++) {
    let startH = iso(-matSize / 2 + RULER_INSET, i, 0);
    let endH = iso(matSize / 2 - RULER_INSET, i, 0);
    line(startH.x, startH.y, endH.x, endH.y);

    let startV = iso(i, -matSize / 2 + RULER_INSET, 0);
    let endV = iso(i, matSize / 2 - RULER_INSET, 0);
    line(startV.x, startV.y, endV.x, endV.y);
  }

  // Ruler markings
  strokeWeight(2);
  textSize(10);

  for (let i = -matSize / 2 + 2; i <= matSize / 2 - 2; i++) {
    if (i % 2 === 0) {
      let pos = iso(i, -matSize / 2 + RULER_INSET, 0);
      let tickEnd = iso(i, -matSize / 2 + RULER_INSET * 2, 0);

      stroke(MAT_LINES);
      line(pos.x, pos.y, tickEnd.x, tickEnd.y);

      fill(MAT_TEXT);
      noStroke();
      text(abs(i), pos.x, pos.y + 15);

      pos = iso(-matSize / 2 + RULER_INSET, i, 0);
      tickEnd = iso(-matSize / 2 + RULER_INSET * 2, i, 0);

      stroke(MAT_LINES);
      line(pos.x, pos.y, tickEnd.x, tickEnd.y);

      fill(MAT_TEXT);
      noStroke();
      text(abs(i), pos.x - 15, pos.y);
    } else {
      let pos = iso(i, -matSize / 2 + RULER_INSET, 0);
      let miniTickEnd = iso(i, -matSize / 2 + RULER_INSET * 1.5, 0);
      stroke(MAT_LINES);
      line(pos.x, pos.y, miniTickEnd.x, miniTickEnd.y);

      pos = iso(-matSize / 2 + RULER_INSET, i, 0);
      miniTickEnd = iso(-matSize / 2 + RULER_INSET * 1.5, i, 0);
      line(pos.x, pos.y, miniTickEnd.x, miniTickEnd.y);
    }
  }

  pop();
}

function iso(x, y, z) {
  let isoX = (x - y) * cos(PI / 6) * SCALE;
  let isoY = ((x + y) * sin(PI / 6) - z) * SCALE;
  return createVector(isoX, isoY);
}

function setup() {
  createCanvas(400, 800);
  modules = [];

  // Sound setup
  const audioContext = getAudioContext();
  audioContext.resume();

  osc = new p5.Oscillator("triangle"); // Changed to triangle for softer sound
  env = new p5.Envelope();
  env.setADSR(0.05, 0.1, 0.3, 0.5); // Softer envelope
  env.setRange(0.4, 0);
  osc.start();
  osc.amp(0);

  reverb = new p5.Reverb();
  delay = new p5.Delay();

  // Configure effects for more ambient sound
  reverb.process(osc, 3, 2);
  delay.process(osc, 0.12, 0.7, 2300);

  // Mix the effects
  reverb.drywet(0.3);
  delay.drywet(0.2);
}

function addNewLayer() {
  currentHeight++;

  let centerModule = new Module(0, 0, currentHeight);
  modules.push(centerModule);

  for (let x = -maxHorizontalSpread; x <= maxHorizontalSpread; x++) {
    for (let y = -maxHorizontalSpread; y <= maxHorizontalSpread; y++) {
      if (x === 0 && y === 0) continue;

      let distance = sqrt(x * x + y * y);
      if (
        distance <= maxHorizontalSpread &&
        random() > distance / maxHorizontalSpread
      ) {
        const module = new Module(x, y, currentHeight);
        if (module.type !== null) {
          modules.push(module);
        }
      }
    }
  }
}

function draw() {
  background("#F4F2EF");
  drawCuttingMat();

  if (growing && frameCount % 30 === 0) {
    addNewLayer();
  }

  modules.sort((a, b) => a.x + a.y + a.z - (b.x + b.y + b.z));

  for (let module of modules) {
    module.display();

    // Play growth sound when module is first added
    if (growing && module.z === currentHeight) {
      module.playGrowthSound();
    }
  }
}

function mousePressed() {
  if (!growing) {
    growing = true;
    currentHeight = 0;
    modules = [];
  }
}

function keyPressed() {
  // Save canvas when 's' is pressed
  if (key === "s" || key === "S") {
    saveCanvas("MetabolistStructure", "png");
  }

  // Toggle growth with spacebar
  if (key === " ") {
    growing = !growing;
  }
}

// Optional: Add mouse interaction to highlight modules
function mouseMoved() {
  for (let module of modules) {
    let p = iso(module.x, module.y, module.z);
    let mousePos = createVector(mouseX - width / 2, mouseY - height * 0.85);

    // Simple proximity-based highlighting and sound
    let distance = p5.Vector.dist(p, mousePos);
    module.highlighted = distance < 20;

    // Play hover sound
    if (module.highlighted && lastPlayedModule !== module && soundEnabled) {
      playHoverSound(module);
      lastPlayedModule = module;
    }
  }
}

function playNote(note) {
  let freq = midiToFreq(note);
  osc.freq(freq);

  // Softer attack and release for more pleasant sound
  env.setADSR(0.05, 0.1, 0.3, 0.5);
  env.setRange(0.3, 0);
  env.play(osc);
}

function playChord(notes) {
  // Create multiple oscillators for chord with slight arpeggio
  notes.forEach((note, i) => {
    setTimeout(() => {
      playNote(note);
    }, i * 50); // Slight arpeggio effect
  });
}

function playHoverSound(module) {
  // Calculate distance from center
  let distanceFromCenter = sqrt(module.x * module.x + module.y * module.y);

  // Get base note from pentatonic scale based on distance
  let scaleIndex = floor(
    map(distanceFromCenter, 0, 3, 0, pentatonicScale.length)
  );
  let baseNote = pentatonicScale[scaleIndex];

  // Add type-based harmony
  let noteOffset = 0;
  switch (module.type) {
    case "core":
      noteOffset = 0;
      break;
    case "living":
      noteOffset = 4;
      break; // Major third
    case "community":
      noteOffset = 7;
      break; // Perfect fifth
    case "circulation":
      noteOffset = 2;
      break; // Major second
    case "garden":
      noteOffset = 9;
      break; // Major sixth
  }

  let note = baseNote + noteOffset;

  // Very short, gentle envelope for hover sound
  osc.freq(midiToFreq(note));
  env.setADSR(0.05, 0.1, 0, 0.1);
  env.setRange(0.1, 0);
  env.play(osc);
}

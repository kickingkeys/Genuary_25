let points = [];
let connections = [];
const numPoints = 150;
const connectionDistance = 120;
let time = 0;

// Sound variables
let audioStarted = false;
let osc;
let noteIndex = 0;

// Musical scales
const scales = {
  pentatonic: [60, 62, 65, 67, 70, 72, 74, 77, 79, 82], // C pentatonic
  harmonic: [60, 62, 64, 65, 67, 68, 71, 72],  // C harmonic minor
  japanese: [60, 61, 65, 67, 68, 72, 73, 77],  // Japanese in-sen scale
  gamelan: [60, 61, 63, 67, 68, 72, 73, 75]    // Pelog-like scale
};

let currentScale = scales.pentatonic;
let baseFreq = 220; // Starting at A3
let lastScaleChange = 0;

function setup() {
  createCanvas(600, 1200);
  background(0);
  
  // Initialize points with random positions and velocities
  for (let i = 0; i < numPoints; i++) {
    points.push({
      pos: createVector(random(width), random(height)),
      vel: p5.Vector.random2D().mult(random(0.5, 2)),
      shapeSize: random(5, 15),
      type: floor(random(3)),
      phase: random(TWO_PI),
      lastConnectionTime: 0 // Track when last sound was played
    });
  }
}

function playNote(midiNote, velocity = 0.2) {
  if (!audioStarted || !osc) return;
  
  // Occasionally change scale
  if (millis() - lastScaleChange > 5000 && random() < 0.1) {
    let scales_arr = Object.values(scales);
    currentScale = random(scales_arr);
    lastScaleChange = millis();
  }
  
  // Get a note from current scale
  let noteFromScale = random(currentScale);
  
  // Add slight random detuning for organic feeling
  let detuning = random(-0.3, 0.3);
  let freq = midiToFreq(noteFromScale) + detuning;
  
  // Vary the oscillator type occasionally
  if (random() < 0.1) {
    osc.setType(random(['sine', 'triangle', 'square']));
  }
  
  // More organic envelope
  let duration = random(100, 300);
  osc.freq(freq, 0.1); // Smooth frequency transition
  osc.amp(velocity * random(0.8, 1.0), 0.05);
  
  setTimeout(() => {
    osc.amp(0, random(0.1, 0.3));
  }, duration);
}

function draw() {
  background(0);
  
  // Update and draw points
  points.forEach((point, i) => {
    // Previous position for collision detection
    let prevPos = point.pos.copy();
    
    // Update position
    point.pos.add(point.vel);
    
    // Bounce off edges with sound
    let bounced = false;
    if (point.pos.x < 0 || point.pos.x > width) {
      point.vel.x *= -1;
      bounced = true;
    }
    if (point.pos.y < 0 || point.pos.y > height) {
      point.vel.y *= -1;
      bounced = true;
    }
    
    // Play bounce sound with more variation
    if (bounced && audioStarted && millis() - point.lastConnectionTime > 200) {
      // Only play sound 70% of the time for less density
      if (random() < 0.7) {
        playNote(random(currentScale), random(0.1, 0.3));
        noteIndex = (noteIndex + 1) % currentScale.length;
      }
      point.lastConnectionTime = millis();
    }
    
    // Update phase for pulsing
    point.phase += 0.05;
  });
  
  // Draw connections
  stroke(255);
  strokeWeight(1);
  connections = [];
  
  // Find and draw connections with sound
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      let d = p5.Vector.dist(points[i].pos, points[j].pos);
      if (d < connectionDistance) {
        connections.push([points[i], points[j], d]);
        let alpha = map(d, 0, connectionDistance, 255, 0);
        stroke(255, alpha);
        line(points[i].pos.x, points[i].pos.y, points[j].pos.x, points[j].pos.y);
        
        // Play connection sound if new connection formed
        if (audioStarted && d < connectionDistance * 0.3 && 
            millis() - points[i].lastConnectionTime > 200 &&
            millis() - points[j].lastConnectionTime > 200) {
          playNote(random(currentScale), 0.1);
          noteIndex = (noteIndex + 1) % currentScale.length;
          points[i].lastConnectionTime = millis();
          points[j].lastConnectionTime = millis();
        }
      }
    }
  }
  
  // Draw points and shapes
  points.forEach(point => {
    push();
    translate(point.pos.x, point.pos.y);
    
    let currentSize = point.shapeSize * (1 + 0.3 * sin(point.phase));
    
    if (point.type === 0) { // Circle
      if (frameCount % 2 === 0) {
        fill(255);
        noStroke();
      } else {
        noFill();
        stroke(255);
        strokeWeight(2);
      }
      circle(0, 0, currentSize);
    } else if (point.type === 1) { // Square
      if (frameCount % 2 === 0) {
        fill(255);
        noStroke();
      } else {
        noFill();
        stroke(255);
        strokeWeight(2);
      }
      rectMode(CENTER);
      rotate(time * 0.5);
      square(0, 0, currentSize);
    } else { // Cross
      stroke(255);
      strokeWeight(2);
      let halfSize = currentSize / 2;
      line(-halfSize, 0, halfSize, 0);
      line(0, -halfSize, 0, halfSize);
    }
    pop();
  });
  
  // Draw intersection points
  for (let i = 0; i < connections.length; i++) {
    for (let j = i + 1; j < connections.length; j++) {
      let int = lineIntersection(
        connections[i][0].pos, connections[i][1].pos,
        connections[j][0].pos, connections[j][1].pos
      );
      if (int) {
        push();
        noStroke();
        fill(255);
        circle(int.x, int.y, 4);
        pop();
      }
    }
  }
  
  // Wandering points with sound
  for (let i = 0; i < 10; i++) {
    let t = (time * (0.5 + i * 0.1)) % connections.length;
    let connection = connections[floor(t)];
    if (connection) {
      let pos = p5.Vector.lerp(
        connection[0].pos,
        connection[1].pos,
        (t % 1)
      );
      fill(255);
      noStroke();
      circle(pos.x, pos.y, 6);
      
      // Occasional sounds for wandering points
      if (audioStarted && random() < 0.02) {
        playNote(random(currentScale), 0.05);
        noteIndex = (noteIndex + 1) % currentScale.length;  // Fixed line
      }
    }
  }
  
  time += 0.02;
}

function mousePressed() {
  if (!audioStarted) {
    // Initialize audio on first click
    userStartAudio().then(() => {
      console.log('Audio is ready');
      // Create and start oscillator
      osc = new p5.Oscillator('sine');
      osc.amp(0);  // Start silent
      osc.start();
      audioStarted = true;
    });
  }
  
  // Randomize velocities and play a note
  points.forEach(point => {
    point.vel = p5.Vector.random2D().mult(random(0.5, 2));
  });
  
  if (audioStarted) {
    // Play an initial note from current scale
    playNote(random(currentScale), 0.2);
  }
}

function lineIntersection(p1, p2, p3, p4) {
  let denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  
  if (denominator === 0) return null;
  
  let ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
  let ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;
  
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;
  
  return createVector(
    p1.x + ua * (p2.x - p1.x),
    p1.y + ua * (p2.y - p1.y)
  );
}

let buildings = [];
let constructionPhase = 0;
let gridSize = 15; // Reduced grid size to fit smaller canvas
let citySize = 12; // Adjusted city size
let maxHeight = 200; // Adjusted max height
let constructionSpeed = 0.2; // Slowed down construction speed significantly
let dataPoints = [];
let camX, camY, camZ;  // Declare camera position variables globally

function setup() {
  createCanvas(400, 800, WEBGL); // Changed canvas size
  generateCityLayout();
  generateDataPoints();
  perspective(PI / 2.8, width / height, 0.1, 5000); // Adjusted perspective for new aspect ratio
}

class Building {
  constructor(x, y, width, height, depth) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.depth = depth;
    this.targetHeight = height;
    this.currentHeight = 0;
    this.sections = floor(random(2, 6));
    this.hasAntenna = random() > 0.8;
    this.gridDensity = random([5, 8, 10]); // Increased density of lines
    this.constructed = false;
    this.constructionElements = [];
    this.generateConstructionSequence();
  }

  generateConstructionSequence() {
    // Increased number of vertical lines
    for(let h = 0; h <= this.targetHeight; h += this.gridDensity/2) { // Halved the spacing
      // Vertical support structures
      this.constructionElements.push({
        type: 'supports',
        height: h,
        drawn: false
      });
      
      // Horizontal grid - more frequent
      if(h % (this.gridDensity) === 0) { // Increased frequency
        this.constructionElements.push({
          type: 'grid',
          height: h,
          drawn: false
        });
      }
    }

    // Add more detailed setbacks
    if(this.targetHeight > 50) {
      for(let s = 1; s < this.sections * 2; s++) { // Doubled number of setbacks
        let setbackHeight = (this.targetHeight / (this.sections * 2)) * s;
        this.constructionElements.push({
          type: 'setback',
          height: setbackHeight,
          drawn: false
        });
      }
    }
  }

  drawVerticalSupports(h) {
    // Front verticals - added intermediate supports
    beginShape(LINES);
    for(let x = 0; x <= this.width; x += this.width/4) { // Added more vertical lines
      vertex(x, 0, 0);
      vertex(x, -h, 0);
    }
    
    // Back verticals
    for(let x = 0; x <= this.width; x += this.width/4) {
      vertex(x, 0, this.depth);
      vertex(x, -h, this.depth);
    }
    
    // Side verticals
    for(let z = 0; z <= this.depth; z += this.depth/4) {
      vertex(0, 0, z);
      vertex(0, -h, z);
      vertex(this.width, 0, z);
      vertex(this.width, -h, z);
    }
    endShape();
  }

  drawFloorGrid(h) {
    // Draw denser floor grid lines
    beginShape(LINES);
    for(let x = 0; x <= this.width; x += this.gridDensity/2) {
      vertex(x, -h, 0);
      vertex(x, -h, this.depth);
    }
    for(let z = 0; z <= this.depth; z += this.gridDensity/2) {
      vertex(0, -h, z);
      vertex(this.width, -h, z);
    }
    // Add diagonal grid lines
    for(let x = 0; x <= this.width; x += this.gridDensity) {
      vertex(x, -h, 0);
      vertex(x + this.gridDensity, -h, this.depth);
    }
    endShape();
  }

  drawSetback(h) {
    let setbackAmount = this.width * 0.15;
    beginShape(LINES);
    // Horizontal setback lines with additional detail
    vertex(setbackAmount, -h, setbackAmount);
    vertex(this.width - setbackAmount, -h, setbackAmount);
    vertex(this.width - setbackAmount, -h, this.depth - setbackAmount);
    vertex(setbackAmount, -h, this.depth - setbackAmount);
    vertex(setbackAmount, -h, setbackAmount);
    
    // Additional cross lines for detail
    vertex(setbackAmount, -h, this.depth - setbackAmount);
    vertex(this.width - setbackAmount, -h, setbackAmount);
    endShape();
  }

  update() {
    if(!this.constructed) {
      let undrawnElements = this.constructionElements.filter(elem => !elem.drawn);
      if(undrawnElements.length > 0) {
        // Slower construction
        if(random() < constructionSpeed) { // Only update sometimes
          let elementsToDraw = 1; // Draw one element at a time
          for(let i = 0; i < elementsToDraw; i++) {
            if(undrawnElements[i]) {
              undrawnElements[i].drawn = true;
            }
          }
        }
      } else {
        this.constructed = true;
      }
    }
  }

  draw() {
    push();
    translate(this.x, 0, this.y);
    stroke(100, 200, 255, 150);
    strokeWeight(0.5);
    noFill();

    // Draw constructed elements
    this.constructionElements.forEach(element => {
      if(element.drawn) {
        switch(element.type) {
          case 'supports':
            this.drawVerticalSupports(element.height);
            break;
          case 'grid':
            this.drawFloorGrid(element.height);
            break;
          case 'setback':
            this.drawSetback(element.height);
            break;
        }
      }
    });

    // Draw antenna if building is complete
    if(this.hasAntenna && this.constructed) {
      let antennaHeight = this.targetHeight * 0.2;
      beginShape(LINES);
      vertex(this.width/2, -this.targetHeight, this.depth/2);
      vertex(this.width/2, -this.targetHeight-antennaHeight, this.depth/2);
      endShape();
    }
    
    pop();
  }
}

function generateCityLayout() {
  for(let x = -citySize/2; x < citySize/2; x++) {
    for(let z = -citySize/2; z < citySize/2; z++) {
      if(random() > 0.3) {  // 70% chance for building
        let xPos = x * gridSize * 2;
        let zPos = z * gridSize * 2;
        let width = gridSize * random(0.8, 1.5);
        let depth = gridSize * random(0.8, 1.5);
        let height = random(30, maxHeight);
        
        // Taller buildings near center
        let distFromCenter = dist(x, z, 0, 0);
        height *= map(distFromCenter, 0, citySize/2, 1, 0.5);
        
        buildings.push(new Building(xPos, zPos, width, height, depth));
      }
    }
  }
}

function generateDataPoints() {
  for(let i = 0; i < 150; i++) {  // Increased number of particles
    dataPoints.push({
      x: random(-citySize * gridSize, citySize * gridSize),
      y: random(-maxHeight * 1.5, 20),
      z: random(-citySize * gridSize, citySize * gridSize),
      baseSize: random(1.5, 4),  // Slightly smaller for snow
      speed: random(0.3, 1.2),   // Slower fall speed
      wobble: {                  // Add slight horizontal movement
        x: random(-0.2, 0.2),
        z: random(-0.2, 0.2)
      }
    });
  }
}

function drawGroundGrid() {
  stroke(100, 200, 255, 50);
  let gridExtent = citySize * gridSize * 1.2;
  beginShape(LINES);
  for(let x = -gridExtent; x <= gridExtent; x += gridSize) {
    vertex(x, 0, -gridExtent);
    vertex(x, 0, gridExtent);
  }
  for(let z = -gridExtent; z <= gridExtent; z += gridSize) {
    vertex(-gridExtent, 0, z);
    vertex(gridExtent, 0, z);
  }
  endShape();
}

function draw() {
  background(0);
  
  // Adjusted camera for taller/narrower view
  camX = sin(frameCount * 0.001) * citySize * gridSize * 1.8;
  camZ = cos(frameCount * 0.001) * citySize * gridSize * 1.8;
  camY = -maxHeight * 1.2; // Higher camera position
  camera(camX, camY, camZ, 0, -maxHeight * 0.5, 0, 0, 1, 0);
  
  // Draw ground grid
  drawGroundGrid();
  
  // Update and draw buildings
  buildings.forEach(building => {
    building.update();
    building.draw();
  });
  
  // Draw and update data points with snow effect
  noStroke();
  dataPoints.forEach(point => {
    push();
    translate(point.x, point.y, point.z);
    
    // Calculate distance from camera
    let dx = point.x - camX;
    let dy = point.y - camY;
    let dz = point.z - camZ;
    let distanceFromCamera = sqrt(dx*dx + dy*dy + dz*dz);
    
    // Scale size and alpha based on distance
    let scaleFactor = map(distanceFromCamera, 0, citySize * gridSize * 3, 1, 0.2);
    let currentSize = point.baseSize * scaleFactor;
    let alphaValue = map(distanceFromCamera, 0, citySize * gridSize * 3, 255, 50);
    
    // Set color with alpha
    fill(200, 220, 255, alphaValue);
    
    sphere(currentSize);
    
    // Update position with snow-like movement
    point.y += point.speed;
    point.x += point.wobble.x;
    point.z += point.wobble.z;
    
    // Reset when reaching bottom or going too far sideways
    if(point.y > 20 || 
       abs(point.x) > citySize * gridSize * 1.5 || 
       abs(point.z) > citySize * gridSize * 1.5) {
      point.y = -maxHeight * 1.5;
      point.x = random(-citySize * gridSize, citySize * gridSize);
      point.z = random(-citySize * gridSize, citySize * gridSize);
      point.wobble.x = random(-0.2, 0.2);
      point.wobble.z = random(-0.2, 0.2);
    }
    pop();
  });
}
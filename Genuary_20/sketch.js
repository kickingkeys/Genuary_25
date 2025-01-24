let buildings = [];
const GRID_SIZE = 15;
let grid = [];
const colors = ['#fe938c','#e6b89c','#ead2ac','#9cafb7','#4281a4'];
let lastBuildingTime = 0;
const BUILDING_INTERVAL = 750; // 750ms = 3/4 second

function setup() {
  createCanvas(600, 1200);
  
  // Initialize grid for plan view
  for (let x = 0; x < GRID_SIZE; x++) {
    grid[x] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      grid[x][y] = {
        occupied: false,
        color: null,
        alpha: 0
      };
    }
  }
  
  // Initialize with 12 buildings
  for (let i = 0; i < 12; i++) {
    addNewBuilding();
  }
  
  background('#f5f5f5');
  lastBuildingTime = millis();
}

function addNewBuilding() {
  // Find an unoccupied spot in the grid
  let attempts = 0;
  let gridX, gridY;
  do {
    gridX = floor(random(GRID_SIZE));
    gridY = floor(random(GRID_SIZE));
    attempts++;
  } while (false); // Allow building on occupied spots
  
  { // Always add building
    let x = map(gridX, 0, GRID_SIZE-1, 50, width-50);
    let building = new Building(x, gridX, gridY);
    buildings.push(building);
    grid[gridX][gridY].occupied = true;
    grid[gridX][gridY].color = building.color;
  }
}

function checkNewBuilding() {
  let currentTime = millis();
  if (currentTime - lastBuildingTime > BUILDING_INTERVAL) {
    addNewBuilding();
    lastBuildingTime = currentTime;
  }
}

function draw() {
  // Clear the canvas with a very light background
  background('#f5f5f5');
  
  // Check if it's time to add a new building
  checkNewBuilding();
  
  // Draw elevation view (front view) first so it appears behind plan
  drawElevationView();
  
  // Draw plan view (top-down) last so it appears on top
  drawPlanView();
  
  // Update buildings
  buildings.forEach(building => {
    building.update();
  });
  
  // No building removal - let them accumulate
}

function drawPlanView() {
  push();
  // Move to top right and scale down
  let cellSize = 15; // Half the original size
  let gridWidth = GRID_SIZE * cellSize;
  let gridHeight = GRID_SIZE * cellSize;
  let margin = 20;
  
  // Position in top right with margin
  translate(width - gridWidth - margin, margin);
  
  // Semi-transparent white background for plan view
  fill(245, 245, 245, 240);
  noStroke();
  rect(-10, -10, gridWidth + 20, gridHeight + 20);
  
  // Draw grid
  stroke('#e0e0e0');
  strokeWeight(0.3); // Thinner lines for smaller grid
  
  // Vertical lines
  for (let x = 0; x <= GRID_SIZE; x++) {
    line(x * cellSize, 0, x * cellSize, gridHeight);
  }
  // Horizontal lines
  for (let y = 0; y <= GRID_SIZE; y++) {
    line(0, y * cellSize, gridWidth, y * cellSize);
  }
  
  // Draw occupied cells
  noStroke();
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (grid[x][y].occupied) {
        let c = color(grid[x][y].color);
        c.setAlpha(grid[x][y].alpha * 255);
        fill(c);
        rect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
  pop();
}

function drawElevationView() {
  push();
  translate(0, height);
  scale(1, -1); // Flip vertically so buildings grow upward
  
      // No need to sort - newer buildings will appear on top naturally
  
  buildings.forEach(building => {
    building.display();
  });
  pop();
}

class Building {
  constructor(x, gridX, gridY) {
    this.x = x;
    this.gridX = gridX;
    this.gridY = gridY;
    this.baseWidth = random(30, 80);
    this.maxHeight = random(400, 1400);
    this.currentHeight = 0;
    this.targetHeight = random(300, this.maxHeight);
    this.growthSpeed = random(1, 3);
    this.color = random(colors);
    this.style = floor(random(4)); // 0-3 for different styles
    this.windowSize = map(this.baseWidth, 30, 80, 4, 8);
    this.windowColor = '#ffffff';
    this.detailColor = lerpColor(color(this.color), color('#ffffff'), 0.3);
    
    // Style-specific properties
    switch(this.style) {
      case 0: // Modern with horizontal bands
        this.bandSpacing = random(60, 100);
        this.bandHeight = random(10, 20);
        break;
      case 1: // Art deco with setbacks
        this.setbacks = [];
        let currentWidth = this.baseWidth;
        let heightInterval = this.targetHeight / 4;
        for(let i = 0; i < 3; i++) {
          this.setbacks.push({
            height: heightInterval * (i + 1),
            reduction: random(0.1, 0.3)
          });
        }
        break;
      case 2: // Glass curtain wall
        this.gridSize = random(15, 25);
        this.reflectionOffset = random(10);
        break;
      case 3: // Postmodern with irregular windows
        this.windowPattern = [];
        for(let i = 0; i < 10; i++) {
          this.windowPattern.push({
            x: random(0.2, 0.8),
            size: random(0.5, 1.5)
          });
        }
        break;
    }
  }
  
  update() {
    if (this.currentHeight < this.targetHeight) {
      this.currentHeight += this.growthSpeed;
      grid[this.gridX][this.gridY].alpha = 
        min(0.85, map(this.currentHeight, 0, 400, 0.1, 0.85));
    }
  }
  
  display() {
    push();
    let buildingColor = color(this.color);
    buildingColor.setAlpha(230);
    
    switch(this.style) {
      case 0:
        this.displayModernStyle(buildingColor);
        break;
      case 1:
        this.displayArtDecoStyle(buildingColor);
        break;
      case 2:
        this.displayGlassStyle(buildingColor);
        break;
      case 3:
        this.displayPostmodernStyle(buildingColor);
        break;
    }
    pop();
  }
  
  displayModernStyle(buildingColor) {
    // Main structure
    fill(buildingColor);
    noStroke();
    rect(this.x, 0, this.baseWidth, this.currentHeight);
    
    // Horizontal bands
    fill(this.detailColor);
    for(let y = 0; y < this.currentHeight; y += this.bandSpacing) {
      rect(this.x, y, this.baseWidth, this.bandHeight);
    }
    
    // Continuous window strips
    fill(this.windowColor);
    for(let y = this.bandHeight; y < this.currentHeight; y += this.bandSpacing) {
      if(y + this.bandSpacing/2 < this.currentHeight) {
        rect(this.x + 5, y + this.bandHeight, this.baseWidth - 10, this.bandSpacing/2);
      }
    }
  }
  
  displayArtDecoStyle(buildingColor) {
    let currentWidth = this.baseWidth;
    let currentX = this.x;
    
    // Draw sections with setbacks
    for(let i = 0; i < this.setbacks.length + 1; i++) {
      let sectionBottom = i === 0 ? 0 : this.setbacks[i-1].height;
      let sectionTop = i === this.setbacks.length ? this.currentHeight : 
                      min(this.setbacks[i].height, this.currentHeight);
      
      if(sectionTop > sectionBottom) {
        // Main section
        fill(buildingColor);
        rect(currentX, sectionBottom, currentWidth, sectionTop - sectionBottom);
        
        // Decorative elements
        stroke(this.detailColor);
        strokeWeight(2);
        let spacing = 40;
        for(let y = sectionBottom; y < sectionTop; y += spacing) {
          line(currentX, y, currentX + currentWidth, y);
        }
        
        // Windows
        fill(this.windowColor);
        noStroke();
        let windowSpacing = spacing/2;
        for(let y = sectionBottom + 20; y < sectionTop - 20; y += windowSpacing) {
          rect(currentX + currentWidth*0.2, y, currentWidth*0.2, windowSpacing/2);
          rect(currentX + currentWidth*0.6, y, currentWidth*0.2, windowSpacing/2);
        }
      }
      
      if(i < this.setbacks.length) {
        currentWidth *= (1 - this.setbacks[i].reduction);
        currentX += (this.baseWidth - currentWidth)/2;
      }
    }
  }
  
  displayGlassStyle(buildingColor) {
    // Main structure
    fill(buildingColor);
    noStroke();
    rect(this.x, 0, this.baseWidth, this.currentHeight);
    
    // Glass grid
    stroke(255, 255, 255, 100);
    strokeWeight(1);
    
    for(let x = 0; x <= this.baseWidth; x += this.gridSize) {
      line(this.x + x, 0, this.x + x, this.currentHeight);
    }
    
    for(let y = 0; y < this.currentHeight; y += this.gridSize) {
      line(this.x, y, this.x + this.baseWidth, y);
    }
    
    // Reflective highlights
    noStroke();
    fill(255, 255, 255, 30);
    for(let y = 0; y < this.currentHeight; y += this.gridSize * 2) {
      let highlightWidth = sin(y * 0.01 + this.reflectionOffset) * this.baseWidth/3 + this.baseWidth/3;
      rect(this.x, y, highlightWidth, this.gridSize);
    }
  }
  
  displayPostmodernStyle(buildingColor) {
    // Main structure
    fill(buildingColor);
    noStroke();
    rect(this.x, 0, this.baseWidth, this.currentHeight);
    
    // Irregular window pattern
    fill(this.windowColor);
    for(let y = 40; y < this.currentHeight; y += 60) {
      this.windowPattern.forEach(pattern => {
        let windowX = this.x + pattern.x * this.baseWidth;
        let size = this.windowSize * pattern.size;
        rect(windowX - size/2, y - size/2, size, size * 1.5);
      });
    }
    
    // Decorative elements
    stroke(this.detailColor);
    strokeWeight(3);
    line(this.x + this.baseWidth*0.2, 0, this.x + this.baseWidth*0.2, this.currentHeight);
    line(this.x + this.baseWidth*0.8, 0, this.x + this.baseWidth*0.8, this.currentHeight);
    
    // Horizontal accents
    for(let y = 100; y < this.currentHeight; y += 200) {
      rect(this.x, y, this.baseWidth, 10);
    }
  }
}
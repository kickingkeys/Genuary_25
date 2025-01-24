let cells = [];
let food = [];
const INITIAL_CELLS = 8;
const MAX_CELLS = 200;
const FOOD_COLORS = ["#577455", "#8C3F4D", "#6B8E9B", "#EE8838", "#F4F2EF", "#6B8E9B"];
let petriDish;

function setup() {
  // Create a 9:16 aspect ratio canvas
  createCanvas(600, 1067);  // 600 * (16/9) ≈ 1067
  petriDish = new PetriDish(min(width, height) * 0.4);  // Size relative to smallest dimension
  for (let i = 0; i < INITIAL_CELLS; i++) {
    cells.push(new Cell(random(-petriDish.radius, petriDish.radius), random(-petriDish.radius, petriDish.radius)));
  }
}

function draw() {
  background('#F4F2EF');
  
  // Center the coordinate system in the middle of the canvas
  translate(width / 2, height / 2);
  
  petriDish.display();
  
  if (food.length < cells.length - 1 && random(1) < 0.1) {
    let angle = random(TWO_PI);
    let r = random(petriDish.radius);
    food.push(new Food(cos(angle) * r, sin(angle) * r));
  }
  
  for (let f of food) {
    f.display();
  }
  
  for (let i = cells.length - 1; i >= 0; i--) {
    cells[i].update();
    cells[i].display();
    
    if (cells[i].reproducing && cells.length < MAX_CELLS) {
      let angle = random(TWO_PI);
      let newX = cells[i].pos.x + cos(angle) * cells[i].r * 2;
      let newY = cells[i].pos.y + sin(angle) * cells[i].r * 2;
      cells.push(new Cell(newX, newY));
      cells[i].reproducing = false;
      cells[i].revertToStageOne();
      if (cells[i].interactingWith) {
        cells[i].interactingWith.reproducing = false;
        cells[i].interactingWith.revertToStageOne();
        cells[i].interactingWith.interactingWith = null;
      }
      cells[i].interactingWith = null;
    }
  }
}

class PetriDish {
  constructor(radius) {
    this.radius = radius;
  }
  
  display() {
    noFill();
    stroke(200);
    strokeWeight(2);
    ellipse(0, 0, this.radius * 2);
  }
}

class Cell {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.acc = createVector();
    this.r = 15;
    this.maxSpeed = 2;
    this.maxForce = 0.1;
    this.foodEaten = 0;
    this.stage = 1;
    this.color = this.getColorForStage(this.stage);
    this.interactingWith = null;
    this.interactionTime = 0;
    this.reproducing = false;
  }

  update() {
    if (!this.interactingWith) {
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.mult(0);
      
      this.edges();
      this.eat();
      this.revertStage();
      if (this.stage < 5) {
        this.seekFood();
      } else {
        if (!this.seekStage5()) {
          this.vel.add(p5.Vector.random2D().mult(0.1));
        }
      }
    } else {
      this.interact();
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading() + PI/2);
    
    fill(this.color);
    noStroke();
    beginShape();
    vertex(0, -this.r);
    bezierVertex(this.r, -this.r, this.r, this.r, 0, this.r);
    bezierVertex(-this.r, this.r, -this.r, -this.r, 0, -this.r);
    endShape(CLOSE);
    
    fill(150, 140);
    ellipse(0, 0, this.r * 0.6);
    
    // Display stage number
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(10);
    text(this.stage, 0, 0);
    
    if (this.stage === 5) {
      let auraSize = map(sin(frameCount * 0.1), -1, 1, this.r * 2, this.r * 3);
      stroke(0, 255, 0, 50);
      noFill();
      ellipse(0, 0, auraSize);
    }
    pop();
  }

  edges() {
    let d = dist(0, 0, this.pos.x, this.pos.y);
    if (d > petriDish.radius - this.r) {
      let angle = this.pos.heading();
      this.pos.x = cos(angle) * (petriDish.radius - this.r);
      this.pos.y = sin(angle) * (petriDish.radius - this.r);
      this.vel.reflect(this.pos);
    }
  }

  eat() {
    for (let i = food.length - 1; i >= 0; i--) {
      let d = p5.Vector.dist(this.pos, food[i].pos);
      if (d < this.r) {
        food.splice(i, 1);
        this.foodEaten++;
        this.r += 0.5;
        this.stage = min(5, floor(this.foodEaten / 1) + 1);  // Update stage based on food eaten
        this.color = this.getColorForStage(this.stage);
      }
    }
  }

  seekFood() {
    if (food.length > 0) {
      let closestFood = this.getClosestFood(2);
      if (closestFood) {
        this.seek(closestFood.pos);
      }
    }
  }

  getClosestFood(n) {
    let foodCopy = [...food];
    foodCopy.sort((a, b) => {
      let da = p5.Vector.dist(this.pos, a.pos);
      let db = p5.Vector.dist(this.pos, b.pos);
      return da - db;
    });
    return random(foodCopy.slice(0, min(n, foodCopy.length)));
  }

  seekStage5() {
    let closest = null;
    let closestD = Infinity;
    for (let other of cells) {
      if (other !== this && other.stage === 5 && !other.interactingWith) {
        let d = p5.Vector.dist(this.pos, other.pos);
        if (d < closestD) {
          closest = other;
          closestD = d;
        }
      }
    }
    if (closest) {
      this.seek(closest.pos);
      if (closestD < this.r + closest.r) {
        this.interactingWith = closest;
        closest.interactingWith = this;
        return true;
      }
    }
    return false;
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    this.acc.add(steer);
  }

  interact() {
    if (this.interactingWith) {
      let angle = this.interactionTime * 0.05;
      let radius = this.r + this.interactingWith.r;
      let xOff = cos(angle) * radius;
      let yOff = sin(angle) * radius;
      
      // Keep original positions
      let originalPos = this.pos.copy();
      let partnerPos = this.interactingWith.pos.copy();
      
      // Calculate new positions
      this.pos.x = partnerPos.x + xOff;
      this.pos.y = partnerPos.y + yOff;
      
      this.interactionTime++;
      
      if (this.interactionTime > 100) {
        this.reproducing = true;
        this.interactingWith.reproducing = true;
      }
      
      // Reset to original positions
      this.pos = originalPos;
      this.interactingWith.pos = partnerPos;
    }
  }

  revertStage() {
    if (this.stage === 5 && frameCount % 300 === 0) { // Check every 5 seconds
      let foundPartner = false;
      for (let other of cells) {
        if (other !== this && other.stage === 5 && !other.interactingWith) {
          foundPartner = true;
          break;
        }
      }
      if (!foundPartner) {
        this.stage = 4;
        this.foodEaten = 4;
        this.color = this.getColorForStage(this.stage);
      }
    }
  }

  revertToStageOne() {
    this.stage = 1;
    this.foodEaten = 0;
    this.color = this.getColorForStage(this.stage);
    this.r = 15;  // Reset size to initial value
  }

  getColorForStage(stage) {
    switch(stage) {
      case 1: return color(200, 200, 200, 140);  // Light gray
      case 2: return color(150, 150, 200, 140);  // Light blue
      case 3: return color(150, 200, 150, 140);  // Light green
      case 4: return color(200, 200, 150, 140);  // Light yellow
      case 5: return color(0, 255, 0, 140);      // Bright green
      default: return color(200, 200, 200, 140);
    }
  }
}

class Food {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.color = color(random(FOOD_COLORS));
    this.size = 7.5;
  }

  display() {
    fill(this.color);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}
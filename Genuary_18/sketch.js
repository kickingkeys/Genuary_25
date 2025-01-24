let tree;
let startPoint;
let direction;
const colors = ['#00A5E3', '#8DD7BF', '#FF96C5', '#FF5768', '#FFBF65'];
let time = 0;
let windForce = 0;
let windAngle = 0;
let particles = [];

function updateWind() {
  // Reduce wind force magnitude
  windForce = noise(time * 0.0005) * 0.02; // Reduced from 0.04 to 0.02, and slowed down noise
  windAngle = noise(time * 0.001 + 1000) * TWO_PI; // Slowed down angle changes
}

class Particle {
  constructor(x, y, isFlower) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.5, 0.5), random(0.2, 0.8));
    this.acc = createVector(0, 0);
    this.life = 255;
    this.isFlower = isFlower;
    this.rotation = random(TWO_PI);
    this.rotSpeed = random(-0.05, 0.05);
    this.size = random(6, 10);
    this.color = random(colors);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.life -= 1.5;
    this.rotation += this.rotSpeed;
    this.acc.add(createVector(windForce * cos(windAngle), 0));
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);
    noStroke();
    
    // Convert hex color to RGB and add alpha
    let c = color(this.color);
    let r = red(c);
    let g = green(c);
    let b = blue(c);
    
    if (this.isFlower) {
      fill(r, g, b, this.life);
      for (let i = 0; i < 5; i++) {
        push();
        rotate((TWO_PI * i) / 5);
        ellipse(this.size/2, 0, this.size, this.size/2);
        pop();
      }
    } else {
      fill(r, g, b, this.life);
      beginShape();
      vertex(-this.size/2, 0);
      vertex(0, -this.size);
      vertex(this.size/2, 0);
      vertex(0, this.size/2);
      endShape(CLOSE);
    }
    pop();
  }

  isDead() {
    return this.life < 0 || this.pos.y > height;
  }
}

class Branch {
  constructor(loc, thic, id, branchIndex) {
    this.location = [createVector(loc.x, loc.y)];
    this.thickness = [thic];
    this.baseIndex = [[id], [branchIndex]];
    this.isFlower = random() < 0.3;
    this.color = random(colors);
    this.centerColor = random(colors);
    this.rotation = random(TWO_PI);
    this.size = random(8, 14);
    this.shadowOffset = createVector(3, 3);
  }

  rotate2D(v, theta) {
    const xTemp = v.x;
    v.x = v.x * cos(theta) - v.y * sin(theta);
    v.y = xTemp * sin(theta) + v.y * cos(theta);
  }

  applyRotation(index, theta, reference) {
    const point = this.location[index];
    point.sub(reference);
    this.rotate2D(point, theta);
    point.add(reference);
  }

  drawEndpiece(x, y) {
    noStroke();
    push();
    translate(x, y);
    rotate(this.rotation + sin(time * 0.05) * 0.1);
    
    // Draw shadow
    push();
    translate(this.shadowOffset.x, this.shadowOffset.y);
    fill(0, 30);
    if (this.isFlower) {
      this.drawFlower(0.8);
    } else {
      this.drawLeaf(0.8);
    }
    pop();
    
    // Draw actual piece
    if (this.isFlower) {
      this.drawFlower(1);
    } else {
      this.drawLeaf(1);
    }
    pop();
    
    // Create falling particles
    if (random(1) < 0.001) {
      particles.push(new Particle(x, y, this.isFlower));
    }
  }

  drawFlower(scale) {
    const petalCount = 5;
    fill(this.color);
    for (let i = 0; i < petalCount; i++) {
      push();
      rotate((TWO_PI * i) / petalCount);
      ellipse(this.size/2 * scale, 0, this.size * scale, this.size/2 * scale);
      pop();
    }
    fill(this.centerColor);
    ellipse(0, 0, this.size/2 * scale, this.size/2 * scale);
  }

  drawLeaf(scale) {
    rectMode(CENTER);
    noStroke();  // Ensure no outline
    fill(255, 100); // Inner light fill
    rect(0, 0, this.size * scale, this.size * 1.5 * scale);
  }
}

class Tree {
  constructor(startPoint, direction) {
    this.map = [];
    this.twig = [];
    this.dt = 0.025;
    this.BranchLengthFactor = 0.25;
    this.BranchLocationFactor = 0.2;
    this.init(startPoint, direction);
  }

  init(startPoint, direction) {
    let id = 0;
    let growth = false;
    let fr = [{ 
      location: createVector(startPoint.x, startPoint.y),
      velocity: createVector(direction.x, direction.y),
      thickness: random(10, 20),
      finished: false,
      update: function(factor) {
        if (this.location.x > -10 && 
            this.location.y > 100 && 
            this.location.x < width + 10 && 
            this.location.y < height + 10 && 
            this.thickness > factor) {
          this.velocity.normalize();
          let uncertain = createVector(random(-1.4, 1.4), random(-0.8, 0.4));
          uncertain.normalize();
          uncertain.mult(0.35);
          this.velocity.mult(0.75);
          this.velocity.add(uncertain);
          this.velocity.mult(random(12, 16));
          this.location.add(this.velocity);
        } else {
          this.finished = true;
        }
      }
    }];

    this.twig = [new Branch(fr[0].location, fr[0].thickness, id, 0)];
    this.map = [createVector(id, this.twig[id].location.length - 1)];

    while (!growth) {
      let growthSum = 0;
      for (id = 0; id < fr.length; id++) {
        fr[id].update(this.BranchLocationFactor);
        if (!fr[id].finished) {
          this.twig[id].location.push(createVector(fr[id].location.x, fr[id].location.y));
          this.twig[id].thickness.push(fr[id].thickness);
          this.map.push(createVector(id, this.twig[id].location.length - 1));

          if (random(0, 1) < this.BranchLengthFactor) {
            fr[id].thickness *= 0.65;
            this.twig[id].thickness[this.twig[id].thickness.length - 1] = fr[id].thickness;
            if (fr[id].thickness > this.BranchLocationFactor) {
              fr.push({
                location: createVector(fr[id].location.x, fr[id].location.y),
                velocity: createVector(fr[id].velocity.x, fr[id].velocity.y),
                thickness: fr[id].thickness,
                finished: fr[id].finished,
                update: fr[id].update
              });
              this.twig.push(new Branch(fr[id].location, fr[id].thickness, id, this.twig[id].location.length - 1));
            }
          }
        } else {
          growthSum += 1;
        }
      }
      if (growthSum === fr.length) {
        growth = true;
      }
    }
  }

  swing() {
    updateWind();
    for (let id = 0; id < this.twig.length; id++) {
      for (let _id = 1; _id < this.twig[id].location.length; _id++) {
        let heightFactor = map(this.twig[id].location[_id].y, height, 0, 0, 1);
        let windEffect = windForce * heightFactor;
        let localWindAngle = windAngle + noise(
          this.twig[id].location[_id].x * 0.01, 
          this.twig[id].location[_id].y * 0.01, 
          time * 0.001
        ) * PI;
        
        this.twig[id].applyRotation(
          _id, 
          sin(time * 0.05 + _id * 0.1) * windEffect * cos(localWindAngle),
          this.twig[id].location[0]
        );
      }
    }
  }

  draw() {
    // Draw branches
    push();
    stroke(80, 0, 50, 200); // Original color scheme
    for (let i = 1; i < this.map.length; i++) {
      strokeWeight(this.twig[floor(this.map[i].x)].thickness[floor(this.map[i].y)]);
      const branch = this.twig[floor(this.map[i].x)];
      const loc1 = branch.location[floor(this.map[i].y) - 1];
      const loc2 = branch.location[floor(this.map[i].y)];
      line(loc1.x, loc1.y, loc2.x, loc2.y);
    }
    pop();

    // Draw leaves and flowers
    push();
    noStroke();
    this.twig.forEach(branch => {
      const num = branch.location.length - 1;
      const lastLoc = branch.location[num];
      branch.drawEndpiece(lastLoc.x, lastLoc.y);
    });
    pop();
  }


}

function setup() {
  createCanvas(600, 1200);
  ellipseMode(CENTER);
  noStroke();
  smooth();
  noiseSeed(random(1000));

  startPoint = createVector(width/2, height*0.9);
  direction = createVector(width*0.05, -height*0.7);
  tree = new Tree(startPoint, direction);
}

function draw() {
  background(230, 250, 220, 250);
  time++;
  
  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
  
  // Mouse interaction for wind
  if (mouseX !== 0 || mouseY !== 0) {  // Only update if mouse has moved
    let mouseXNorm = (mouseX - width/2) / (width/2);
    let mouseYNorm = (mouseY - height/2) / (height/2);
    windForce = lerp(windForce || 0, mouseXNorm * 0.02, 0.05); // Reduced force and slower lerp
    windAngle = lerp(windAngle || 0, mouseYNorm * PI, 0.05);  // Slower lerp
  }
  
  tree.swing();
  tree.draw();
}

function mousePressed() {
  noiseSeed(random(1000));
  tree = new Tree(startPoint, direction);
}
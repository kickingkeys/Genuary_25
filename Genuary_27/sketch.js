/*

SETUP:
- Create 400x800 canvas
- Set cream-colored background

MAIN DRAW LOOP:
- Refresh background
- Calculate base rotation based on frame count
- Draw 3 overlapping textured circles:
  * Top: red->orange, fastest rotation
  * Middle: orange->teal, medium rotation
  * Bottom: teal->red, slowest rotation

TEXTURED CIRCLE FUNCTION:
- Parameters: position, size, color gradient, rotation speed
- Use multiply blend mode
- For each row in circle bounds:
  * Calculate gradient color based on vertical position
  * For each column:
    - If point is within circle radius:
      * Calculate rotation based on:
        - Base rotation value
        - Angle from center
        - Distance from center
      * Draw short line segment:
        - Length varies with distance from center
        - Weight varies with distance from center
        - Rotated according to calculated angle
- Reset blend mode

*/



function setup() {
  createCanvas(400, 800);
  background('#FAF8F4');
}

function draw() {
  background('#FAF8F4');
  
  // Calculate time-based rotation
  let baseRotation = frameCount * 2;
  
  // Draw three overlapping textured circles with different rotation speeds
  drawTexturedCircle(200, 200, 150, color('#ff6b6b'), color('#f4a261'), baseRotation);
  drawTexturedCircle(200, 400, 150, color('#f4a261'), color('#2a9d8f'), baseRotation * 0.7);
  drawTexturedCircle(200, 600, 150, color('#2a9d8f'), color('#ff6b6b'), baseRotation * 0.5);
}

function drawTexturedCircle(centerX, centerY, radius, colorA, colorB, baseRotation) {
  let strokeLength = 15;
  let strokeSpaceX = 5;
  let strokeSpaceY = 3;
  
  blendMode(MULTIPLY);
  
  let diameter = radius * 2;
  let startX = centerX - radius;
  let startY = centerY - radius;
  
  for (let dy = 0; dy < diameter; dy += strokeSpaceY) {
    let y = startY + dy;
    let t = dy / diameter;
    let currentColor = lerpColor(colorA, colorB, t);
    
    stroke(currentColor);
    noFill();
    
    for (let dx = 0; dx < diameter; dx += strokeSpaceX) {
      let x = startX + dx;
      let distToCenter = dist(x, y, centerX, centerY);
      
      if (distToCenter <= radius) {
        // Create spiral-like rotation pattern
        let angleOffset = atan2(y - centerY, x - centerX);
        let rotation = baseRotation + degrees(angleOffset) + (distToCenter * 0.5);
        
        // Adjust stroke properties for more visual interest
        strokeWeight(map(distToCenter, 0, radius, 2.5, 0.8));
        let lineLength = map(distToCenter, 0, radius, strokeLength * 1.2, strokeLength * 0.4);
        
        push();
        translate(x, y);
        rotate(radians(rotation));
        line(-lineLength/2, 0, lineLength/2, 0);
        pop();
      }
    }
  }
  
  blendMode(BLEND);
}
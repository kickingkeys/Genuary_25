let colors = ['#fe938c','#e6b89c','#ead2ac','#9cafb7','#4281a4'];
let originalGraphics;
let t = 0;
const offsetX = 0; // No offset

async function setup() {
  createCanvas(400, 800);
  originalGraphics = createGraphics(width, height);
  pixelDensity(2);
  background(240);
  
  await drawBackground();
  await drawFrontLayer();
  await drawSoftWhiteOverlay();
}

async function drawBackground() {
  let xCount = 12;
  let yCount = 12;
  let paddingX = 30;
  let paddingY = 30;
  
  // Calculate center points
  let centerX = Math.floor(xCount / 2);
  let centerY = Math.floor(yCount / 2);
  
  // Create spiral pattern from center
  for (let ring = 0; ring <= Math.max(xCount, yCount); ring++) {
    for (let i = -ring; i <= ring; i++) {
      for (let j = -ring; j <= ring; j++) {
        let x = centerX + i;
        let y = centerY + j;
        
        // Only process if on current ring and within bounds
        if (Math.max(Math.abs(i), Math.abs(j)) === ring &&
            x >= 0 && x < xCount && y >= 0 && y < yCount) {
          
          let colorA = color(random(colors));
          let colorB = color(random(colors));
          
          colorA.setAlpha(204);
          colorB.setAlpha(204);
          
          let rectW = (width - paddingX * 2) / xCount;
          let rectH = (height - paddingY * 2) / yCount;
          let posX = paddingX + x * rectW + offsetX;
          let posY = paddingY + y * rectH;
          
          blendMode(MULTIPLY);
          GradientRect(posX, posY, rectW, rectH, colorA, colorB);
          await sleep(100); // Slower animation
        }
      }
    }
  }
}

async function drawFrontLayer() {
  let xCount = 4;
  let yCount = 4;
  let paddingX = 20;
  let paddingY = 20;
  let centerX = Math.floor(xCount / 2);
  let centerY = Math.floor(yCount / 2);
  
  for (let ring = 0; ring <= Math.max(xCount, yCount); ring++) {
    for (let i = -ring; i <= ring; i++) {
      for (let j = -ring; j <= ring; j++) {
        let x = centerX + i;
        let y = centerY + j;
        
        if (Math.max(Math.abs(i), Math.abs(j)) === ring &&
            x >= 0 && x < xCount && y >= 0 && y < yCount) {
          
          if (random() < 0.6) {
            let colorA = color(random(colors));
            let colorB = color(random(colors));
            
            colorA.setAlpha(51);
            colorB.setAlpha(51);
            
            let rectW = (width - paddingX * 2) / xCount;
            let rectH = (height - paddingY * 2) / yCount;
            let posX = paddingX + x * rectW + offsetX;
            let posY = paddingY + y * rectH;
            
            blendMode(BLEND);
            GradientRect(posX, posY, rectW, rectH, colorA, colorB);
            await sleep(50);
          }
        }
      }
    }
  }
}

function GradientRect(_x, _y, _w, _h, _colorA, _colorB) {
  let strokeLength = 40;
  let strokeSpaceX = 12;
  let strokeSpaceY = 6;
  let noiseScaleX = 0.001;
  let noiseScaleY = 0.001;
  
  for (let y = 0; y < _h; y += strokeSpaceY) {
    let t = y / _h;
    let nowColor = NYLerpColor(_colorA, _colorB, t);
    noFill();
    stroke(nowColor);
    for (let x = 0; x < _w; x += strokeSpaceX) {
      let nowX = _x + x;
      let nowY = _y + y;
      let nowStrokeLength = random(0.3, 1.0) * strokeLength;
      let rot = noise(nowX * noiseScaleX, nowY * noiseScaleY) * 720.0;
      strokeWeight(random(3, 6));
      push();
      translate(nowX, nowY);
      rotate(radians(rot));
      line(-0.5 * nowStrokeLength, 0, 0.5 * nowStrokeLength, 0);
      pop();
    }
  }
}

function NYLerpColor(_colorA, _colorB, _t) {
  return lerpColor(_colorA, _colorB, _t);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function drawSoftWhiteOverlay() {
  blendMode(BLEND);
  noStroke();
  fill(255, 25); // White with 10% opacity
  rect(0, 0, width, height);
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    save('transport_texture.png');
  }
}
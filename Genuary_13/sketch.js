const params = {
  canvasWidth: 600,
  canvasHeight: 1200,
  speed: 0.001,
  noiseScale: 0.005,
  maxTriangleSize: 14,
  pulseSpeed: 0.05,
  pulseAmount: 0.2,
  colorShiftSpeed: 0.002,
  expansionSpeed: 1.5,
  fadeSpeed: 4  // Reduced for lighter background
}

const maxRadius = Math.sqrt(Math.pow(params.canvasWidth/2, 2) + Math.pow(params.canvasHeight/2, 2))

// Convert hex to RGB helper function
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null
}

function getColorAtIndex(index) {
  const palette = [
    '#00A5E3', // bright blue
    '#8DD7BF', // mint green
    '#FF96C5', // pink
    '#FF5768', // coral red
    '#FFBF65'  // warm yellow
  ]
  
  // Convert each hex color to RGB
  const colors = palette.map(hexToRgb)
  
  // Repeat colors to create smoother transitions
  const extendedColors = [
    ...colors,
    ...colors.slice().reverse()
  ]
  
  return extendedColors[index % extendedColors.length] || extendedColors[0]
}

function getTriangleProps(value) {
  const timeOffset = frameCount * params.colorShiftSpeed
  
  const n = 10 // number of colors (5 original * 2 for reversed)
  const interval = 1 / n
  const shiftedValue = (value + timeOffset) % 1
  const index = Math.floor(shiftedValue/interval)
  const valueInInterval = (shiftedValue - (index * interval))/interval
  const center = 0.5
  
  const pulseAmount = sin(frameCount * params.pulseSpeed) * params.pulseAmount + 1
  const triangleScale = 2 * (center - Math.abs(valueInInterval - center)) * pulseAmount
  
  return {
    r: getColorAtIndex(index)[0],
    g: getColorAtIndex(index)[1],
    b: getColorAtIndex(index)[2],
    triangleSize: params.maxTriangleSize * triangleScale
  }
}

function fadeOut() {
  // FAF8F4 converted to RGB with low alpha
  fill(250, 248, 244, params.fadeSpeed)
  noStroke()
  rect(0, 0, width, height)
}

let currentPatternSeed
let currentRadius = 0
let isGrowing = true

function setup() {
  createCanvas(params.canvasWidth, params.canvasHeight)
  background(250, 248, 244) // FAF8F4
  currentPatternSeed = random(10000)
  noiseSeed(currentPatternSeed)
}

function draw() {
  fadeOut()
  
  if (isGrowing && currentRadius < maxRadius) {
    currentRadius += params.expansionSpeed
    if (currentRadius >= maxRadius) {
      currentRadius = maxRadius
      isGrowing = false
    }
  }
  
  const nTriangles = 900
  const centerX = params.canvasWidth / 2
  const centerY = params.canvasHeight / 2
  
  for (let i = 0; i < nTriangles; i++) {
    const angle = random(TWO_PI)
    const r = random(currentRadius)
    const x = cos(angle) * r
    const y = sin(angle) * r
    
    const worldX = x + centerX
    const worldY = y + centerY
    
    const distanceToCenter = Math.hypot(x, y)
    const noiseX = x * params.noiseScale + frameCount * 0.01
    const noiseY = y * params.noiseScale + currentPatternSeed * 0.1
    const val = noise(noiseX, noiseY, frameCount * params.speed)
    
    const bloomingFactor = min(1, distanceToCenter/currentRadius)
    const triangleProps = getTriangleProps(val * bloomingFactor)
    
    const edgeFade = 1 - (distanceToCenter / currentRadius)
    fill(triangleProps.r, triangleProps.g, triangleProps.b, 255 * edgeFade)
    noStroke()
    
    const rotation = noise(noiseX * 2, noiseY * 2) * TWO_PI
    const triangleSize = triangleProps.triangleSize
    
    push()
    translate(worldX, worldY)
    rotate(rotation)
    triangle(
      0, -triangleSize/2,
      -triangleSize/2, triangleSize/2,
      triangleSize/2, triangleSize/2
    )
    pop()
  }
}

let lapse = 0
function mousePressed() {
  if (millis() - lapse > 400) {
    currentPatternSeed = random(10000)
    noiseSeed(currentPatternSeed)
    currentRadius = 0
    isGrowing = true
    background(250, 248, 244) // FAF8F4
    lapse = millis()
  }
}
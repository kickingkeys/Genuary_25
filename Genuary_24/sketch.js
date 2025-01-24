let colorScheme = [
  {
    name: "01",
    colors: ["#607274", "#faeed1", "#ded0b6", "#b2a59b", "#607274"],
  },
  {
    name: "02",
    colors: ["#637E76", "#C69774", "#F8DFD4", "#FFEFE8", "#637E76"],
  },
  {
    name: "03",
    colors: ["#6B240C", "#994D1C", "#E48F45", "#F5CCA0", "#6B240C"],
  },
  {
    name: "04",
    colors: ["#4C3D3D", "#C07F00", "#FFD95A", "#FFF7D4", "#4C3D3D"],
  },
  {
    name: "05",
    colors: ["#B5C99A", "#862B0D", "#FFF9C9", "#FFC95F", "#B5C99A"],
  },
  {
    name: "Kandinsky",
    colors: ["#8D95A6", "#0A7360", "#F28705", "#D98825", "#F2F2F2"],
  },
  {
    name: "Mono",
    colors: ["#D9D7D8", "#3B5159", "#5D848C", "#7CA2A6", "#262321"],
  },
  {
    name: "RiverSide",
    colors: ["#906FA6", "#025951", "#252625", "#D99191", "#F2F2F2"],
  },
  {
    name: "newTone1",
    colors: ["#FF9494", "#FFD1D1", "#FFE3E1", "#FFF5E4", "#001B79", "#DA0C81"],
  },
  {
    name: "newTone2",
    colors: ["#967E76", "#D7C0AE", "#EEE3CB", "#B7C4CF"],
  },
  {
    name: "newTone3",
    colors: ["#EEF1FF", "#D2DAFF", "#AAC4FF", "#B1B2FF", "#363062", "#A25772"],
  },
  {
    name: "newTone4",
    colors: ["#E38B29", "#F1A661", "#FFD8A9", "#FDEEDC", "#22092C", "#748E63"],
  },
  {
    name: "newTone5",
    colors: ["#FFC3A1", "#F0997D", "#D3756B", "#A75D5D"],
  },
  {
    name: "newTone6",
    colors: ["#374259", "#545B77", "#5C8984", "#F2D8D8"],
  },
  {
    name: "newTone7",
    colors: ["#675D50", "#ABC4AA", "#F3DEBA", "#A9907E"],
  },
  {
    name: "newTone8",
    colors: ["#F5F5F5", "#E8E2E2", "#F99417", "#5D3891"],
  },
  {
    name: "newTone9",
    colors: ["#EAE0DA", "#F7F5EB", "#A0C3D2", "#EAC7C7", "#461959", "#E966A0", "#2B2730"],
  },
  {
    name: "newTone10",
    colors: ["#EEF5FF", "#9EB8D9", "#7C93C3", "#A25772", "#164863"],
  },
  {
    name: "newTone11",
    colors: ["#82954B", "#BABD42", "#EFD345", "#FFEF82", "#004225"],
  },
  {
    name: "newTone12",
    colors: ["#146C94", "#19A7CE", "#B0DAFF", "#FEFF86"],
  },
  {
    name: "newTone13",
    colors: ["#e8e8e8", "#b7b7b7", "#525252", "#8c8c8c", "#202020"],
  },
  {
    name: "newTone14",
    colors: ["#E8F3D6", "#FCF9BE", "#FFDCA9", "#FAAB78", "#7D6E83"],
  },
  {
    name: "newTone15",
    colors: ["#DFA67B", "#F4B183", "#FFD966", "#FFF2CC", "#B46060"],
  },
  {
    name: "newTone16",
    colors: ["#403738", "#D9AA55", "#D9C2A7", "#D9501E", "#A62F14"],
  },
  {
    name: "newTone17",
    colors: ["#F2F2F2", "#6A8FA6", "#BACDD9", "#5C8C46", "#BF4F36"],
  },
  {
    name: "newTone18",
    colors: ["#4B5940", "#7A8C68", "#99A686", "#BFB7A8", "#F2F2F2"],
  },
  {
    name: "newTone19",
    colors: ["#AAABA8", "#BC7B77", "#CD9B9D", "#DBC7C9", "#88A795", "#033540"],
  },
  {
    name: "newTone20",
    colors: ["#F1EBD8", "#F1EBD8", "#F1EBD8", "#E4BA6A", "#E4BA6A", "#787D46", "#787D46", "#7D4E25", "#222B1B"],
  },
  {
    name: "newTone21",
    colors: ["#ECE9E4", "#ECE9E4", "#ECE9E4", "#E1D8D1", "#E1D8D1", "#C3B39D", "#D6AB7E", "#D18A39", "#D18A39"],
  },
  {
    name: "newTone22",
    colors: ["#dcdde2", "#dcdde2", "#b7ced2", "#b7ced2", "#a19a90", "#636250", "#636250", "#528e86"],
  },
  {
    name: "newTone23",
    colors: ["#001219", "#005f73", "#0a9396", "#94d2bd", "#e9d8a6", "#ee9b00", "#ca6702", "#bb3e03", "#ae2012", "#9b2226"],
  },
  {
    name: "newTone24",
    colors: ["#22577a", "#38a3a5", "#57cc99", "#80ed99", "#c7f9cc", "#f2f9e8", "#f9f9f9"],
  },
  {
    name: "newTone25",
    colors: ["#314A66", "#1F5C81", "#547890", "#C6DCD0", "#EDE9D5", "#F3C1A1"],
  },
  {
    name: "newTone26",
    colors: ["#434BF6", "#3234FB", "#5157D0", "#8286FF", "#B596F1", "#F87AC0", "#FBCAB1", "#FCB895", "#FCC38D", "#FDE7D7"],
  },
  {
    name: "newTone27",
    colors: ["#386641", "#6A994E", "#A7C957", "#F2E8CF", "#E6D7B2", "#3A4D3E", "#152925"],
  },
  {
    name: "newTone28",
    colors: ["#004225", "#F5F5DC", "#FFB000", "#FFCF9D"],
  }
];


let currentColors;
let spiralAngle = 0;
let spiralRadius = 0;
let coverage = 0;
let totalArea;
let baseGrowthSpeed = 0.08;

function setup() {
  createCanvas(400, 800);
  pixelDensity(2);
  currentColors = random(colorScheme).colors;
  background('#FAF8F4');
  totalArea = width * height;
}

function draw() {
  translate(width/2, height/2);
  
  // Calculate acceleration based on current radius
  let acceleration = 1 + (spiralRadius / max(width, height));
  let currentGrowthSpeed = baseGrowthSpeed * acceleration;
  
  for (let i = 0; i < 3; i++) {
    let x = cos(spiralAngle) * spiralRadius;
    let y = sin(spiralAngle) * spiralRadius;
    
    drawTexturedSegment(x, y, spiralAngle);
    
    spiralAngle += 0.1;
    spiralRadius += currentGrowthSpeed;
    
    // Check if spiral reaches canvas edges
    let maxRadius = sqrt(pow(width/2, 2) + pow(height/2, 2));
    
    if (spiralRadius >= maxRadius) {
      spiralRadius = 0;
      coverage = 0;
      currentColors = random(colorScheme).colors;
    }
  }
}

function drawTexturedSegment(x, y, angle) {
  let segmentSize = 25;
  let colorA = color(random(currentColors));
  let colorB = color(random(currentColors));
  
  colorA.setAlpha(30);
  colorB.setAlpha(30);
  
  push();
  translate(x, y);
  rotate(angle);
  
  for (let i = 0; i < 15; i++) {
    let t = i / 15;
    let currentColor = lerpColor(colorA, colorB, t);
    stroke(currentColor);
    
    for (let offset = -segmentSize/2; offset < segmentSize/2; offset += 1) {
      strokeWeight(random(0.2, 0.5));
      
      let x1 = -segmentSize/2 + random(-1, 1);
      let x2 = segmentSize/2 + random(-1, 1);
      let y1 = offset + random(-0.5, 0.5);
      let y2 = offset + random(-0.5, 0.5);
      
      for (let j = 0; j < 2; j++) {
        line(x1, y1, x2, y2);
      }
    }
  }
  
  blendMode(SCREEN);
  stroke(255, 5);
  for (let i = 0; i < 10; i++) {
    let x1 = random(-segmentSize/2, segmentSize/2);
    let x2 = x1 + random(5, 15);
    let y = random(-segmentSize/2, segmentSize/2);
    strokeWeight(random(0.1, 0.3));
    line(x1, y, x2, y);
  }
  
  pop();
}

function mousePressed() {
  currentColors = random(colorScheme).colors;
  spiralAngle = 0;
  spiralRadius = 0;
  coverage = 0;
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('SpiralPattern', 'png');
  }
}
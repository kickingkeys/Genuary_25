let capture;
let lineSpacing = 10;
let threshold = 127;
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;
const colors = [
  "#F2385A", "#F5A503", "#E9F1DF", "#4AD9D9", "#36B1BF",
  "#E3B8B5", "#FFD872", "#E1D0B3", "#BFD9B5", "#A8D9D3",
  "#D9AC8E", "#F2C2B8", "#F2B5D4", "#94E2F2", "#52B9D3",
  "#6C49B8", "#8E3D87", "#D3B0B0", "#D9C589", "#8FD3B5"
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.size(windowWidth, windowHeight);
  capture.hide();
  
  let startButton = createButton('Start Recording');
  startButton.position(10, height - 40);
  startButton.mousePressed(startRecording);
  
  let stopButton = createButton('Stop Recording');
  stopButton.position(130, height - 40);
  stopButton.mousePressed(stopRecording);
  
  strokeWeight(2);
  background(255);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  capture.size(windowWidth, windowHeight);
}

function startRecording() {
  recordedChunks = [];
  const stream = document.querySelector('canvas').captureStream(30);
  mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9'
  });
  
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };
  
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, {
      type: 'video/webm'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'sketch-recording.webm';
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  mediaRecorder.start();
  isRecording = true;
}

function stopRecording() {
  mediaRecorder.stop();
  isRecording = false;
}

function draw() {
  background(255, 20);
  
  push();
  translate(width, 0);
  scale(-1, 1);
  
  capture.loadPixels();
  
  // Vertical lines
  for (let x = 0; x < width; x += lineSpacing) {
    let prevY = 0;
    for (let y = 0; y < height; y += 5) {
      let index = (y * width + x) * 4;
      let brightness = (capture.pixels[index] + capture.pixels[index + 1] + capture.pixels[index + 2]) / 3;
      
      if (brightness < threshold) {
        let colorIndex = floor(map(brightness, 0, threshold, 0, colors.length));
        stroke(colors[colorIndex]);
        line(x, prevY, x, y);
      }
      prevY = y;
    }
  }
  
  // Horizontal lines
  for (let y = 0; y < height; y += lineSpacing) {
    let prevX = 0;
    for (let x = 0; x < width; x += 5) {
      let index = (y * width + x) * 4;
      let brightness = (capture.pixels[index] + capture.pixels[index + 1] + capture.pixels[index + 2]) / 3;
      
      if (brightness < threshold) {
        let colorIndex = floor(map(x + y, 0, width + height, 0, colors.length));
        stroke(colors[colorIndex]);
        line(prevX, y, x, y);
      }
      prevX = x;
    }
  }
  
  pop();
}

function mousePressed() {
  colors.sort(() => random(-1, 1));
}
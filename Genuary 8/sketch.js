//////////////////////////////////////////////////
// CANVAS SIZE and Resize Function (NOT IMPORTANT)
const C = {
    loaded: false,
    prop() {return this.height/this.width},
    isLandscape() {return window.innerHeight <= window.innerWidth * this.prop()},
    resize () {
        if (this.isLandscape()) {
            document.getElementById(this.css).style.height = "100%";
            document.getElementById(this.css).style.removeProperty('width');
        } else {
            document.getElementById(this.css).style.removeProperty('height');
            document.getElementById(this.css).style.width = "100%";
        }
    },
    setSize(w,h,p,css) {
        this.width = w, this.height = h, this.pD = p, this.css = css;
    },
    createCanvas() {
        this.main = createCanvas(this.width,this.height,WEBGL), pixelDensity(this.pD), this.main.id(this.css), this.resize();
    }
};
C.setSize(250,250,5,'mainCanvas')

function windowResized () {
    C.resize();
}


//////////////////////////////////////////////////
// Sketch
let palette = ["#002185", "#fcd300", "#ff2702", "#6b9404", "#000000"]
let x_values = [], y_values = [], active_states = [];

function setup () {
    C.createCanvas()
    for (let j = 0; j < 2; j++) {
        x_values[j] = []
        y_values[j] = []
        active_states[j] = []
        for (let i = 0; i < 5; i++) {
            x_values[j][i] = random(width)
            y_values[j][i] = random(width)
            active_states[j][i] = false;
        }
    }
}

function draw() {

    background("#e2e7dc")
    translate(-width/2,-height/2)
    strokeWeight(3)

    for (let j = 0; j < x_values.length; j++) {
        brush.fill(palette[j],70)
        brush.bleed(0.2)
        brush.beginShape(0)
        for (let i = 0; i < x_values[j].length; i++) {
            stroke(palette[i%palette.length])
            point(x_values[j][i],y_values[j][i])
            brush.vertex(x_values[j][i],y_values[j][i])
        }
        randomSeed(12133)
        brush.endShape(CLOSE)
    }

    noLoop()
}


function mousePressed() {
    for (let j = 0; j < x_values.length; j++) {
        for (let i = 0; i < x_values[j].length; i++) {
            if (dist(mouseX,mouseY, x_values[j][i],y_values[j][i]) <= 10) {
               active_states[j][i] = true;
            }
        } 
    }
}

function mouseDragged() {
    loop()
    frameRate(10)
    for (let j = 0; j < x_values.length; j++) {
        for (let i = 0; i < x_values[j].length; i++) {
            if (active_states[j][i] == true) {
                x_values[j][i] = mouseX
                y_values[j][i] = mouseY
            }
        }
    }
}

function mouseReleased() {
    for (let j = 0; j < x_values.length; j++) {
        for (let i = 0; i < x_values[j].length; i++) {
            if (dist(mouseX,mouseY, x_values[j][i],y_values[j][i]) <= 10) {
            active_states[j][i] = false;
            }
        } 
    } 
}
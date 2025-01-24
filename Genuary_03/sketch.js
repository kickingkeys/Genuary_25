let drops = [];
let colors = {
  uk: ["#577455", "#8C3F4D", "#6B8E9B"],
  ny: ["#EE8838", "#F4F2EF", "#6B8E9B"]
};
function setup() {
  createCanvas(400, 800);
  for (let i = 0; i < 200; i++) {
    drops.push(createDrop());
  }
}
function draw() {
  background(34, 34, 34, 25);
  for (let drop of drops) {
    fall(drop);
    show(drop);
  }
}
function createDrop() {
  let drop = {x: random(width)};
  drop.y = random(-500, -50);
  drop.z = random(0, 20);
  drop.len = map(drop.z, 0, 20, 10, 20);
  drop.yspeed = map(drop.z, 0, 20, 1, 20);
  drop.type = random() > 0.5 ? "uk" : "ny";
  drop.color = color(random(colors[drop.type]));
  return drop;
}
function fall(drop) {
  drop.y += drop.yspeed;
  let grav = map(drop.z, 0, 20, 0, 0.2);
  drop.yspeed += grav;
  if (drop.y > height) {
    drop.y = random(-200, -100);
    drop.yspeed = map(drop.z, 0, 20, 4, 10);
  }
}
function show(drop) {
  strokeWeight(map(drop.z, 0, 20, 1, 3));
  stroke(drop.color);
  line(drop.x, drop.y, drop.x, drop.y + drop.len);
}
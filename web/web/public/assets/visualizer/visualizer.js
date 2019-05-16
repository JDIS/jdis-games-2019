// Adapted from captureGraphicsDisplay.py for pacman graphics in js
var DEFAULT_GRID_SIZE = 30.0
var GRID_SIZE = DEFAULT_GRID_SIZE;
var INFO_PANE_HEIGHT = 35
var BACKGROUND_COLOR = [0,0,0]
var WALL_COLOR = [0.0/255.0, 51.0/255.0, 255.0/255.0]
var INFO_PANE_COLOR = [.4,.4,0]
var SCORE_COLOR = [.9, .9, .9]
var PACMAN_OUTLINE_WIDTH = 2
var PACMAN_CAPTURE_OUTLINE_WIDTH = 4

var GHOST_COLORS = [
    [.9,0,0], // Red
    [0,.3,.9], // Blue
    [.98,.41,.07], // Orange
    [.1,.75,.7], // Green
    [1.0,0.6,0.0], // Yellow
    [.4,0.13,0.91], // Purple
]

var TEAM_COLORS = [GHOST_COLORS[0], GHOST_COLORS[1]];

var GHOST_SHAPE = [
    [ 0,    0.3 ],
    [ 0.25, 0.75 ],
    [ 0.5,  0.3 ],
    [ 0.75, 0.75 ],
    [ 0.75, -0.5 ],
    [ 0.5,  -0.75 ],
    [-0.5,  -0.75 ],
    [-0.75, -0.5 ],
    [-0.75, 0.75 ],
    [-0.5,  0.3 ],
    [-0.25, 0.75 ]
];

var GHOST_SIZE = 0.65;
var SCARED_COLOR = [1, 1, 1];

var PACMAN_COLOR = [1.0, 1.0, 61/255]
var PACMAN_SCALE = 0.5;
var FOOD_COLOR = [1, 1, 1];

var FOOD_SIZE = 0.1;
var LASER_COLOR = [1, 0, 0];
var LASER_SIZE = 0.02;

var CAPSULE_COLOR = [1, 0, 0];
var CAPSULE_SIZE = 0.25;

var WALL_RADIUS = 0.15; 

function toRGBAString(colorArray) {
    return `rgba(${colorArray.map(d=>Math.round(d*255)).join(',')}, 1)`
}

function showGame({history, redTeamName, blueTeamName, scores}) {
    const canvas = document.getElementById("pacman-game-visualizer");
    const ctx = canvas.getContext("2d");

    // Timer at the bottom of the screen
    const timerSize = 6;
    const timerOffset = 6;

    // Update canvas' size
    const width = history[0][0].length;
    const height = history[0].length;
    ctx.canvas.width = width * GRID_SIZE;
    ctx.canvas.height = height * GRID_SIZE + GRID_SIZE + timerSize + timerOffset;

    // Scale up to GRID_SIZE
    ctx.scale(GRID_SIZE, GRID_SIZE);
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    // Setup text
    ctx.font = "1px Arial";

    // Add team names
    const centerText = " vs ";
    const centerTextWidth = ctx.measureText(centerText).width;
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "center";
    ctx.fillText(centerText, width/2, height+1);

    //TODO: Fix ~possible~ probable team name overflow w/ ellipsis or font size
    ctx.fillStyle = "red";
    ctx.textAlign = "right";
    ctx.fillText(redTeamName, (width-centerTextWidth)/2, height+1);

    ctx.fillStyle = "blue";
    ctx.textAlign = "left";
    ctx.fillText(blueTeamName, (width+centerTextWidth)/2, height+1);

    // Display walls (constant)
    // TODO: Neon styling like the original python game ?
    for (let i in history[0]) {
        for (let j in history[0][i]) {
            let x = parseInt(j); let y = parseInt(i);
            let px = history[0][i][j];
            if (px == '%') {
                ctx.fillStyle = toRGBAString(2*x < width ? TEAM_COLORS[0] : TEAM_COLORS[1]);
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    let lastScoreWidth = 0;
    let lastTimeWidth = 0;
    const processFrame = (index) => {
        // Print score
        let score = scores[index];
        ctx.clearRect(0, height, lastScoreWidth, 1);
        lastScoreWidth = ctx.measureText(score).width;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "left";
        ctx.fillText(score, 0, height + 1);
        
        // Print time
        let time = `Time: ${history.length - index - 1}`;
        ctx.clearRect(width-lastTimeWidth, height, lastTimeWidth, 1);
        lastTimeWidth = ctx.measureText(time).width;
        ctx.textAlign = "right";
        ctx.fillText(time, width, height+1);

        // Bar graph of time
        ctx.clearRect(0, height+1, width, (timerSize + timerOffset) / GRID_SIZE);
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(0, height+1+(timerOffset/GRID_SIZE), width * (index + 1) / history.length, (timerSize) / GRID_SIZE);
        
        // Print game
        let game = history[index];
        for (let i in game) {
            for (let j in game[i]) {
                let x = parseInt(j); let y = parseInt(i);
                let px = game[i][j];
                if (px == '%') { // Skip walls
                    continue;
                }
                ctx.clearRect(x, y, 1, 1);
                let ghostPxs = ['M', 'W', 'G', 'E'];
                if (~ghostPxs.indexOf(px.toUpperCase())) { // Ghost
                    // Ghost shape -- see graphicsDisplay.py:drawGhost
                    let isScared = px.toLowerCase() == px; // Lower case if scared
                    ctx.fillStyle = toRGBAString(isScared ? SCARED_COLOR : GHOST_COLORS[0]); // TODO: Ghost color index
                    ctx.beginPath();
                    ctx.moveTo(GHOST_SHAPE[0] + x, GHOST_SHAPE[1] + y);
                    for (let s of GHOST_SHAPE) {
                        ctx.lineTo(GHOST_SIZE*s[0] + x + 0.5, GHOST_SIZE*s[1] + y + 0.5);
                    }
                    ctx.closePath();
                    ctx.fill();

                    // Eyes
                    let dx = 0, dy = 0;
                    px = px.toUpperCase();
                    if (px == 'M') // North
                        dy += .2;
                    else if (px == 'W') //South
                        dy -= .2;
                    else if (px == 'E') //East
                        dx += .2;
                    else if (px == 'G') //West
                        dx -= .2;

                    ctx.fillStyle = '#FFF';
                    ctx.beginPath();
                    ctx.arc(x + 0.5 + GHOST_SIZE*(-0.3 + dx / 1.5) , y + GHOST_SIZE*(0.3-dy/1.5), GHOST_SIZE * 0.2, 0, 2 * Math.PI); // left
                    ctx.arc(x + 0.5 + GHOST_SIZE*(0.3 + dx / 1.5) , y + GHOST_SIZE*(0.3-dy/1.5), GHOST_SIZE * 0.2, 0, 2 * Math.PI); //right
                    ctx.fill();
                    ctx.fillStyle = '#000';
                    ctx.beginPath();
                    ctx.arc(x + 0.5 + GHOST_SIZE*(-0.3+dx), y + GHOST_SIZE * (0.3-dy), GHOST_SIZE*0.08, 0, 2*Math.PI) // left pupil
                    ctx.arc(x + 0.5 + GHOST_SIZE*(0.3+dx), y + GHOST_SIZE * (0.3-dy), GHOST_SIZE*0.08, 0, 2*Math.PI) // right pupil
                    ctx.fill();
                } else if (px == '>' || px == '<' || px == 'v' || px == "^") { // Pacman
                    // Yellow cirle
                    ctx.beginPath();
                    ctx.arc(x + 0.5, y + 0.5, 0.5, 0, 2 * Math.PI);
                    ctx.fillStyle = "yellow";
                    ctx.fill();
                    if ((x+y) % 2 == 0) {
                        continue; // Eating animation
                    }
                    // Draw mouth
                    ctx.beginPath();
                    switch(px) {
                        case ">":
                            ctx.moveTo(x, y+.2);
                            ctx.lineTo(x+.5, y+.5);
                            ctx.lineTo(x, y+.8);
                            break;
                        case "<":
                            ctx.moveTo(x+1, y+.2);
                            ctx.lineTo(x+.5, y+.5);
                            ctx.lineTo(x+1, y+.8);
                            break;
                        case "^":
                            ctx.moveTo(x+.2, y+1);
                            ctx.lineTo(x+.5, y+.5);
                            ctx.lineTo(x+.8, y+1);
                            break;
                        case "v":
                            ctx.moveTo(x+.2, y);
                            ctx.lineTo(x+.5, y+.5);
                            ctx.lineTo(x+.8, y);
                            break;
                    }
                    ctx.closePath();
                    ctx.fillStyle = "#1a1a1a";
                    ctx.fill();
                    
                } else if (px == '.') { // Food
                    ctx.beginPath();
                    ctx.arc(x + 0.5, y + 0.5, 0.1, 0, 2 * Math.PI);
                    ctx.fillStyle = toRGBAString(2*x < width ? TEAM_COLORS[0] : TEAM_COLORS[1]);
                    ctx.fill();
                } else if (px == 'o') { // Capsule
                    ctx.beginPath();
                    ctx.arc(x + 0.5, y + 0.5, 0.3, 0, 2 * Math.PI);
                    ctx.fillStyle = "white";
                    ctx.fill();
                }
            }
        }
    }

    let currentFrame = 0;
    let stopTime = 5000;
    let lastFrameTime = 0;
    
    // Main loop
    const loop = () => {
        requestAnimationFrame(loop);
        let t = Date.now();
        let timePerFrame = +$("#pacman_speed").val();
        if (lastFrameTime + timePerFrame <= t) {
            lastFrameTime = t;
            processFrame(currentFrame);
            ++currentFrame;
            if (currentFrame >= history.length) {
                lastFrameTime = t + stopTime;
                currentFrame = 0;
            }
        }
    }
    loop();

    return;
}

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

    // Update canvas' size
    const width = history[0][0].length;
    const height = history[0].length;
    ctx.canvas.width = width * GRID_SIZE;
    ctx.canvas.height = height * GRID_SIZE + GRID_SIZE;
    // Scale up to GRID_SIZE
    ctx.scale(GRID_SIZE, GRID_SIZE);
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    // Add team names
    ctx.font = "1px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "right";
    ctx.fillText(redTeamName, width/2, height+1);

    ctx.font = "1px Arial";
    ctx.fillStyle = "blue";
    ctx.textAlign = "left";
    ctx.fillText(blueTeamName, width/2, height+1);

    // Display walls (constant)
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

    const clearSquare = (x, y) => {
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(x, y, 1, 1);
    }

    let index = 0;
    // Play history
    const interval = setInterval(() => {
        let game = history[index];
        for (let i in game) {
            for (let j in game[i]) {
                let x = parseInt(j); let y = parseInt(i);
                let px = game[i][j];
                if (px == '%') { // Skip walls
                    continue;
                }
                clearSquare(x, y);
                if (px == 'G') { // Ghost
                    ctx.fillStyle = '#FFFFFF';
                    ctx.beginPath();
                    ctx.moveTo(GHOST_SHAPE[0] + x, GHOST_SHAPE[1] + y);
                    for (let s of GHOST_SHAPE) {
                        ctx.lineTo(GHOST_SIZE*s[0] + x + 0.5, GHOST_SIZE*s[1] + y + 0.5);
                    }
                    ctx.closePath();
                    ctx.fill();
                    
                } else if (px == '>' || px == '<' || px == 'v' || px == "^") { // Pacman
                    w = 30
                    delta = w/2
                    ctx.beginPath();
                    ctx.arc(x + 0.5, y + 0.5, 0.5, 0, 2 * Math.PI);
                    ctx.fillStyle = "yellow";
                    ctx.fill();
                    //ctx.globalCompositeOperation = 'source-in';
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
                    //ctx.stroke();
                    //ctx.globalCompositeOperation = 'source-over';
                    
                } else if (px == '.') { // Food
                    ctx.beginPath();
                    ctx.arc(x + 0.5, y + 0.5, 0.1, 0, 2 * Math.PI);
                    ctx.fillStyle = toRGBAString(2*x < width ? TEAM_COLORS[0] : TEAM_COLORS[1]);
                    ctx.fill();
                } else if (px == 'o') { // Capsule
                    ctx.beginPath();
                    ctx.arc(x + 0.5, y + 0.5, 0.5, 0, 2 * Math.PI);
                    ctx.fillStyle = "white";
                    ctx.fill();
                }
            }
        }

        ++index;
        if (index >= history.length) {
            clearInterval(interval);
        }
    }, 250);
    return;
}

function textFromURL(replayName, $container, callback) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", "https://s3.amazonaws.com/halitereplaybucket/"+replayName, true);
    oReq.onload = function (oEvent) {
        if (oReq.status != 404) {
            callback(textToGame(oReq.response, replayName));
        } else {
            $container.html("<h1>Gamefile not found</h1><p>The gamefile titled \""+replayName+"\" could not be found. If this problem persists, post of the forums or email us at halite@halite.io.</h1>");
        }
    }
    oReq.send(null);
}

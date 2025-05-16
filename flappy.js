//setting up parameters for the board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //bird size= width:height ratio = 408:228 = 17:12 pixels
let birdHeight = 24;
let birdX = boardWidth/8; //starting position of bird
let birdY = boardHeight/2;

//let birdImg; setting up animation here
let birdImgs = [];
let birdImgsIndex = 0;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//generating pipes : width to height ratio = 384/3072 = 1/8 pixels
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//game physics(movement, collision)
let velocityX = -3.5; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.5;

let gameOver = false;
let score = 0;

//all the sounds
let wingSound = new Audio("./sfx_swooshing.wav");
let hitSound = new Audio("./FlappyHit.mp3");
let backgroundMusic = new Audio("./RetroMusic.mp3");
backgroundMusic.loop = true; 
let fallSound = new Audio("./FlappyDie.mp3")
let PointGain = new Audio("./PointGain.mp3")

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // for drawing on board

    // draw flappybird, and loading image
    //birdImg = new Image();
    //birdImg.src = "./flappybird.png";
    //birdImg.onload = function() {
    //    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    //}
    for (let i = 0; i < 4; i++) {
        let birdImg = new Image();
        birdImg.src = `./flappybird${i}.png`;
        birdImgs.push(birdImg);
    }

    //draws the pipes
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";
    
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    //onloads the looping of frames
    requestAnimationFrame(update);
    setInterval(placePipes, 1500);//every 1.5 seconds the pipes are replaced
    setInterval(animateBird, 100); // animates bird every 1/10th seconds
    document.addEventListener("keydown", moveBird);
}

//creating game background loop for bird and pipes:
function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return; 
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird physics
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);//applys jump, but setting roof
    context.drawImage(birdImgs[birdImgsIndex], bird.x, bird.y, bird.width, bird.height);



    if (bird.y > board.height) {
        gameOver = true;
        fallSound.play();
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 so it adds 1pt for each set of pipes
            pipe.passed = true;

            PointGain.play();
        }

        if (detectCollision(bird, pipe)) {
            hitSound.play();
            gameOver = true;
        }
    }

    //clearing pipes so no running issues
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from array
    }

    //drawing score counter
    context.fillStyle = "yellow";
    context.font="45px times new roman";
    context.fillText(score, 315, 635);

    if (gameOver) {
        context.fillText("YOU LOSE", 5, 635);
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
}

function animateBird() {
    birdImgsIndex++; //increments the frames
    birdImgsIndex %= birdImgs.length; //circles the frame back with max frames 4
}

function placePipes() {
    if (gameOver) {
        return;
    }
    // Math.random returns value between 0 and 1
    // if 0: this is -128(pipeheight/4) pixels to pipe height
    // if 1: this is -384(pipeheight/4 - pipeheight/2) pixels to pipe height
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4; 

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code = "space" || e.code == "ArrowUp") {

        if (backgroundMusic.paused) {
            backgroundMusic.play(); // plays background music
        }

        wingSound.play(); //plays jump sound

        //allows for bird to jump: tech
        velocityY = -6;
        
        //resetting game after loss: resets all data to default
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

//collision detection and game failure
function detectCollision(a,b) {
    return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}
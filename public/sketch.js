let socket = io();
let iControl;
let food;
let snake1;
let snake2;

function setup() {
  noLoop();

  socket.on('game started', game => {
    snake1 = game.snake1;
    snake2 = game.snake2;
    food = game.food;
    createCanvas(600, 600);
    loop();
  });
  socket.on('snakes_moved', game => {
    snake1 = game.snake1;
    snake2 = game.snake2;
    food = game.food;
  });

  socket.on('game_ended', winner => {
    console.log(`${winner} wins`);
    noLoop();
  });
}

function draw() {
  background(220);

  if (food && snake1 && snake2) {
    drawSnakes();
    drawFood();
  }
}

function drawFood() {
  noStroke();
  fill('black');
  rect(food.x * 15, food.y * 15, 15, 15);
}

function drawSnakes() {
  [snake1, snake2].forEach(snake => {
    const { positions, color } = snake;
    noFill();
    stroke(color);
    positions.forEach(({ x, y }) => {
      rect(x * 15, y * 15, 15, 15);
    });
  });
}

function keyPressed() {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'ArrowDown':
      socket.emit('snakedirchanged', {
        roomId: window.roomId,
        direction: key,
        name: window.myname
      });
      break;
    default:
      break;
  }
}

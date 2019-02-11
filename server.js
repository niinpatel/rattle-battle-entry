const express = require('express');

const port = process.env.PORT || 3000;

const app = express();
const socket = require('socket.io');
const Game = require('./Game');

const server = app.listen(port, err => {
  if (err) throw err;
  console.log('Listening on port ' + port);
});

const findGame = roomId => games_running.find(game => game.roomId === roomId);

const io = socket(server);

let games_running = [];
let game_intervals = {};

io.sockets.on('connection', socket => {
  console.log(`new connection ${socket.id}`);

  socket.on('set_name', name => {
    if (!name) {
      socket.emit('fail', 'Please enter a valid name');
    } else {
      socket.name = name;
      socket.emit('success', 'name has been set');
    }
  });

  socket.on('create_game', () => {
    if (!socket.name) {
      socket.emit('fail', 'please enter your name first');
    } else if (socket.current_room) {
      socket.emit('fail', 'you have already created a room');
    } else {
      const game = new Game(socket.name);
      games_running.push(game);
      socket.join(game.roomId);
      socket.current_room = game.roomId;
      io.sockets.emit('games_running', games_running);
      socket.emit('game_created', game);
    }
  });

  socket.on('join_game', roomId => {
    const game = findGame(roomId);
    if (!socket.name) {
      socket.emit('fail', 'please enter your name first');
    } else if (!game) {
      socket.emit('fail', 'game was not found');
    } else {
      socket.join(roomId);
      socket.current_room = roomId;

      game.joinGame(socket.name);
      socket.emit('game_joined', game);
      io.to(roomId).emit('game started', game);

      game_intervals[game.roomId] = setInterval(() => {
        if (!game.winner) {
          if (game.running) {
            game.moveSnakes();
            io.to(game.roomId).emit('snakes_moved', game);
          }
        } else {
          clearInterval(game_intervals[game.roomId]);
          io.to(game.roomId).emit('game_ended', game.winner);
        }
      }, 200);
      io.sockets.emit('games_running', games_running);
    }
  });

  socket.on('check_games_running', () => {
    socket.emit('games_running', games_running);
  });

  socket.on('snakedirchanged', data => {
    const { roomId, direction, name } = data;
    const game = findGame(roomId);

    const snakeToMove = game.snake1.name === name ? game.snake1 : game.snake2;

    let dirx, diry;

    switch (direction) {
      case 'ArrowRight':
        dirx = 1;
        diry = 0;
        snakeToMove.dir.x = dirx;
        snakeToMove.dir.y = diry;
        break;

      case 'ArrowLeft':
        dirx = -1;
        diry = 0;
        snakeToMove.dir.x = dirx;
        snakeToMove.dir.y = diry;
        break;

      case 'ArrowUp':
        dirx = 0;
        diry = -1;
        snakeToMove.dir.x = dirx;
        snakeToMove.dir.y = diry;
        break;

      case 'ArrowDown':
        dirx = 0;
        diry = 1;
        snakeToMove.dir.x = dirx;
        snakeToMove.dir.y = diry;
        break;
    }
  });
});

app.use(express.static('public'));

const express = require('express');

const port = process.env.PORT || 3000;

const app = express();
const socket = require('socket.io');
const Game = require('./Game');

const server = app.listen(port, err => {
  if (err) throw err;
  console.log('Listening on port ' + port);
});

const io = socket(server);

const getCurrentlyJoinableGames = games_running => {
  return Object.values(games_running).filter(game => game.freeToJoin);
};

let games_running = {};
let game_intervals = {};

io.sockets.on('connection', socket => {
  console.log(`new connection ${socket.id}`);

  socket.on('set_name', name => {
    if (!name) {
      socket.emit('fail', 'Please enter a valid name');
    } else {
      socket.name = name;
      socket.emit('name_recevied', name);
    }
  });

  socket.on('create_game', () => {
    if (!socket.name) {
      socket.emit('fail', 'please enter your name first');
    } else if (socket.current_room) {
      socket.emit('fail', 'you have already created a room');
    } else {
      const game = new Game(socket.name);
      games_running[game.roomId] = game;
      socket.join(game.roomId);
      socket.current_room = game.roomId;
      socket.broadcast.emit(
        'games_running',
        getCurrentlyJoinableGames(games_running)
      );
      socket.emit('game_created', game);
    }
  });

  socket.on('join_game', roomId => {
    if (!socket.name) {
      socket.emit('fail', 'please enter your name first');
      return;
    }

    if (socket.current_room) {
      const alreadyStartedGame = games_running[socket.current_room];
      alreadyStartedGame.freeToJoin = false;
      alreadyStartedGame.ended = true;
      delete games_running[socket.current_room];
      socket.broadcast.emit(
        'games_running',
        getCurrentlyJoinableGames(games_running)
      );
    }

    const game = games_running[roomId];
    if (!game) {
      socket.emit('fail', 'game was not found');
    } else if (socket.name === game.snake1.name) {
      socket.emit('fail', "both players' names must be unique");
    } else {
      socket.join(roomId);
      socket.current_room = roomId;

      game.joinGame(socket.name);
      socket.emit('game_joined', game);
      io.to(roomId).emit('game started', game);

      game_intervals[game.roomId] = setInterval(() => {
        if (!game.ended) {
          game.moveSnakes();
          io.to(game.roomId).emit('snakes_moved', game);
        } else {
          clearInterval(game_intervals[game.roomId]);
          delete game_intervals[game.roomId];
          delete games_running[game.roomId];
          io.to(game.roomId).emit('game_ended', game.winner);
          socket.broadcast.emit(
            'games_running',
            getCurrentlyJoinableGames(games_running)
          );
        }
      }, 200);
      socket.broadcast.emit(
        'games_running',
        getCurrentlyJoinableGames(games_running)
      );
    }
  });

  socket.on('check_games_running', () => {
    socket.broadcast.emit(
      'games_running',
      getCurrentlyJoinableGames(games_running)
    );
  });

  socket.on('disconnect', () => {
    const game = games_running[socket.current_room];
    if (game && !game.ended) {
      io.to(socket.current_room).emit('player_left', socket.name);
      if (game.freeToJoin) {
        game.freeToJoin = false;
        delete games_running[socket.current_room];
        socket.broadcast.emit(
          'games_running',
          getCurrentlyJoinableGames(games_running)
        );
      } else {
        game.winner =
          socket.name === game.snake1.name
            ? game.snake2.name
            : game.snake1.name;
      }
      game.ended = true;
    }
  });

  socket.on('snakedirchanged', data => {
    const { roomId, direction, name } = data;
    const game = games_running[roomId];

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

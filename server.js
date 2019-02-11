const express = require('express');

const port = process.env.PORT || 3000;

const app = express();
const socket = require('socket.io');

const server = app.listen(port, err => {
  if (err) throw err;
  console.log('Listening on port ' + port);
});

function makeFood() {
  const x = Math.floor(Math.random() * 40);
  const y = Math.floor(Math.random() * 40);
  return {
    x,
    y
  };
}

const io = socket(server);

let games_running = [];

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
      const roomId = (Math.random() * 100000000000).toFixed(0);
      const game = { roomId, freeToJoin: true };
      games_running.push(game);
      socket.join(roomId);
      socket.current_room = roomId;
      io.sockets.emit('games_running', games_running);
      socket.emit('game_created', game);
    }
  });

  socket.on('join_game', roomId => {
    const game = games_running.find(game => game.roomId === roomId);
    if (!socket.name) {
      socket.emit('fail', 'please enter your name first');
    } else if (!game) {
      socket.emit('fail', 'game was not found');
    } else {
      socket.join(roomId);
      socket.current_room = roomId;
      games_running = games_running.map(game => {
        if (game.roomId === roomId) {
          return { roomId, freeToJoin: false };
        }
        return game;
      });

      socket.emit('game_joined', game);
      io.to(roomId).emit('game started', makeFood());
      io.sockets.emit('games_running', games_running);
    }
  });

  socket.on('check_games_running', () => {
    socket.emit('games_running', games_running);
  });
});

app.use(express.static('public'));

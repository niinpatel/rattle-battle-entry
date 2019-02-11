let socket = io();

const startBtn = document.getElementById('start');
const joinBtn = document.getElementById('join');
const nameInpt = document.getElementById('name');
const submitBtn = document.getElementById('submit');
const mygame = document.getElementById('mygame');
const allgameslist = document.getElementById('allgames');
const gameIdInpt = document.getElementById('gameid');

socket.on('fail', message => alert(`Fail: ${message}`));
socket.on('success', message => alert(`Success: ${message}`));

socket.emit('check_games_running');
socket.on('games_running', updateGamesList);
socket.on('game_created', gameJoinedOrStarted);
socket.on('game_joined', gameJoinedOrStarted);

socket.on('game started', food => {
  console.log('game has started! here eat these co-ordinates', food);
});

submitBtn.addEventListener('click', () => {
  socket.emit('set_name', nameInpt.value);
});

startBtn.addEventListener('click', () => {
  socket.emit('create_game');
});

joinBtn.addEventListener('click', () => {
  socket.emit('join_game', gameIdInpt.value);
});

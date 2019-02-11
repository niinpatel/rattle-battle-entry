const startBtn = document.getElementById('start');
const joinBtn = document.getElementById('join');
const nameInpt = document.getElementById('name');
const submitBtn = document.getElementById('submit');
const mygame = document.getElementById('mygame');
const allgameslist = document.getElementById('allgames');
const gameIdInpt = document.getElementById('gameid');
const main = document.getElementById('main');
const nameDiv = document.getElementById('namediv');

if (localStorage.getItem('name')) {
  socket.emit('set_name', localStorage.getItem('name'));
}

socket.on('fail', message => alert(`Fail: ${message}`));
socket.on('name_recevied', setNameOnGlobal);

socket.emit('check_games_running');
socket.on('games_running', updateGamesList);
socket.on('game_created', gameJoinedOrCreated);
socket.on('game_joined', gameJoinedOrCreated);

socket.on('game started', data => {
  console.log('game has started!');
  main.style.display = 'none';
});

submitBtn.addEventListener('click', () => {
  const name = nameInpt.value;
  localStorage.setItem('name', name);
  socket.emit('set_name', name);
});

startBtn.addEventListener('click', () => {
  socket.emit('create_game');
});

joinBtn.addEventListener('click', () => {
  socket.emit('join_game', gameIdInpt.value);
});

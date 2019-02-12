const updateGamesList = games => {
  console.log(games);
  allgameslist.innerText = '';
  if (games.length === 0) {
    mygame.innerText = 'There are no games to play. Start a new game?';
  }
  games.forEach(game => {
    if (game.freeToJoin) {
      const item = document.createElement('li');
      item.innerText = `${
        game.snake1.name
      } is waiting for player to join. Game id: ${game.roomId}`;
      allgameslist.appendChild(item);
    }
  });
};

const gameJoinedOrCreated = game => {
  mygame.innerText = `Your room id is - ${game.roomId}`;
  window.roomId = game.roomId;
};

const setNameOnGlobal = name => {
  window.myname = name;
  nameDiv.innerHTML = `Hi, ${window.myname}!`;
};

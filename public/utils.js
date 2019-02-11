const updateGamesList = games => {
  allgameslist.innerText = '';
  if (games.length === 0) {
    mygame.innerText = 'There are no games to play. Start a new game?';
  }
  games.forEach(game => {
    if (game.freeToJoin) {
      const item = document.createElement('li');
      item.innerText = `${game.roomId} - is free to join`;
      allgameslist.appendChild(item);
    }
  });
};

const gameJoinedOrStarted = game => {
  console.log(game);
  mygame.innerText = `Your room id is - ${game.roomId}`;
};

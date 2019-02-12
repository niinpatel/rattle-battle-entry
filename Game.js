class Game {
  constructor(name1) {
    this.roomId = (Math.random() * 100000000000).toFixed(0);

    this.snake1 = {
      name: name1,
      positions: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
      color: 'green',
      dir: {
        x: 1,
        y: 0
      }
    };

    this.freeToJoin = true;

    this.food = this.makeFood();
    this.interval = null;
    this.winner = null;
    this.running = true;
  }

  joinGame(name2) {
    this.snake2 = {
      name: name2,
      positions: [{ x: 37, y: 39 }, { x: 38, y: 39 }, { x: 39, y: 39 }],
      color: 'red',
      dir: {
        x: -1,
        y: 0
      }
    };

    this.freeToJoin = false;
  }

  makeFood() {
    const x = Math.floor(Math.random() * 40);
    const y = Math.floor(Math.random() * 40);
    return {
      x,
      y
    };
  }

  moveSnakes() {
    [this.snake1, this.snake2].forEach(snake => {
      const [head] = snake.positions;
      const { x, y } = head;

      const newHead = {
        x: x + snake.dir.x,
        y: y + snake.dir.y
      };

      const otherSnake = snake === this.snake1 ? this.snake2 : this.snake1;
      const collides = otherSnake.positions.find(({ x, y }) => {
        return x === newHead.x && y === newHead.y;
      });

      if (newHead.x > 39 || newHead.y > 39 || newHead.x < 0 || newHead.y < 0) {
        const winner =
          this.snake1 === snake ? this.snake2.name : this.snake1.name;
        this.winner = winner;
        this.running = false;
      } else if (collides) {
        const winner = otherSnake.name;
        this.winner = winner;
        this.running = false;
      } else {
        snake.positions.pop();
        snake.positions.unshift(newHead);

        this.checkFoodEaten();
      }
    });
  }

  checkFoodEaten() {
    [this.snake1, this.snake2].forEach(snake => {
      const [head] = snake.positions;

      if (this.food.x === head.x && this.food.y === head.y) {
        snake.positions.push({ ...this.food });
        this.food = this.makeFood();
      }
    });
  }
}

module.exports = Game;

// Constants
var BLOCK_WIDTH = 101,
    BLOCK_HEIGHT = 83,
    PLAYER_OFFSET_X = 0,
    PLAYER_OFFSET_Y = -35,
    ENEMY_OFFSET_X = 0;
    ENEMY_OFFSET_Y = -22;
    FIELD_COLS = 5, // as hard-coded in engine.js
    FIELD_ROWS = 6,
    INITIAL_LIVES = 3,
    POINTS_PER_CROSSING = 5;

// Game: hold game state
var Game = function () {
    this.state = 'menu';
    this.lives = INITIAL_LIVES;
    this.current_score = 0,
    this.scores = [];
};

// handle input
Game.prototype.handleInput = function (input) {
    switch (game.state) {
        case 'menu':
            switch (input) {
                case 'enter':
                    game.state = 'run';
                    break;
                case 'h':
                    game.state = 'highscores';
                    break;
                default:
                    console.log('(game) invalid input: ' + input);
            }
            break;
        case 'highscores':
        case 'gameover':
            switch (input) {
                case 'enter':
                    game.state = 'menu';
                    break;
                default:
                    console.log('(game) invalid input: ' + input);
            }
            break;
        case 'pause':
            switch (input) {
                case 'space':
                    game.state = 'run';
                    break;
                default:
                    console.log ('(game) invalid input: ' +  input);
            }
            break;
        case 'run':
            // when the game is running, the player object
            // has full control
            player.handleInput(input);
            break;
    }
};

// Overlay for info areas and menus
var Overlay = function () {};

// call render() to show it
Overlay.prototype.render = function () {
    switch (game.state) {
        case 'pause':
            this._dim();
            this._drawStatus();
            break;
        case 'run':
            this._drawStatus();
            break;
        case 'menu':
            this._dim();
            this._drawMenu();
            break;
        case 'highscores':
            this._dim();
            this._drawHighscores();
            break;
        case 'gameover':
            this._dim();
            this._drawGameover();
    }
};

// 
Overlay.prototype._dim = function () {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 505, 606);
    ctx.globalAlpha = 1;
};

// draws the status line at the bottom of the screen, showing
// the current score and remaining lives. All pixel values
// hard-coded and found by trial & error
Overlay.prototype._drawStatus = function () {
    var status = "L:";
    status += game.lives;
    status += " | S:";
    status += game.current_score;

    var help = "<space> to pause";

    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 560, 505, 26);
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#00f';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(status, 20, 578);
    ctx.fillText(help, 330, 578);

};

// draws a menu screen
Overlay.prototype._drawMenu = function () {
    var menu = "<enter> to start, <h> for highscores";

    ctx.fillStyle = '#00f';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(menu, 250, 250);
};

// draws highscores screen
Overlay.prototype._drawHighscores = function () {
    var help = "<enter> to return to menu";

    ctx.fillStyle = '#00f';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(help, 250, 250);
};

// draws "game over" screen
Overlay.prototype._drawGameover = function () {
    var help = "GAME OVER (<enter> to return to menu)";

    ctx.fillStyle = '#00f';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(help, 250, 250);
};

// Enemies our player must avoid
var Enemy = function(row, speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    // create them off-screen
    this.x = ENEMY_OFFSET_X - BLOCK_WIDTH;
    this.y = ENEMY_OFFSET_Y + BLOCK_HEIGHT * row; 
    this.speed = speed;
    console.log("enemy created with speed " + speed);
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (game.state === 'run') {
        this.x += this.speed * dt;
        if (this.x >= BLOCK_WIDTH * FIELD_COLS) {
            this._reset();
        }
    }

}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Reset the enemy to the beginning of the line.
Enemy.prototype._reset = function () {
    this.x = ENEMY_OFFSET_X - BLOCK_WIDTH;
    this.speed = 100 + Math.floor(Math.random() * 300);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

var Player = function () {
    this.sprite = 'images/char-cat-girl.png';
    // initial placement on start row and random column
    var random_x = Math.floor(Math.random() * FIELD_COLS);
    this.x = PLAYER_OFFSET_X + (BLOCK_WIDTH * random_x);
    this.y = PLAYER_OFFSET_Y + (BLOCK_HEIGHT * (FIELD_ROWS - 1));
};

// Update the player's position, required method for game
// Parameter: dt, a time delta between ticks
Player.prototype.update = function(dt) {
    for (var e = 0; e < allEnemies.length; e++) {
        // same row?
        var same_row =
            (this.y - PLAYER_OFFSET_Y == allEnemies[e].y - ENEMY_OFFSET_Y);
        // overlap?
        var overlap =
            (Math.abs(this.x - allEnemies[e].x)) < 50;
        if (same_row && overlap) {
            this._fail();
            break;
        } 
    }
};

// Draw the player on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// reset the player to the start row
Player.prototype._reset = function() {
    var random_x = Math.floor(Math.random() * FIELD_COLS);
    this.x = PLAYER_OFFSET_X + (BLOCK_WIDTH * random_x);
    this.y = PLAYER_OFFSET_Y + (BLOCK_HEIGHT * (FIELD_ROWS - 1));
};

// called when run over by a bug
Player.prototype._fail = function () {
    game.lives--;
    this._reset();
    if (game.lives < 0) {
        game.state = 'gameover';
    }
};

// called when water is reached
Player.prototype.succeed = function () {
    game.score += POINTS_PER_CROSSING;
    this._reset();
};

// handle input
Player.prototype.handleInput = function (input) {
    switch (input) {
        case 'up':
            if (this.y - BLOCK_HEIGHT >= PLAYER_OFFSET_Y) {
                this.y -= BLOCK_HEIGHT;
            }
            break;
        case 'down':
            if (this.y + BLOCK_HEIGHT <= BLOCK_HEIGHT * (FIELD_ROWS - 1)) {
                this.y += BLOCK_HEIGHT;
            }
            break;
        case 'left':
            if (this.x - BLOCK_WIDTH >= PLAYER_OFFSET_X) {
                this.x -= BLOCK_WIDTH;
            }
            break;
        case 'right':
            if (this.x + BLOCK_WIDTH <= BLOCK_WIDTH * (FIELD_COLS - 1)) {
                this.x += BLOCK_WIDTH;
            }
            break;
        case 'space':
            // un-pause is handled by game.handleInput()
            game.state = 'pause';
            break;
        default:
            console.log("(player) invalid input: " + input);
    }
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [
    new Enemy(1, 100 + Math.floor(Math.random() * 300)),
    new Enemy(2, 100 + Math.floor(Math.random() * 300)), 
    new Enemy(3, 100 + Math.floor(Math.random() * 300))];
var player = new Player();
var overlay = new Overlay();
var game = new Game();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'space',
        13: 'enter',
        72: 'h'
    };

    game.handleInput(allowedKeys[e.keyCode]);
});

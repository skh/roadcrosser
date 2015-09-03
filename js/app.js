/* Constants
 * All *_OFFSET_* values are used to move item sprites into subjectively better-looking
 * places
 */
var BLOCK_WIDTH = 101,
    BLOCK_HEIGHT = 83,
    PLAYER_OFFSET_X = 0,    
    PLAYER_OFFSET_Y = -35,
    ENEMY_OFFSET_X = 0;
    ENEMY_OFFSET_Y = -22;
    EXTRA_OFFSET_X = 0;
    EXTRA_OFFSET_Y = -10;
    FIELD_COLS = 5, // also hard-coded in engine.js
    FIELD_ROWS = 6,
    INITIAL_LIVES = 1,
    POINTS_PER_CROSSING = 50,
    POINTS_PER_STAR = 50;
    NUM_HIGHSCORES = 10;

// Game: hold game state
var Game = function () {
    this.state = 'menu';
    this.lives = INITIAL_LIVES;
    this.current_score = 0,
    this.highscores = [];
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

    // remember the row
    this.row = row;

    // compute actual pixel coordinates
    // enemies are created off-screen
    this.x = ENEMY_OFFSET_X - BLOCK_WIDTH;
    this.y = ENEMY_OFFSET_Y + BLOCK_HEIGHT * row;
    this.speed = speed;
    console.log("enemy created with speed " + speed);
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {

    if (game.state === 'run') {
        // ensures the game runs at the same speed on fast and slow computers
        this.x += this.speed * dt;

        // if the bug runs off the right edge, reset it
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
    // image hard-coded for now
    this.sprite = 'images/char-cat-girl.png';

    // initial placement on random column and start row
    this.col = Math.floor(Math.random() * FIELD_COLS);
    this.row = FIELD_ROWS - 1;

};

// Update the player's position, required method for game
// Parameter: dt, a time delta between ticks
Player.prototype.update = function(dt) {

    // calculate actual coordinates from col and row
    this.x = PLAYER_OFFSET_X + (BLOCK_WIDTH * this.col);
    this.y = PLAYER_OFFSET_Y + (BLOCK_HEIGHT * this.row);

    // reaching the water?
    if (this.row === 0) {
        this._succeed();  // win & start over
    }

    // collision with any enemy?
    for (var e = 0; e < allEnemies.length; e++) {
        // same row?
        var same_row = this.row == allEnemies[e].row;
        // overlap?
        var overlap =
            (Math.abs(this.x - allEnemies[e].x)) < 50;
        if (same_row && overlap) {
            this._fail(); // lose & start over
            break;
        } 
    }

    // picked up any extra?
    for (var e = 0; e < allExtras.length; e++) {
        if (allExtras[e].row === this.row &&
            allExtras[e].col === this.col) {
            allExtras[e].yield();
        }
    }

};

// Draw the player on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// reset the player to random column and start row
Player.prototype._reset = function() {
    this.col = Math.floor(Math.random() * FIELD_COLS);
    this.row = FIELD_ROWS - 1;
};

// called when run over by a bug
Player.prototype._fail = function () {
    game.lives--;
    this._reset();
    if (game.lives < 0) {
        game.state = 'gameover';
        console.log("current_score: " + game.current_score);
        if (game.highscores.length < NUM_HIGHSCORES ||
            game.current_score > game.highscores[game.highscores.length - 1]) {
            game.highscores.push(game.current_score);
            game.highscores = game.highscores.sort();
            if (game.highscores.length > NUM_HIGHSCORES) {
                game.highscores = game.highscores.slice(0, NUM_HIGHSCORES);
            }
        }
        console.log(game.highscores);
        game.current_score = 0;
        game.lives = INITIAL_LIVES;
    }
};

// called when water is reached
Player.prototype._succeed = function () {
    game.current_score += POINTS_PER_CROSSING;
    this._reset();
};

// handle input
Player.prototype.handleInput = function (input) {
    switch (input) {
        // up, down, right, left: step there
        // at field's edges, do nothing
        case 'up':
            if (this.row > 0) this.row -= 1;
            break;

        case 'down':
            if (this.row < FIELD_ROWS - 1) this.row += 1;  
            break;

        case 'left':
            if (this.col > 0) this.col -= 1;
            break;

        case 'right':
            if (this.col < FIELD_COLS - 1) this.col += 1;
            break;

        // space: pause the game
        case 'space':
            // un-pause is handled by game.handleInput()
            game.state = 'pause';
            break;

        // only for debugging, console.log() is fine
        default:
            console.log("(player) invalid input: " + input);
    }
};

// Extra items that give lives and points
// Common functionality for Hearts and Stars:
// - have a position on the road rows
// - appear and disappear at random times
// - reset to new location and display / hide timeout

var Extra = function () {
    this._init();
    // if no sprite has been set, this constructor has not been called by
    // a subclass constructor.
    // In this case, warn and set a default sprite.
    if (!this.sprite) {
        console.log ("Don't use Extra directly, only use subclasses Heart and Star!")
        this.sprite = 'images/Rock.png';
    }
};

Extra.prototype.update = function (dt) {
    if (game.state === 'run') {
        this.timeout -= dt * 1000;
        if (this.timeout < 0) {
            // if it was already active, reset
            if (this.isActive) {
                this._reset();
            // else, activate
            } else {
                this.isActive = true;
                this._resetTimeout();
            }
        }
    }
};

Extra.prototype.render = function () {
    if (this.isActive) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};

Extra.prototype._init = function () {
    // extras only appear on road rows, hardcoded for to rows 1-3
    this.row = Math.floor(Math.random() * 3) + 1;
    this.col = Math.floor(Math.random() * FIELD_COLS);

    // calculate actual pixel coordinates
    this.x = EXTRA_OFFSET_X + (BLOCK_WIDTH * this.col);
    this.y = EXTRA_OFFSET_Y + (BLOCK_HEIGHT * this.row);;
    
    // state
    this.isActive = false;

    // reset timeout
    this._resetTimeout();
};

Extra.prototype._reset = function () {
    this._init();
}

Extra.prototype._resetTimeout = function () {
    // timeout before the extra appears or disappears
    // a random value between 3000 and 7999
    this.timeout = Math.floor(Math.random() * 5000) + 3;
};


Extra.prototype.yield = function () {
    console.log("Not implemented in superclass Extra! Only use subclasses Heart or Star.")
};

// a heart gives one extra life when picked up
var Heart = function () {
    this.sprite = 'images/Heart.png';
    Extra.call(this);
};
// set up inheritance
Heart.prototype = Object.create(Extra.prototype);
Heart.prototype.constructor = Heart;

// apply bonus and reset heart
Heart.prototype.yield = function () {
    game.lives++;
    this._reset();
};

// a Star gives POINTS_PER_STAR extra points when picked up
var Star = function () {
    this.sprite = 'images/Star.png';
    Extra.call(this);
};
// set up inheritance
Star.prototype = Object.create(Extra.prototype);
Star.prototype.constructor = Star;

// apply bonus and reset star
Star.prototype.yield = function () {
    game.current_score += POINTS_PER_STAR;
    this._reset();
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [
    new Enemy(1, 100 + Math.floor(Math.random() * 300)),
    new Enemy(2, 100 + Math.floor(Math.random() * 300)), 
    new Enemy(3, 100 + Math.floor(Math.random() * 300))];
var allExtras = [
    new Heart(),
    new Star()
];
var player = new Player();
var overlay = new Overlay();
var game = new Game();

// This listens for key presses and sends the keys to your
// Player.handleInput() method.
// Using the Kibo library provides a snappier response to keyboard events
// than registering a plain event listener.

var k = new Kibo();

k.down('any', function () {
    game.handleInput(k.lastKey());
});

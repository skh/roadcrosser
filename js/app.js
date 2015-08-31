var BLOCK_WIDTH = 100,
    BLOCK_HEIGHT = 83,
    PLAYER_OFFSET_X = 0,
    PLAYER_OFFSET_Y = -35,
    ENEMY_OFFSET_X = 0;
    ENEMY_OFFSET_Y = -20;
    FIELD_COLS = 5, // as hard-coded in engine.js
    FIELD_ROWS = 6;

var pause = false;

// Overlay for info areas and menus
var Overlay = function () {};

// call render() to show it
Overlay.prototype.render = function () {
    if (pause) {
        var alpha = ctx.globalAlpha;
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 505, 606);
        ctx.globalAlpha = alpha;
    }
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
    if (!pause) {
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
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
};

// Draw the player on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
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
            if (pause) {
                pause = false;
            } else {
                pause = true;
            }
            break;
        default:
            console.log(input);
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

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'space'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

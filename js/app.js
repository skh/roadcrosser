/* Constants to control behaviour and display of the game
 * All *_OFFSET_* values are used to move item sprites into subjectively better-looking
 * places
 */
var BLOCK_WIDTH = 101,
    BLOCK_HEIGHT = 83,

    PLAYER_SPRITE = 'images/char-cat-girl.png';
    PLAYER_OFFSET_X = 0;
    PLAYER_OFFSET_Y = -35,

    ENEMY_SPRITE = 'images/enemy-bug.png';
    ENEMY_OFFSET_X = 0;
    ENEMY_OFFSET_Y = -22;

    HEART_SPRITE = 'images/Heart.png';
    STAR_SPRITE = 'images/Star.png';
    EXTRA_SPRITE = 'images/Rock.png';
    EXTRA_OFFSET_X = 0;
    EXTRA_OFFSET_Y = -10;

    // also hard-coded in engine.js
    FIELD_COLS = 5, 
    FIELD_ROWS = 6,

    INITIAL_LIVES = 1,
    POINTS_PER_CROSSING = 1,
    POINTS_PER_STAR = 3;
    NUM_HIGHSCORES = 5;

/* Game -- object to hold game metadata and manage game state
 * 
 * The game can be in the following states:
 *
 * menu      : Show the main menu screen
 * highscores: Show highscores
 * run       : Run the game
 * pause     : Pause the running game
 * gameover  : Show the gameover screen and high scores
 * 
 * The user interacts with the game only through keyboard commands
 */

var Game = function () {
    this.state = 'menu';
    this.lives = INITIAL_LIVES;
    this.current_score = 0,
    this.highscore_list = [];
};

/* Game.handleInput() -- handle keyboard input depending on current game state
 *
 * This method gets all key events from the Kibo object which handles keyboard events
 *
 * If the game is in the 'run' state, keyboard input is then passed on
 * to Player.handleInput().
 * In all other cases, keyboard input is handled by this method
 * directly. All state transitions happen in wrapper methods. Some of them
 * perform additional actions necessary when entering the new state.
 *
 * The following state transitions are used
 *
 * start     : 'menu' -> 'run'
 * pause     : 'run' -> 'pause'
 * resume    : 'pause' -> 'run'
 * gameover  : 'run' -> 'gameover'
 * menu      : 'gameover' -> 'menu'
 *             'highscores' -> 'menu'
 * highscores: 'menu' -> 'highscores'
 *
 */
Game.prototype.handleInput = function (input) {
    switch (this.state) {
        case 'menu':
            switch (input) {
                case 'enter':
                    this.start();
                    break;
                case 'h':
                    this.highscores();
                    break;
                default:
                    console.log('(game) invalid input: ' + input);
            }
            break;
        case 'highscores':
        case 'gameover':
            switch (input) {
                case 'enter':
                    this.menu();
                    break;
                default:
                    console.log('(game) invalid input: ' + input);
            }
            break;
        case 'pause':
            switch (input) {
                case 'space':
                    this.resume();
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

/* Wrapper methods to handle state transitions:
 * Game.start()
 * Game.pause()
 * Game.resume()
 * Game.gameover()
 * Game.menu()
 * Game.highscores()
 *
 */
Game.prototype.start = function () {
    // reset lives
    game.lives = INITIAL_LIVES;
    // reset score
    game.current_score = 0;
    // set state
    this.state = 'run';
};

Game.prototype.pause = function () {
    this.state = 'pause';
};

Game.prototype.resume = function () {
    this.state = 'run';
};

Game.prototype.gameover = function () {
    var ghl = game.highscore_list.length;
    // save score to highscore_list, if necessary
    // score is a highscore if:
    // score is > 0, and:
    // either highscore list isn't filled yet
    if (game.current_score > 0 && (ghl < NUM_HIGHSCORES ||
        // or score is higher than the lowest score in highscore_list
        game.current_score > game.highscore_list[ghl - 1])) {

        // push to highscore_list. this is now unsorted.
        game.highscore_list.push(game.current_score);

        // sort in descending order
        game.highscore_list.sort(function (a, b) {
            return b - a;
        });

        // remove duplicates from array, by...
        tmp = game.highscore_list.filter(function (item, pos) {
            // ...only including the first occurence of each item
            return game.highscore_list.indexOf(item) == pos;
        });
        game.highscore_list = tmp; 

        // limit highscore list to NUM_HIGHSCORES
        ghl = game.highscore_list.length;
        if (ghl > NUM_HIGHSCORES) {
            game.highscore_list = game.highscore_list.slice(0, NUM_HIGHSCORES);
        }
    }
    
    // set state
    this.state = 'gameover';
};

Game.prototype.menu = function () {
    this.state = 'menu';
};

Game.prototype.highscores = function () {
    this.state = 'highscores'
};

/* Overlay -- object for drawing functionality
 *
 * This object contains all methods to draw menu screens and other information
 * in an overly over the game field.
 * 
 * It is treated like the game objects:  its update() and render() methods 
 * are called from the game loop.
 *
 */
var Overlay = function () {};

/* Overlay.render()
 *
 * Draw menu screens or other information on the game field, depending on the
 * current game state.
 */
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

/* Overlay._dim()
 *
 * Draw a semitransparent white rectangle over the game field. Used for all full-screen
 * menu screens.
 */
Overlay.prototype._dim = function () {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 505, 606);
    ctx.globalAlpha = 1;
};

/* Overlay._drawText()
 *
 * Helper method to draw short text to a specific position, called by
 * the other _draw* methods
 */
Overlay.prototype._drawText = function (content, x, y, alignment) {
    ctx.save();
    ctx.fillStyle = '#00f';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = alignment;
    ctx.fillText(content, x, y);
    ctx.restore();
}

/* Overlay._drawStatus()
 *
 * Draws the status line at the bottom of the screen, showing the current score and 
 * remaining lives.
 */
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

    this._drawText(status, 20, 578, 'left');
    this._drawText(help, 330, 578, 'left');

};

/* Overlay._drawMenu()
 *
 * Draws the initial menu screen
 */
Overlay.prototype._drawMenu = function () {
    var menu = "<enter> to start, <h> for highscores";
    this._drawText(menu, 250, 250, 'center');
};

/* Overlay._drawHighscores()
 *
 * Draws the highscore screen
 */
Overlay.prototype._drawHighscores = function () {
    var help = "<enter> to return to menu";

    this._drawText(help, 250, 250, 'center');
    this._drawHighscoreList();
};


/* Overlay._drawHighscoreList()
 *
 * Draws the actual highscore list
 */
 Overlay.prototype._drawHighscoreList = function () {
    var line_height = 24;
    var y = 250 + 2 * line_height;
    var line = '';

    for (var i = 0; i < NUM_HIGHSCORES; i++) {
        line = i < 9 ? '0' : ''; // leading zero for 1-9
        line +=(i + 1) + ": ";
        line += game.highscore_list[i] || '-';
        if (game.highscore_list[i] === game.current_score) {
            line += ' < your last score!';
        }
        this._drawText(line, 100, y, 'left');
        y += line_height;
    }
};

/* Overlay._drawGameover()
 *
 * Draws the gameover screen
 */
Overlay.prototype._drawGameover = function () {
    var help = "GAME OVER (<enter> to return to menu)";

    ctx.fillStyle = '#00f';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(help, 250, 250);

    this._drawHighscoreList();
};

/* Enemy == object to model the enemies the player must avoid
 *
 * Enemies are created off-screen with a random speed. They always walk
 * from the left to the right edge of the game field. When they leave the
 * screen, they are reset to a new speed, but stau in the same row.
 */
var Enemy = function(row) {
    this.sprite = ENEMY_SPRITE;
    // remember the row, makes collision detection easier later
    this.row = row;

    // y-coordinate will never change
    this.y = ENEMY_OFFSET_Y + BLOCK_HEIGHT * row;

    // initialize with random speed at the beginning of the line
    this._reset();
}

/* Enemy.update()
 *
 * Update the enemy's position. 'dt' is the time delta between ticks.
 * Called from the main game loop.
 */
Enemy.prototype.update = function(dt) {
    // if the game is paused or a menu screen is shown, enemies stand still
    if (game.state === 'run') {
        // ensures the game runs at the same speed on fast and slow computers
        this.x += this.speed * dt;

        // if the enemy runs off the right edge, reset it
        if (this.x >= BLOCK_WIDTH * FIELD_COLS) {
            this._reset();
        }
    }

}

/* Enemy.render()
 *
 * Draw the enemy on the screen, called from the main game loop
 */
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

/* Enemy._reset()
 *
 * Reset the enemy to the beginning of the line with a new random speed
 */
Enemy.prototype._reset = function () {
    this.x = ENEMY_OFFSET_X - BLOCK_WIDTH;
    this.speed = 100 + Math.floor(Math.random() * 300);
}

/* Player -- object to model the player
 *
 * Initial position is a random block on the start row
 * While the game is in 'run' state, all keyboard events are passed through
 * to the Player object.
 *
 * The Player object is responsible to detect collisions with enemies and
 * picking up of extra items.
 */
var Player = function () {
    // image hard-coded for now
    this.sprite = PLAYER_SPRITE;

    // initial placement on random column and start row
    this.col = Math.floor(Math.random() * FIELD_COLS);
    this.row = FIELD_ROWS - 1;

};

/* Player.update()
 *
 * Update the player's position. 'dt' is the time delta between ticks.
 * Called from the main game loop.
 *
 * All checks for collisions and extra items happen in this method
 */
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

/* Player.render()
 *
 * Draw the player on the screen, called from the main game loop
 */
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/* Player._reset()
 *
 * Reset the player to a random block in the start row
 */
Player.prototype._reset = function() {
    this.col = Math.floor(Math.random() * FIELD_COLS);
    this.row = FIELD_ROWS - 1;
};

/* Player._fail()
 *
 * Called after a collision with an enemy. Substract one life,
 * end game when no lives are left or reset player to start row.
 */
Player.prototype._fail = function () {
    game.lives--;
    this._reset();
    if (game.lives < 0) {
        game.gameover();
    }
};

/* Player._succeed()
 *
 * Called after the water row has been reached. Increase score,
 * reset player to start row
 */
Player.prototype._succeed = function () {
    game.current_score += POINTS_PER_CROSSING;
    this._reset();
};

/* Player.handleInput()
 *
 * Called by Game.handleInput() when the game is in the 'run' state.
 * 
 * Moves the player on the game field, pauses the game when <space>
 * is pressed.
 */
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
            // resume is handled by game.handleInput()
            game.pause();
            break;

        default:
            console.log("(player) invalid input: " + input);
    }
};

/* Extra -- superclass for objects that give extra lives and points
 *
 * During game setup, a fixed number of extra items is created. They
 * appear and disappear at random intervals and locations. When an
 * item is picked up, is it reset immediately and the points awarded.
 * 
 * Picking up extra items is handled by the Player class, which then calls
 * their yield() method.
 *
 * Common functionality for all extra items:
 * - have a position on the road rows
 * - appear and disappear at random times
 * - reset to new location and display / hide timeout
 *
 * Functionality implemented in the subclasses:
 *
 * - have a specific sprite for each subclass
 * - yield(): award bonus lives / points
 * 
 */
var Extra = function () {
    // initialize to random values
    this._reset();
    // if no sprite has been set, this constructor has not been called by
    // a subclass constructor.
    // In this case, warn and set a default sprite.
    if (!this.sprite) {
        console.log ("Don't use Extra directly, only use subclasses Heart and Star!")
        this.sprite = EXTRA_SPRITE;
    }
};

/* Extra.update()
 *
 * check whether the timeout has been reached and toggle between
 * active and inactive state
 */
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

/* Extra.render()
 */
Extra.prototype.render = function () {
    if (this.isActive) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};

/* Extra._reset()
 *
 * Resets the extra item to a random position and timeout
 */
Extra.prototype._reset = function () {
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

/* Extra._resetTimeout()
 * 
 * Reset the timeout to when the extra will next appear/disappear
 */
Extra.prototype._resetTimeout = function () {
    // timeout before the extra appears or disappears
    // a random value between 3000 and 7999
    this.timeout = Math.floor(Math.random() * 5000) + 3;
};

/* Extra.yield()
 *
 * Award bonus points and lives, functionality only implemented in subclasses
 */
Extra.prototype.yield = function () {
    console.log("Not implemented in superclass Extra! Only use subclasses Heart or Star.")
};

/* Heart -- object for extra item awarding one extra life when picked up
 */
var Heart = function () {
    this.sprite = HEART_SPRITE;
    Extra.call(this);
};
// set up inheritance
Heart.prototype = Object.create(Extra.prototype);
Heart.prototype.constructor = Heart;


/* Heart.yield()
 *
 * Award extra life and reset Heart
 */
Heart.prototype.yield = function () {
    game.lives++;
    this._reset();
};

/* Star -- object for extra item awarding extra points when picked up
 */
var Star = function () {
    this.sprite = STAR_SPRITE;
    Extra.call(this);
};
// set up inheritance
Star.prototype = Object.create(Extra.prototype);
Star.prototype.constructor = Star;

/* Star.yield()
 *
 * Award extra points and reset Heart
 */
Star.prototype.yield = function () {
    game.current_score += POINTS_PER_STAR;
    this._reset();
};

// Set up all game ojects
var allEnemies = [
    new Enemy(1)),
    new Enemy(2, 100 + Math.floor(Math.random() * 300)), 
    new Enemy(3, 100 + Math.floor(Math.random() * 300))];
var allExtras = [
    new Heart(),
    new Star()
];
var player = new Player();
var overlay = new Overlay();
var game = new Game();

// Using the Kibo library provides a snappier response to keyboard events
// than registering a plain event listener.

var k = new Kibo();

k.down('any', function () {
    game.handleInput(k.lastKey());
});

/*
game.js for Perlenspiel 3.3.x
Last revision: 2022-03-15 (BM)

Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
This version of Perlenspiel (3.3.x) is hosted at <https://ps3.perlenspiel.net>
Perlenspiel is Copyright © 2009-22 Brian Moriarty.
This file is part of the standard Perlenspiel 3.3.x devkit distribution.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with the Perlenspiel devkit. If not, see <http://www.gnu.org/licenses/>.
*/

/*
This JavaScript file is a template for creating new Perlenspiel 3.3.x games.
Any unused event-handling function templates can be safely deleted.
Refer to the tutorials and documentation at <https://ps3.perlenspiel.net> for details.
*/

/*
The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these two lines.
*/

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT remove this directive!

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

let playerX = 4
let playerY = 4

let winX = 19
let winY = 19

let GRID_SIZE = 25
let mostRecentMove = ""
let mostRecentWinMove = ""

let gameOver = false

let hintTimerID

PS.init = function( system, options ) {
    PS.gridSize(GRID_SIZE, GRID_SIZE)
    PS.color(4, 4, PS.COLOR_BLUE)
    PS.glyph(4, 4, 'O')

    PS.color(19, 19, PS.COLOR_YELLOW)

    for (let x = 0; x < GRID_SIZE; x++) {
        PS.color(x, 0, PS.COLOR_BLACK)
        PS.color(x, GRID_SIZE / 3, PS.COLOR_BLACK)
        PS.color(x, 2 * GRID_SIZE / 3, PS.COLOR_BLACK)
        PS.color(x, GRID_SIZE - 1, PS.COLOR_BLACK)
    }

    for (let y = 0; y < GRID_SIZE; y++) {
        PS.color(0, y, PS.COLOR_BLACK)
        PS.color(GRID_SIZE / 3, y, PS.COLOR_BLACK)
        PS.color(2 * GRID_SIZE / 3, y, PS.COLOR_BLACK)
        PS.color(GRID_SIZE - 1, y, PS.COLOR_BLACK)
    }

    // Top middle TPs
    PS.color(4, 1, PS.COLOR_GREEN)
    PS.color(12, 1, PS.COLOR_GREEN)
    PS.color(20, 1, PS.COLOR_GREEN)
    PS.color(4, 9, PS.COLOR_GREEN)
    PS.color(12, 9, PS.COLOR_GREEN)
    PS.color(20, 9, PS.COLOR_GREEN)
    PS.color(4, 17, PS.COLOR_GREEN)
    PS.color(12, 17, PS.COLOR_GREEN)
    PS.color(20, 17, PS.COLOR_GREEN)

    //Middle Left TPs
    PS.color(1, 4, PS.COLOR_GREEN)
    PS.color(9, 4, PS.COLOR_GREEN)
    PS.color(17, 4, PS.COLOR_GREEN)
    PS.color(1, 12, PS.COLOR_GREEN)
    PS.color(9, 12, PS.COLOR_GREEN)
    PS.color(17, 12, PS.COLOR_GREEN)
    PS.color(1, 20, PS.COLOR_GREEN)
    PS.color(9, 20, PS.COLOR_GREEN)
    PS.color(17, 20, PS.COLOR_GREEN)

    //Middle Right TPs
    PS.color(7, 4, PS.COLOR_GREEN)
    PS.color(15, 4, PS.COLOR_GREEN)
    PS.color(23, 4, PS.COLOR_GREEN)
    PS.color(7, 12, PS.COLOR_GREEN)
    PS.color(15, 12, PS.COLOR_GREEN)
    PS.color(23, 12, PS.COLOR_GREEN)
    PS.color(7, 20, PS.COLOR_GREEN)
    PS.color(15, 20, PS.COLOR_GREEN)
    PS.color(23, 20, PS.COLOR_GREEN)

    // Bottom middle TPs
    PS.color(4, 7, PS.COLOR_GREEN)
    PS.color(12, 7, PS.COLOR_GREEN)
    PS.color(20, 7, PS.COLOR_GREEN)
    PS.color(4, 15, PS.COLOR_GREEN)
    PS.color(12, 15, PS.COLOR_GREEN)
    PS.color(20, 15, PS.COLOR_GREEN)
    PS.color(4, 23, PS.COLOR_GREEN)
    PS.color(12, 23, PS.COLOR_GREEN)
    PS.color(20, 23, PS.COLOR_GREEN)

    //Hint
    hintTimerID = PS.timerStart(1800, hint)

    PS.statusText("Goal Warp")
};

const hint = function() {
    PS.timerStop(hintTimerID)
    if (!gameOver) {
        PS.statusText("Hint: You can press \'R\' to reset.")
    }
}

const moveUp = function() {
    if (PS.color(playerX, playerY - 1) === PS.COLOR_WHITE) {
        PS.color(playerX, playerY - 1, PS.COLOR_BLUE)
        PS.glyph(playerX, playerY - 1, 'O')
        eraseTile(playerX, playerY)
        playerY--
        mostRecentMove = "up"
    }
    else if (PS.color(playerX, playerY - 1) === PS.COLOR_GREEN) {
        mostRecentMove = "up"
        const [x, y] = findTeleporter(playerX, playerY)
        PS.color(x, y - 1, PS.COLOR_BLUE)
        PS.glyph(x, y - 1, 'O')
        eraseTile(playerX, playerY)
        playerX = x
        playerY = y - 1
    }
    else if (PS.color(playerX, playerY - 1) === PS.COLOR_YELLOW) {
        winScreen()
    }

    if (PS.color(winX, winY - 1) === PS.COLOR_WHITE) {
        PS.color(winX, winY - 1, PS.COLOR_YELLOW)
        eraseTile(winX, winY)
        mostRecentWinMove = "up"
        winY--
    }
    else if (PS.color(winX, winY - 1) === PS.COLOR_GREEN) {
        mostRecentWinMove = "up"
        const [x, y] = findTeleporter(winX, winY)
        PS.color(x, y - 1, PS.COLOR_YELLOW)
        eraseTile(winX, winY)
        winX = x
        winY = y - 1
    }
}

const moveDown = function() {
    if (PS.color(playerX, playerY + 1) === PS.COLOR_WHITE) {
        PS.color(playerX, playerY + 1, PS.COLOR_BLUE)
        PS.glyph(playerX, playerY + 1, 'O')
        eraseTile(playerX, playerY)
        playerY++
        mostRecentMove = "down"
    }
    else if (PS.color(playerX, playerY + 1) === PS.COLOR_GREEN) {
        mostRecentMove = "down"
        const [x, y] = findTeleporter(playerX, playerY)
        PS.color(x, y + 1, PS.COLOR_BLUE)
        PS.glyph(x, y + 1, 'O')
        eraseTile(playerX, playerY)
        playerX = x
        playerY = y + 1
    }
    else if (PS.color(playerX, playerY + 1) === PS.COLOR_YELLOW) {
        winScreen()
    }

    if (PS.color(winX, winY + 1) === PS.COLOR_WHITE) {
        PS.color(winX, winY + 1, PS.COLOR_YELLOW)
        eraseTile(winX, winY)
        mostRecentWinMove = "down"
        winY++
    }
    else if (PS.color(winX, winY + 1) === PS.COLOR_GREEN) {
        mostRecentWinMove = "down"
        const [x, y] = findTeleporter(winX, winY)
        PS.color(x, y + 1, PS.COLOR_YELLOW)
        eraseTile(winX, winY)
        winX = x
        winY = y + 1
    }
}

const moveLeft = function() {
    if (PS.color(playerX - 1, playerY) === PS.COLOR_WHITE) {
        PS.color(playerX - 1, playerY, PS.COLOR_BLUE)
        PS.glyph(playerX - 1, playerY, 'O')
        eraseTile(playerX, playerY)
        playerX--
        mostRecentMove = "left"
    }
    else if (PS.color(playerX - 1, playerY) === PS.COLOR_GREEN) {
        mostRecentMove = "left"
        const [x, y] = findTeleporter(playerX, playerY)
        PS.color(x - 1, y, PS.COLOR_BLUE)
        PS.glyph(x - 1, y, 'O')
        eraseTile(playerX, playerY)
        playerX = x - 1
        playerY = y
    }
    else if (PS.color(playerX - 1, playerY) === PS.COLOR_YELLOW) {
        winScreen()
    }

    if (PS.color(winX - 1, winY) === PS.COLOR_WHITE) {
        PS.color(winX - 1, winY, PS.COLOR_YELLOW)
        eraseTile(winX, winY)
        mostRecentWinMove = "left"
        winX--
    }
    else if (PS.color(winX - 1, winY) === PS.COLOR_GREEN) {
        mostRecentWinMove = "left"
        const [x, y] = findTeleporter(winX, winY)
        PS.color(x - 1, y, PS.COLOR_YELLOW)
        eraseTile(winX, winY)
        winX = x - 1
        winY = y
    }
}

const moveRight = function() {
    if (PS.color(playerX + 1, playerY) === PS.COLOR_WHITE) {
        PS.color(playerX + 1, playerY, PS.COLOR_BLUE)
        PS.glyph(playerX + 1, playerY, 'O')
        eraseTile(playerX, playerY)
        playerX++
        mostRecentMove = "right"
    }
    else if (PS.color(playerX + 1, playerY) === PS.COLOR_GREEN) {
        mostRecentMove = "right"
        const [x, y] = findTeleporter(playerX, playerY)
        PS.color(x + 1, y, PS.COLOR_BLUE)
        PS.glyph(x + 1, y, 'O')
        eraseTile(playerX, playerY)
        playerX = x + 1
        playerY = y
    }

    else if (PS.color(playerX + 1, playerY) === PS.COLOR_YELLOW) {
        winScreen()
    }

    if (PS.color(winX + 1, winY) === PS.COLOR_WHITE) {
        PS.color(winX + 1, winY, PS.COLOR_YELLOW)
        eraseTile(winX, winY)
        mostRecentWinMove = "right"
        winX++
    }
    else if (PS.color(winX + 1, winY) === PS.COLOR_GREEN) {
        mostRecentWinMove = "right"
        const [x, y] = findTeleporter(winX, winY)
        PS.color(x + 1, y, PS.COLOR_YELLOW)
        eraseTile(winX, winY)
        winX = x + 1
        winY = y
    }
}

const eraseTile = function(x, y) {
    PS.color(x, y, PS.COLOR_WHITE)
    PS.glyph(x, y, "")
}

const winScreen = function() {
    PS.color(playerX, playerY, PS.COLOR_WHITE)
    PS.glyph(playerX, playerY, "")
    PS.color(winX, winY, PS.COLOR_WHITE)
    gameOver = true

    // Letter Y
    PS.color(7, 7, 0xc430ee)
    PS.color(7, 8, 0xc430ee)
    PS.color(7, 9, 0xc430ee)
    PS.color(8, 9, 0xc430ee)
    PS.color(9, 9, 0xc430ee)
    PS.color(9, 8, 0xc430ee)
    PS.color(9, 7, 0xc430ee)
    PS.color(9, 10, 0xc430ee)
    PS.color(9, 11, 0xc430ee)
    PS.color(8, 11, 0xc430ee)
    PS.color(7, 11, 0xc430ee)

    //Letter O
    PS.color(11, 7, 0xc430ee)
    PS.color(12, 7, 0xc430ee)
    PS.color(13, 7, 0xc430ee)
    PS.color(13, 8, 0xc430ee)
    PS.color(13, 9, 0xc430ee)
    PS.color(13, 10, 0xc430ee)
    PS.color(13, 11, 0xc430ee)
    PS.color(12, 11, 0xc430ee)
    PS.color(11, 11, 0xc430ee)
    PS.color(11, 10, 0xc430ee)
    PS.color(11, 9, 0xc430ee)
    PS.color(11, 8, 0xc430ee)

    //Letter U
    PS.color(15, 7, 0xc430ee)
    PS.color(15, 8, 0xc430ee)
    PS.color(15, 9, 0xc430ee)
    PS.color(15, 10, 0xc430ee)
    PS.color(15, 11, 0xc430ee)
    PS.color(16, 11, 0xc430ee)
    PS.color(17, 11, 0xc430ee)
    PS.color(17, 10, 0xc430ee)
    PS.color(17, 9, 0xc430ee)
    PS.color(17, 8, 0xc430ee)
    PS.color(17, 7, 0xc430ee)

    //Letter W
    PS.color(5, 14, 0xc430ee)
    PS.color(5, 15, 0xc430ee)
    PS.color(5, 16, 0xc430ee)
    PS.color(5, 17, 0xc430ee)
    PS.color(5, 18, 0xc430ee)
    PS.color(6, 18, 0xc430ee)
    PS.color(7, 18, 0xc430ee)
    PS.color(7, 17, 0xc430ee)
    PS.color(7, 16, 0xc430ee)
    PS.color(8, 18, 0xc430ee)
    PS.color(9, 18, 0xc430ee)
    PS.color(9, 17, 0xc430ee)
    PS.color(9, 16, 0xc430ee)
    PS.color(9, 15, 0xc430ee)
    PS.color(9, 14, 0xc430ee)

    //Letter I
    PS.color(11, 14, 0xc430ee)
    PS.color(12, 14, 0xc430ee)
    PS.color(13, 14, 0xc430ee)
    PS.color(12, 15, 0xc430ee)
    PS.color(12, 16, 0xc430ee)
    PS.color(12, 17, 0xc430ee)
    PS.color(12, 18, 0xc430ee)
    PS.color(11, 18, 0xc430ee)
    PS.color(13, 18, 0xc430ee)

    //Letter N
    PS.color(15, 14, 0xc430ee)
    PS.color(15, 15, 0xc430ee)
    PS.color(15, 16, 0xc430ee)
    PS.color(15, 17, 0xc430ee)
    PS.color(15, 18, 0xc430ee)
    PS.color(16, 15, 0xc430ee)
    PS.color(17, 16, 0xc430ee)
    PS.color(18, 17, 0xc430ee)
    PS.color(19, 18, 0xc430ee)
    PS.color(19, 17, 0xc430ee)
    PS.color(19, 16, 0xc430ee)
    PS.color(19, 15, 0xc430ee)
    PS.color(19, 14, 0xc430ee)

}


const findTeleporter = function(startX, startY) {
    if (mostRecentMove === "down") {
        let x = startX
        let y = startY + 2
        while (PS.color(x, y) !== PS.COLOR_GREEN) {
            if (y === GRID_SIZE - 1) {
                y = 0
            }
            else {
                y++
            }
        }
        return [x, y]
    }
    if (mostRecentMove === "up") {
        let x = startX
        let y = startY - 2
        while (PS.color(x, y) !== PS.COLOR_GREEN) {
            if (y === 0) {
                y = GRID_SIZE - 1
            }
            else {
                y--
            }
        }
        return [x, y]
    }
    if (mostRecentMove === "left") {
        let x = startX - 2
        let y = startY
        while (PS.color(x, y) !== PS.COLOR_GREEN) {
            if (x === 0) {
                x = GRID_SIZE - 1
            }
            else {
                x--
            }
        }
        return [x, y]
    }
    if (mostRecentMove === "right") {
        let x = startX + 2
        let y = startY
        while (PS.color(x, y) !== PS.COLOR_GREEN) {
            if (x === GRID_SIZE - 1) {
                x = 0
            }
            else {
                x++
            }
        }
        return [x, y]
    }
}

const reset = function() {
    PS.color(playerX, playerY, PS.COLOR_WHITE)
    PS.glyph(playerX, playerY, "")
    PS.color(4, 4, PS.COLOR_BLUE)
    PS.glyph(4, 4, "O")
    playerX = 4
    playerY = 4

    PS.color(winX, winY, PS.COLOR_WHITE)
    PS.color(19, 19, PS.COLOR_YELLOW)
    winX = 19
    winY = 19
}
/*
PS.touch ( x, y, data, options )
Called when the left mouse button is clicked over bead(x, y), or when bead(x, y) is touched.
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.touch = function( x, y, data, options ) {
	// Uncomment the following code line
	// to inspect x/y parameters:

	// PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );

	// Add code here for mouse clicks/touches
	// over a bead.
};

/*
PS.release ( x, y, data, options )
Called when the left mouse button is released, or when a touch is lifted, over bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.release = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead.
};

/*
PS.enter ( x, y, button, data, options )
Called when the mouse cursor/touch enters bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.enter = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
};

/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exit = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
};

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exitGrid = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyDown = function( key, shift, ctrl, options ) {
    if (!gameOver) {
        if (key === 82 || key === 114) { // [Rr] resets
            reset()
        }

        if (key === PS.KEY_ARROW_LEFT) {
            moveLeft()
        }

        if (key === PS.KEY_ARROW_RIGHT) {
            moveRight()
        }

        if (key === PS.KEY_ARROW_UP) {
            moveUp()
        }

        if (key === PS.KEY_ARROW_DOWN) {
            moveDown()
        }
    }
};

/*
PS.keyUp ( key, shift, ctrl, options )
Called when a key on the keyboard is released.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
};

/*
PS.input ( sensors, options )
Called when a supported input device event (other than those above) is detected.
This function doesn't have to do anything. Any value returned is ignored.
[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
*/

PS.input = function( sensors, options ) {
	// Uncomment the following code lines to inspect first parameter:

//	 var device = sensors.wheel; // check for scroll wheel
//
//	 if ( device ) {
//	   PS.debug( "PS.input(): " + device + "\n" );
//	 }

	// Add code here for when an input event is detected.
};


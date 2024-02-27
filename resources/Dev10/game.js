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

const kingTextColor = 0xff5656
const playerTextColor = 0x262cff

let gameSequence = 0

let introSprite
let introDialogueNumber = 0

let chaosTrialTutorialNumber = 0

PS.init = function( system, options ) {
    PS.gridSize(16, 16)
    PS.border(PS.ALL, PS.ALL, 0)
    PS.borderAlpha(PS.ALL, PS.ALL, 0)

    PS.imageLoad("images/intro.png", (data) => {
        introSprite = PS.spriteImage(data)
        PS.spriteMove(introSprite, 0, 0)
    })

    PS.statusText("(Press space to advance dialogue...)")

    intro()
};

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

};

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exitGrid = function( options ) {

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
    if (key === 84 || key === 116) { // [Tt]
        switch (gameSequence) {
            case 0:
                intro()
                break
            case 1:
                chaosTrialsTutorial()
                break
            case 2:
                PS.gridSize(32, 32)
                PS.spriteDelete(introSprite)
                PS.glyph(8, 31, 'R')
                PS.glyph(9, 31, 'O')
                PS.glyph(10, 31, 'U')
                PS.glyph(11, 31, 'N')
                PS.glyph(12, 31, 'D')
                PS.glyph(13, 31, ':')
                PS.glyph(15, 31, '0')
                PS.glyph(16, 31, '/')
                PS.glyph(17, 31, '1')
                PS.glyph(18, 31, '0')
                PS.glyph(8, 30, 'F')
                PS.glyph(9, 30, 'A')
                PS.glyph(10, 30, 'I')
                PS.glyph(11, 30, 'L')
                PS.glyph(12, 30, 'S')
                PS.glyph(13, 30, ':')
                PS.glyph(15, 30, '0')
                PS.glyph(16, 30, '/')
                PS.glyph(17, 30, '2')
            default:
                break
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

};

const intro = () => {
    switch (introDialogueNumber) {
        case 0:
            PS.statusText("Please Rise.")
            PS.statusColor(kingTextColor)
            break
        case 1:
            PS.statusText("Wh... Why am i here???")
            PS.statusColor(playerTextColor)
            break
        case 2:
            PS.statusText("You have been chosen by the council...")
            PS.statusColor(kingTextColor)
            break
        case 3:
            PS.statusText("Chosen for what???")
            PS.statusColor(playerTextColor)
            break
        case 4:
            PS.statusText("Have you been living under a rock???")
            PS.statusColor(kingTextColor)
            break
        case 5:
            PS.statusText("The kingdom has descended into chaos...")
            break
        case 6:
            PS.statusText("Your capabilities far exceed everyone else's...")
            break
        case 7:
            PS.statusText("You can restore order to the kingdom!")
            break
        case 8:
            PS.statusText("Do I have to...?")
            PS.statusColor(playerTextColor)
            break
        case 9:
            PS.statusText("Yes! You are the only one!")
            PS.statusColor(kingTextColor)
            break
        case 10:
            PS.statusText("Ugh... fine! What do I have to do?")
            PS.statusColor(playerTextColor)
            break
        case 11:
            PS.statusText("To prove yourself worthy of the Staff of Order, you must pass the Chaos Trials.")
            PS.statusColor(kingTextColor)
            break
        case 12:
            PS.statusText("Wait, so to restore order from chaos, I have to do something chaotic?")
            PS.statusColor(playerTextColor)
            break
        case 13:
            PS.statusText("Don't question it. I'm just doing what I was told.")
            PS.statusColor(kingTextColor)
            break
        case 14:
            PS.statusText("Ok... so what are these chaos trials you speak of?")
            PS.statusColor(playerTextColor)
            gameSequence = 1
            break
        default:
            break
    }
    introDialogueNumber++
}

const chaosTrialsTutorial = () => {
    switch (chaosTrialTutorialNumber) {
        case 0:
            PS.statusText("The chaos trials consists of 10 quicktime trials.")
            PS.statusColor(PS.COLOR_BLACK)
            break
        case 1:
            PS.statusText("Each trial is a random quicktime minigame.")
            break
        case 2:
            PS.statusText("Failing 2 of the 10 trials means you are not worthy!")
            break
        case 3:
            PS.statusText("Instructions for each game will be quick, good luck!")
            gameSequence = 2
            break
        default:
            break
    }
    chaosTrialTutorialNumber++
}

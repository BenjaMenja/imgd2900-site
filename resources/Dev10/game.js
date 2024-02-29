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
const backgroundGrey = 0x464646
const timerGreen = 0x85FF62

let timerInProgress = false

let gameSequence = 2
let round = 1
let fails = 0
let failFlag = false

let introSprite
let introDialogueNumber = 0

let chaosTrialTutorialNumber = 0

let lastUsedTrial = -1
let trialsInProgress = false

let selectColorTrialColor
let dodgeColorTrialColor
let dodgeColorYPos = 29
let crownTrialPosition
let KeyTrialKey

let moveCursorSteps = 0

PS.init = function( system, options ) {
    PS.seed(PS.date().time)
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
    if (gameSequence === 4) {
        if (PS.color(x, y) === selectColorTrialColor) {
            timerInProgress = false
            trialSuccess()
        }
        else if (PS.color(x, y) !== backgroundGrey) {
            timerInProgress = false
            trialFailure()
        }
    }

    if (gameSequence === 6) {
        if (PS.color(x, y) !== selectColorTrialColor && PS.color(x, y) !== backgroundGrey) {
            timerInProgress = false
            trialSuccess()
        }
        else if (PS.color(x, y) !== backgroundGrey) {
            timerInProgress = false
            trialFailure()
        }
    }

    if (gameSequence === 7) {
        if (x === 1 && y === 16 && crownTrialPosition === 0) {
            timerInProgress = false
            trialSuccess()
        }
        else if (x === 8 && y === 16 && crownTrialPosition === 1) {
            timerInProgress = false
            trialSuccess()
        }
        else if (x === 15 && y === 16 && crownTrialPosition === 2) {
            timerInProgress = false
            trialSuccess()
        }
        else if (x === 22 && y === 16 && crownTrialPosition === 3) {
            timerInProgress = false
            trialSuccess()
        }
        else if (x === 29 && y === 16 && crownTrialPosition === 4) {
            timerInProgress = false
            trialSuccess()
        }
        else if (PS.glyph(x, y) !== 0) {
            timerInProgress = false
            trialFailure()
        }
    }
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
    if (gameSequence === 8) {
        failFlag = true
    }

    if (gameSequence === 10 && timerInProgress) {
        moveCursorSteps++
        if (moveCursorSteps === 50) {
            PS.color(15, 18, PS.COLOR_RED)
        }
        if (moveCursorSteps === 100) {
            PS.color(15, 17, PS.COLOR_RED)
        }
        if (moveCursorSteps === 150) {
            PS.color(15, 16, PS.COLOR_RED)
        }
        if (moveCursorSteps === 200) {
            PS.color(15, 15, PS.COLOR_RED)
        }
        if (moveCursorSteps === 250) {
            PS.color(15, 14, PS.COLOR_RED)
        }
        if (moveCursorSteps === 300) {
            PS.color(15, 13, PS.COLOR_RED)
            timerInProgress = false
            trialSuccess()
        }
    }
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
    if (gameSequence === 8) {
        failFlag = true
    }
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
    if (key === 84 || key === 116 && !trialsInProgress) { // [Tt]
        switch (gameSequence) {
            case 0:
                intro()
                break
            case 1:
                chaosTrialsTutorial()
                break
            case 2:
                PS.gridSize(31, 32)
                PS.border(PS.ALL, PS.ALL, 0)
                PS.borderAlpha(PS.ALL, PS.ALL, 0)
                PS.glyph(8, 31, 'R')
                PS.glyph(9, 31, 'O')
                PS.glyph(10, 31, 'U')
                PS.glyph(11, 31, 'N')
                PS.glyph(12, 31, 'D')
                PS.glyph(13, 31, ':')
                PS.glyph(15, 31, '1')
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
                PS.glyph(8, 1, 'T')
                PS.glyph(9, 1, 'I')
                PS.glyph(10, 1, 'M')
                PS.glyph(11, 1, 'E')
                PS.glyph(12, 1, 'R')
                PS.glyph(13, 1, ':')
                PS.color(PS.ALL, PS.ALL, backgroundGrey)
                PS.color(PS.ALL, 0, PS.COLOR_BLACK)
                PS.color(PS.ALL, 1, PS.COLOR_BLACK)
                PS.color(PS.ALL, 2, PS.COLOR_BLACK)
                PS.color(PS.ALL, 30, PS.COLOR_BLACK)
                PS.color(PS.ALL, 31, PS.COLOR_BLACK)
                for (let x=15; x<=19; x++) {
                    PS.color(x, 1, backgroundGrey)
                }
                PS.glyphColor(PS.ALL, 0, PS.COLOR_WHITE)
                PS.glyphColor(PS.ALL, 1, PS.COLOR_WHITE)
                PS.glyphColor(PS.ALL, 2, PS.COLOR_WHITE)
                PS.glyphColor(PS.ALL, 30, PS.COLOR_WHITE)
                PS.glyphColor(PS.ALL, 31, PS.COLOR_WHITE)
                gameSequence = 3
                break
            case 3:
                trialsInProgress = true
                generateTrial()
                break
            default:
                break
        }
    }

    if (gameSequence === 5) {
        // Spacebar in the dodge gamemode to jump
        if (key === 32 && dodgeColorYPos === 29) {
            let timer = 0
            const timerID = PS.timerStart(1, () => {
                timer++
                if (timer === 1) {
                    PS.color(2, 28, playerTextColor)
                    PS.color(2, 29, backgroundGrey)
                    dodgeColorYPos--
                }
                if (timer === 6) {
                    PS.color(2, 27, playerTextColor)
                    PS.color(2, 28, backgroundGrey)
                    dodgeColorYPos--
                }
                if (timer === 10) {
                    PS.color(2, 26, playerTextColor)
                    PS.color(2, 27, backgroundGrey)
                    dodgeColorYPos--
                }
                if (timer === 15) {
                    PS.color(2, 25, playerTextColor)
                    PS.color(2, 26, backgroundGrey)
                    dodgeColorYPos--
                }
                if (timer === 19) {
                    PS.color(2, 26, playerTextColor)
                    PS.color(2, 25, backgroundGrey)
                    dodgeColorYPos++
                }
                if (timer === 23) {
                    PS.color(2, 27, playerTextColor)
                    PS.color(2, 26, backgroundGrey)
                    dodgeColorYPos++
                }
                if (timer === 27) {
                    PS.color(2, 28, playerTextColor)
                    PS.color(2, 27, backgroundGrey)
                    dodgeColorYPos++
                }
                if (timer === 30) {
                    PS.color(2, 29, playerTextColor)
                    PS.color(2, 28, backgroundGrey)
                    dodgeColorYPos++
                    PS.timerStop(timerID)
                }
            })
        }
    }

    if (gameSequence === 9) {
        if (key === KeyTrialKey) {
            timerInProgress = false
            trialSuccess()
        }
        else {
            timerInProgress = false
            trialFailure()
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

const updateRound = (roundNum) => {
    PS.glyph(15, 31, roundNum.toString())
}

const updateFails = (failNum) => {
    PS.glyph(15, 30, failNum.toString())
}

const wipeScreen = () => {
    for (let x=0; x<=30; x++) {
        for (let y=3; y<=29; y++) {
            PS.color(x, y, backgroundGrey)
            PS.glyph(x, y, 0)
        }
    }
}

const trialSuccess = () => {
    PS.statusText("Success!")
    gameSequence = 3
    for (let x=15; x<=19; x++) {
        PS.color(x, 1, backgroundGrey)
    }
    setTimeout(() => {
        round++
        updateRound(round)
        generateTrial()
    }, 3000)
}

const trialFailure = () => {
    fails++
    failFlag = false
    updateFails(fails)
    gameSequence = 3
    for (let x=15; x<=19; x++) {
        PS.color(x, 1, backgroundGrey)
    }
    PS.statusText("Failure!")
    setTimeout(() => {
        round++
        updateRound(round)
        generateTrial()
    }, 3000)
}

const timerDisplay = () => {
    let timer = 0
    timerInProgress = true
    for (let x=15; x<=19; x++) {
        PS.color(x, 1, timerGreen)
    }
    if (gameSequence === 8) {
        let timerID = PS.timerStart(1, () => {
            timer++
            if (timer >= 300) {
                timerInProgress = false
                PS.timerStop(timerID)
                trialSuccess()
            }
            if (failFlag) {
                timerInProgress = false
                PS.timerStop(timerID)
                trialFailure()
            }
            if (timer === 60) {
                PS.color(19, 1, backgroundGrey)
            }
            if (timer === 120) {
                PS.color(18, 1, backgroundGrey)
            }
            if (timer === 180) {
                PS.color(17, 1, backgroundGrey)
            }
            if (timer === 240) {
                PS.color(16, 1, backgroundGrey)
            }
            if (timer === 299) {
                PS.color(15, 1, backgroundGrey)
            }
        })
    }
    else {
        let timerID = PS.timerStart(1, () => {
            timer++
            if (!timerInProgress) {
                PS.timerStop(timerID)
            }
            if (timer >= 300) {
                timerInProgress = false
                PS.timerStop(timerID)
                trialFailure()
            }
            if (timer === 60) {
                PS.color(19, 1, backgroundGrey)
            }
            if (timer === 120) {
                PS.color(18, 1, backgroundGrey)
            }
            if (timer === 180) {
                PS.color(17, 1, backgroundGrey)
            }
            if (timer === 240) {
                PS.color(16, 1, backgroundGrey)
            }
            if (timer === 299) {
                PS.color(15, 1, backgroundGrey)
            }
        })
    }
}

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
            PS.statusText("To prove yourself worthy of the Staff of Order...")
            PS.statusColor(kingTextColor)
            break
        case 12:
            PS.statusText("You must complete the chaos trials.")
            break
        case 13:
            PS.statusText("Wait, so to restore order from chaos...")
            PS.statusColor(playerTextColor)
            break
        case 14:
            PS.statusText("I have to do something chaotic?")
            break
        case 15:
            PS.statusText("Don't question it...")
            PS.statusColor(kingTextColor)
            break
        case 16:
            PS.statusText("I'm just doing what I was told.")
            break
        case 17:
            PS.statusText("Ok... so what are these chaos trials exactly?")
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
            PS.statusText("The chaos trials consists of 10 trials.")
            PS.statusColor(PS.COLOR_BLACK)
            break
        case 1:
            PS.statusText("Each trial is a random quicktime minigame.")
            break
        case 2:
            PS.statusText("Don't fail more than 1 trial!")
            break
        case 3:
            PS.statusText("It means you are not worthy!")
            break
        case 4:
            PS.statusText("Instructions for each game will be quick!")
            break
        case 5:
            PS.statusText("Good luck!")
            gameSequence = 2
            break
        default:
            break
    }
    chaosTrialTutorialNumber++
}

const generateTrial = () => {
    let trial = PS.random(trials.length)
    while (trial === lastUsedTrial) {
        trial = PS.random(trials.length)
    }
    lastUsedTrial = trial
    wipeScreen()
    trials[trial - 1]()
    PS.gridRefresh()
    console.log(trial - 1)
}

const trial_selectColor = () => {
    const colors = [PS.COLOR_RED, PS.COLOR_GREEN, PS.COLOR_BLUE, PS.COLOR_VIOLET, PS.COLOR_ORANGE]
    const colornames = ["Red", "Green", "Blue", "Purple", "Orange"]
    const index = PS.random(colors.length) - 1
    selectColorTrialColor = colors[index]
    PS.statusText("Select " + colornames[index] + "!")
    PS.color(1, 16, colors[0])
    PS.color(8, 16, colors[1])
    PS.color(15, 16, colors[2])
    PS.color(22, 16, colors[3])
    PS.color(29, 16, colors[4])
    timerDisplay()
    gameSequence = 4
}

const trial_dodgeColor = () => {
    const colors = [PS.COLOR_RED, PS.COLOR_GREEN, PS.COLOR_YELLOW, PS.COLOR_VIOLET, PS.COLOR_ORANGE]
    const colornames = ["Red", "Green", "Yellow", "Purple", "Orange"]
    const index = PS.random(colors.length) - 1
    dodgeColorTrialColor = colors[index]
    const dummyDodgeColor = (index !== 4 ? colors[index + 1] : colors[0])
    PS.statusText("Dodge the " + colornames[index] + " tiles!")
    PS.color(2, 29, playerTextColor)
    gameSequence = 5
    let timer = 0
    timerInProgress = true
    const timerID = PS.timerStart(3, () => {
        timer++
        for (let x=1; x <= 30; x++) {
            if (PS.color(x, 27) === dodgeColorTrialColor) {
                if (PS.color(x-1, 27) === playerTextColor) {
                    timerInProgress = false
                    PS.timerStop(timerID)
                    trialFailure()
                }
                PS.color(x-1, 27, dodgeColorTrialColor)
                PS.color(x, 27, backgroundGrey)
            }
            if (PS.color(x, 29) === dodgeColorTrialColor) {
                if (PS.color(x-1, 29) === playerTextColor) {
                    timerInProgress = false
                    PS.timerStop(timerID)
                    trialFailure()
                }
                PS.color(x-1, 29, dodgeColorTrialColor)
                PS.color(x, 29, backgroundGrey)
            }
            if (PS.color(x, 27) === dummyDodgeColor) {
                if (PS.color(x-1, 27) !== playerTextColor) {
                    PS.color(x-1, 27, dummyDodgeColor)
                }
                PS.color(x, 27, backgroundGrey)
            }
            if (PS.color(x, 29) === dummyDodgeColor) {
                if (PS.color(x-1, 29) !== playerTextColor) {
                    PS.color(x-1, 29, dummyDodgeColor)
                }
                PS.color(x, 29, backgroundGrey)
            }
        }
        if (timer % 15 === 0) {
            const rand = PS.random(4)
            switch (rand) {
                case 1:
                    PS.color(30, 29, dodgeColorTrialColor)
                    break
                case 2:
                    PS.color(30, 29, dummyDodgeColor)
                    break
                case 3:
                    PS.color(30, 29, dodgeColorTrialColor)
                    PS.color(30, 27, dummyDodgeColor)
                    break
                case 4:
                    PS.color(30, 29, dummyDodgeColor)
                    PS.color(30, 27, dodgeColorTrialColor)
                    break
                default:
                    break
            }
        }
        if (timer === 200) {
            timerInProgress = false
            PS.timerStop(timerID)
            trialSuccess()
        }
    })
}

const trial_DontSelectColor = () => {
    const colors = [PS.COLOR_RED, PS.COLOR_GREEN, PS.COLOR_BLUE, PS.COLOR_VIOLET, PS.COLOR_ORANGE]
    const colornames = ["Red", "Green", "Blue", "Purple", "Orange"]
    const index = PS.random(colors.length) - 1
    selectColorTrialColor = colors[index]
    PS.statusText("Don't select " + colornames[index] + "!")
    PS.color(1, 16, colors[0])
    PS.color(8, 16, colors[1])
    PS.color(15, 16, colors[2])
    PS.color(22, 16, colors[3])
    PS.color(29, 16, colors[4])
    timerDisplay()
    gameSequence = 6
}

const trial_ClickTheCrown = () => {
    const emojis = [0x1F451, 0x1F31F, 0x2B50, 0x1F505, 0x1F7E1] // Crown, Glowing Star, Star, Low brightness, yellow circle
    for (let i = emojis.length - 1; i > 0; i--) { // Shuffle Algorithm

        let j = Math.floor(Math.random() * (i + 1));

        let temp = emojis[i];
        emojis[i] = emojis[j];
        emojis[j] = temp;
    }
    for (let i=0; i<emojis.length; i++) {
        if (emojis[i] === 0x1F451) {
            crownTrialPosition = i
            break
        }
    }

    PS.statusText("Click the crown!")
    PS.color(1, 16, PS.COLOR_BLACK)
    PS.color(8, 16, PS.COLOR_BLACK)
    PS.color(15, 16, PS.COLOR_BLACK)
    PS.color(22, 16, PS.COLOR_BLACK)
    PS.color(29, 16, PS.COLOR_BLACK)
    PS.glyph(1, 16, emojis[0])
    PS.glyph(8, 16, emojis[1])
    PS.glyph(15, 16, emojis[2])
    PS.glyph(22, 16, emojis[3])
    PS.glyph(29, 16, emojis[4])

    timerDisplay()
    gameSequence = 7
}

const trial_DontMoveCursor = () => {
    PS.statusText("Don't move!")
    gameSequence = 8
    setTimeout(() => {
        timerDisplay()
    }, 500)
}

const trial_PressKey = () => {
    KeyTrialKey = PS.random(26) + 96
    PS.statusText("Press " + "\'" + String.fromCharCode(KeyTrialKey) + "\'!")
    gameSequence = 9
    timerDisplay()
}

const trial_MoveCursorALot = () => {
    PS.statusText("Move your cursor a bunch!")
    gameSequence = 10
    for (let x=13; x <= 17; x++) {
        PS.glyphColor(x, 12, PS.COLOR_WHITE)
        for (let y=12; y <= 19; y++) {
            PS.color(x, y, PS.COLOR_BLACK)
        }
    }

    for (let y=13; y<=18; y++) {
        PS.color(15, y, backgroundGrey)
    }

    PS.glyph(13, 12, 'M')
    PS.glyph(14, 12, 'E')
    PS.glyph(15, 12, 'T')
    PS.glyph(16, 12, 'E')
    PS.glyph(17, 12, 'R')

    timerDisplay()
}

// Trials
const trials = [trial_selectColor, trial_dodgeColor, trial_DontSelectColor, trial_ClickTheCrown, trial_DontMoveCursor, trial_PressKey, trial_MoveCursorALot]

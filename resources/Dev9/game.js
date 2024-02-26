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

let ship

let asteroidSpriteData
let asteroidSpeedSpriteData
let asteroidBigSpriteData
let explosion0Data
let explosion1Data
let explosion2Data
let explosion3Data
let shipPowerupSpriteData
let laserPowerupSpriteData

let shotCooldown = 0
let pointsOnes = 0
let pointsTens = 0
let dead = false
let win = false
let canRestart = false
let increasedSpawnsTimer

let levelNum = 1

let asteroids = []
let lasers = []
let explosions = []
let powerups = []
let pointreqs = [8, 16, 24, 32]

PS.init = function( system, options ) {
    PS.gridSize(32,32)
    PS.seed(PS.date().time)

    PS.imageLoad("images/asteroid.png", (data) => {
        asteroidSpriteData = data
        new Asteroid(PS.spriteImage(data), 31, PS.random(28) - 1, 'r')
    })

    PS.imageLoad("images/asteroid_speed.png", (data) => {
        asteroidSpeedSpriteData = data
    })

    PS.imageLoad("images/asteroid_big.png", (data) => {
        asteroidBigSpriteData = data
    })

    PS.imageLoad("images/spaceship.png", (data) => {
        ship = new Ship(PS.spriteImage(data), 0, 0, 6, 5)
        PS.spriteCollide(ship.sprite, handleShipCollision)
    })

    PS.imageLoad("images/explosion_0.png", (data) => {
        explosion0Data = data
    })

    PS.imageLoad("images/explosion_1.png", (data) => {
        explosion1Data = data
    })

    PS.imageLoad("images/explosion_2.png", (data) => {
        explosion2Data = data
    })

    PS.imageLoad("images/explosion_3.png", (data) => {
        explosion3Data = data
    })

    PS.imageLoad("images/ship_powerup.png", (data) => {
        shipPowerupSpriteData = data
    })

    PS.imageLoad("images/laser_powerup.png", (data) => {
        laserPowerupSpriteData = data
    })

    PS.border(PS.ALL, PS.ALL, 0)
    PS.bgColor(PS.ALL, PS.ALL, PS.COLOR_BLACK)
    PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK)
    PS.bgAlpha(PS.ALL, PS.ALL, 255)
    PS.timerStart(1, updateTick)
    PS.timerStart(10, updateSlow)
    PS.timerStart(5, updateFast)
    PS.timerStart(8, powerupFallSpeed)
    PS.keyRepeat(true, 6, 6)

    PS.statusText("Space Escape: Level " + levelNum)

    PS.glyph(8, 31, 'P')
    PS.glyph(9, 31, 'O')
    PS.glyph(10, 31, 'I')
    PS.glyph(11, 31, 'N')
    PS.glyph(12, 31, 'T')
    PS.glyph(13, 31, 'S')
    PS.glyph(15, 31, pointsTens.toString())
    PS.glyph(16, 31, pointsOnes.toString())
    PS.glyph(17, 31, '/')
    PS.glyph(18, 31, '0')
    PS.glyph(19, 31, '8')

    PS.glyphColor(PS.ALL, PS.ALL, PS.COLOR_WHITE)
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
    if (!dead && !win) {
        if (key === PS.KEY_ARROW_DOWN && ship.y < 27) {
            ship.y++
            ship.tip.y++
            PS.spriteMove(ship.sprite, ship.x, ship.y)
        }
        if (key === PS.KEY_ARROW_UP && ship.y > 0) {
            ship.y--
            ship.tip.y--
            PS.spriteMove(ship.sprite, ship.x, ship.y)
        }

        if (key === 83 || key === 115 && shotCooldown <= 0) {
            new Laser(ship.tip.x+1, ship.tip.y)
            if (ship.laserUpgradeTimer >= 0) {
                shotCooldown = 20
            }
            else {
                shotCooldown = 45
            }
        }
    }

    if (key === 82 || key === 114 && canRestart) {
        restartGame()
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

const Asteroid = function(sprite, x, y, type, health = 1) {
    this.sprite = sprite
    this.x = x
    this.y = y
    this.width = 4
    this.height = 4
    this.type = type
    this.health = health
    asteroids.push(this)
}

const Laser = function(x, y) {
    PS.audioPlay("fx_shoot3", {volume: 0.25})
    const sprite = PS.spriteSolid(2, 1)
    PS.spriteSolidColor(sprite, PS.COLOR_RED)
    this.sprite = sprite
    this.x = x
    this.y = y
    this.width = 2
    this.height = 1
    PS.spriteCollide(sprite, breakAsteroid)
    lasers.push(this)
}

const Ship = function(sprite, x, y, width, height) {
    this.sprite = sprite
    this.x = x
    this.y = y
    this.width = 2
    this.height = 1
    this.shipUpgradeTimer = -1
    this.laserUpgradeTimer = -1
    this.tip = {x: x + 5, y: y + 2}
    PS.spriteMove(sprite, x, y)
}

const Explosion = function(sprite, x, y) {
    this.sprite = sprite
    this.x = x
    this.y = y
    this.life = 0
    PS.spriteMove(sprite, x, y)
    explosions.push(this)
}

const Powerup = function(sprite, x, y, type) {
    this.sprite = sprite
    this.x = x
    this.y = y
    this.type = type
    PS.spriteMove(sprite, x, y)
    PS.spriteCollide(sprite, powerupCollide)
    powerups.push(this)
}

const updateSlow = () => {
    moveAsteroids()
}

const updateFast = () => {
    moveLasers()
}

const updateTick = () => {
    if (shotCooldown > 0) {
        shotCooldown--
    }
    if (win) {
        asteroids.forEach((asteroid) => {
            PS.spriteDelete(asteroid.sprite)
        })
        asteroids.length = 0
    }
    explosionUpdater()
    shipUpdater()

    powerups.forEach((powerup) => {
        if (!PS.spriteShow(powerup.sprite)) {
            PS.spriteDelete(powerup.sprite)
            const index = powerups.indexOf(powerup)
            powerups.splice(index, 1)
        }
    })
}

const powerupFallSpeed = () => {
    powerupUpdater()
}

const spawnAsteroid = () => {
    const x = PS.random(10) + 32
    const y = PS.random(28) - 1
    const rand = PS.random(10)
    switch (levelNum) {
        case 1:
            new Asteroid(PS.spriteImage(asteroidSpriteData), x, y, 'r')
            break
        case 2:
            if (rand > 5) {
                new Asteroid(PS.spriteImage(asteroidSpriteData), x, y, 'r')
            }
            else {
                new Asteroid(PS.spriteImage(asteroidSpeedSpriteData), x, y, 's')
            }
            break
        case 3:
            if (rand > 5) {
                new Asteroid(PS.spriteImage(asteroidSpriteData), x, y, 'r')
            }
            else if (rand >= 1 && rand < 4) {
                new Asteroid(PS.spriteImage(asteroidSpeedSpriteData), x, y, 's')
            }
            else {
                new Asteroid(PS.spriteImage(asteroidBigSpriteData), x, y, 'b', 3)
            }
            break
        case 4:
            if (rand === 1 || rand === 2) {
                new Asteroid(PS.spriteImage(asteroidSpriteData), x, y, 'r')
            }
            else if (rand >= 3 && rand <= 8) {
                new Asteroid(PS.spriteImage(asteroidSpeedSpriteData), x, y, 's')
            }
            else {
                new Asteroid(PS.spriteImage(asteroidBigSpriteData), x, y, 'b', 3)
            }
            break
        default:
            break
    }
}

const incrementPoints = (num = 1) => {
    pointsOnes += num
    if (pointsOnes >= 10) {
        pointsTens++
        pointsOnes -= 10
    }
    PS.glyph(15, 31, pointsTens.toString())
    PS.glyph(16, 31, pointsOnes.toString())
    if (pointsTens * 10 + pointsOnes >= pointreqs[levelNum - 1]) {
        newRound()
    }
}

const explosionUpdater = () => {
    explosions.forEach((explosion) => {
        explosion.life++
        if (explosion.life === 3) {
            explosion.sprite = PS.spriteImage(explosion1Data)
            PS.spriteMove(explosion.sprite, explosion.x, explosion.y)
        }
        if (explosion.life === 6) {
            explosion.sprite = PS.spriteImage(explosion2Data)
            PS.spriteMove(explosion.sprite, explosion.x, explosion.y)
        }
        if (explosion.life === 9) {
            explosion.sprite = PS.spriteImage(explosion3Data)
            PS.spriteMove(explosion.sprite, explosion.x, explosion.y)
        }
        if (explosion.life === 12) {
            PS.spriteShow(explosion.sprite, false)
        }
    })

    explosions.forEach((explosion) => {
        if (!PS.spriteShow(explosion.sprite)) {
            PS.spriteDelete(explosion.sprite)
            const index = explosions.indexOf(explosion)
            explosions.splice(index, 1)
        }
    })
}

const powerupUpdater = () => {
    powerups.forEach((powerup) => {
        PS.spriteMove(powerup.sprite, powerup.x, powerup.y)
        powerup.y = powerup.y + 1
        if (powerup.y >= 26) {
            PS.spriteShow(powerup.sprite, false)
        }
    })
}

const shipUpdater = () => {
    if (ship) {
        if (ship.shipUpgradeTimer >= 0) {
            ship.shipUpgradeTimer = ship.shipUpgradeTimer + 1
        }

        if (ship.laserUpgradeTimer >= 0) {
            ship.laserUpgradeTimer = ship.laserUpgradeTimer + 1
        }

        if (ship.shipUpgradeTimer >= 360) {
            ship.shipUpgradeTimer = -1
            PS.keyRepeat(true, 6, 6)
        }

        if (ship.laserUpgradeTimer >= 360) {
            ship.laserUpgradeTimer = -1
        }
    }
}

const newRound = () => {
    PS.audioPlay("fx_powerup2")
    levelNum++
    pointsTens = 0
    pointsOnes = 0
    PS.glyph(15, 31, pointsTens.toString())
    PS.glyph(16, 31, pointsOnes.toString())

    switch(levelNum) {
        case 2:
            PS.glyph(18, 31, '1')
            PS.glyph(19, 31, '6')
            break
        case 3:
            PS.glyph(18, 31, '2')
            PS.glyph(19, 31, '4')
            break
        case 4:
            PS.glyph(18, 31, '3')
            PS.glyph(19, 31, '2')
            break
        default:
            break
    }

    PS.statusText("Space Escape: Level " + levelNum)

    if (levelNum === 4) {
        increasedSpawnsTimer = PS.timerStart(150, () => {
            spawnAsteroid()
        })
    }
    if (levelNum === 5) {
        winScreen()
    }
}

const shipDestroy = () => {
    PS.spriteShow(ship.sprite, false)
    dead = true
    PS.statusText("You were destroyed...")
    PS.audioPlay("fx_blast1")
    setTimeout(() => {
        canRestart = true
        PS.statusText("Press 'r' to restart.")
    }, 3000)
}

const winScreen = () => {
    win = true
    PS.statusText("You win!")
}

const restartGame = () => {
    if (levelNum === 4) {
        PS.timerStop(increasedSpawnsTimer)
    }

    levelNum = 1
    pointsOnes = 0
    pointsTens = 0
    PS.glyph(15, 31, pointsTens.toString())
    PS.glyph(16, 31, pointsOnes.toString())
    PS.glyph(18, 31, '0')
    PS.glyph(19, 31, '8')

    ship.x = 0
    ship.y = 0
    ship.tip = {x: 5, y: 2}
    PS.spriteMove(ship.sprite, ship.x, ship.y)
    PS.spriteShow(ship.sprite, true)
    dead = false
    win = false

    PS.statusText("Space Escape: Level " + levelNum)

    lasers.forEach((laser) => {
        PS.spriteDelete(laser.sprite)
    })
    lasers.length = 0

    asteroids.forEach((asteroid) => {
        PS.spriteDelete(asteroid.sprite)
    })
    asteroids.length = 0
    spawnAsteroid()
}

const moveAsteroids = () => {
    if (asteroids.length === 0) {
        spawnAsteroid()
        if (PS.random(10) > 5) { // 50% chance to spawn new asteroid
            spawnAsteroid()
        }
    }
    asteroids.forEach((a) => {
        PS.spriteMove(a.sprite, a.x, a.y)
        a.x = a.x - 1
        if (a.type === 's' && PS.random(10) <= 4) { // 40% chance for speed asteroid to move another step
            PS.spriteMove(a.sprite, a.x, a.y)
            a.x = a.x - 1
        }
        if (a.x + a.width < 0) {
            const newX = PS.random(10) + 32
            const newY = PS.random(28) - 1
            PS.spriteMove(a.sprite, newX, newY)
            a.x = newX
            a.y = newY
            if (PS.random(10) > 5) { // 50% chance to spawn new asteroid
                spawnAsteroid()
            }
        }
        if (!PS.spriteShow(a.sprite)) {
            PS.spriteDelete(a.sprite)
            const index = asteroids.indexOf(a)
            asteroids.splice(index, 1)
        }
    })
}

const moveLasers = () => {
    lasers.forEach((laser) => {
        PS.spriteMove(laser.sprite, laser.x, laser.y)
        laser.x = laser.x + 1
        if (laser.x > 32 || !PS.spriteShow(laser.sprite)) {
            PS.spriteDelete(laser.sprite)
            const index = lasers.indexOf(laser)
            lasers.splice(index, 1)
        }
    })
}

const explosionEffect = (x, y) => {
    PS.audioPlay("fx_bang")
    new Explosion(PS.spriteImage(explosion0Data), x, y)
    if (PS.random(5) === 1) {
        if (PS.random(2) === 1) {
            new Powerup(PS.spriteImage(shipPowerupSpriteData), x, -5, 'ship')
        }
        else {
            new Powerup(PS.spriteImage(laserPowerupSpriteData), x, -5, 'laser')
        }
    }
}

const handleShipCollision = (s1, p1, s2, p2, type) => {
    asteroids.every((asteroid) => {
        if (type === PS.SPRITE_OVERLAP && asteroid.sprite === s2) {
            shipDestroy()
            return false
        }
    })
}

const breakAsteroid = (s1, p1, s2, p2, type) => {
    asteroids.every((asteroid) => {
        if (asteroid.type !== 'b' && type === PS.SPRITE_OVERLAP && (asteroid.sprite === s2 || asteroid.sprite === s1)) {
            PS.spriteShow(s1, false)
            PS.spriteShow(s2, false)
            incrementPoints()
            explosionEffect(asteroid.x, asteroid.y)
            return false
        }

        if (asteroid.type === 'b' && type === PS.SPRITE_OVERLAP && (asteroid.sprite === s2 || asteroid.sprite === s1)) {
            asteroid.health--
            PS.spriteShow(s2, false)
            if (asteroid.health === 0) {
                PS.spriteShow(s1, false)
                PS.spriteShow(s2, false)
                incrementPoints(2)
                explosionEffect(asteroid.x, asteroid.y)
                return false
            }
        }
    })
}

const powerupCollide = (s1, p1, s2, p2, type) => {
    lasers.every((laser) => {
        if (laser.sprite === s2 && type === PS.SPRITE_OVERLAP) {
            PS.spriteShow(s1, false)
            PS.spriteShow(s2, false)
            powerups.every((powerup) => {
                if (powerup.sprite === s1) {
                    PS.audioPlay("fx_coin2")
                    if (powerup.type === 'ship') {
                        PS.keyRepeat(true, 4, 4)
                        ship.shipUpgradeTimer = 0
                    }
                    else if (powerup.type === 'laser') {
                        ship.laserUpgradeTimer = 0
                    }
                }
            })
            return false
        }
    })
}

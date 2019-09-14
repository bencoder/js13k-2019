const STATE_TITLE = 0
const STATE_FADEIN = 1
const STATE_PLAY = 2
const STATE_DEAD = 3
const STATE_FADEOUT = 4
const STATE_COMPLETE = 5

function Game(levels) {
  let level
  let player
  let ghosts = []
  let currentTick = 0
  let history = []
  let currentLevel = 0
  let fadeTimer = 0
  let state = STATE_TITLE

  const elementL = document.getElementById('L')

  let levelNameShowed = -1

  function showLevelName() {
    elementL.innerText = level.last ? 'THE MEMORY CORE' : `Level ${currentLevel}`
    elementL.className = 'a'
    setTimeout(() => {
      elementL.className = ''
    }, 2000)
  }

  let buttons = {}

  const reset = () => {
    for (const g of ghosts) {
      g.reset()
    }
    ghosts.push(new Ghost(history, level))
    if (ghosts.length > settings_maxGhosts) {
      ghosts.shift()
    }
    currentTick = 0
    history = []

    //reset level and player
    level.reset()
    player = new Player(level)
    state = STATE_FADEIN
    Draw.scale = 1.5
  }

  const die = () => {
    Sounds.death()
    state = STATE_DEAD
  }

  this.draw = (accumulator, frameTime, timeDelta) => {
    Draw.accumulator = accumulator
    switch (state) {
      case STATE_TITLE:
        Draw.titleScreen()
        break
      case STATE_FADEIN:
      case STATE_FADEOUT:
      case STATE_DEAD:
      case STATE_PLAY:
        Draw.setCamera(player.position, player.movementVector)
        Draw.bg()
        Draw.level(level.getLevel(), frameTime, timeDelta, state)
        Draw.player(player)
        if (state === STATE_PLAY) {
          for (const g of ghosts) {
            Draw.ghost(g)
          }
        }
        Draw.timer(currentTick / settings_tps)
        break
      case STATE_COMPLETE:
        Draw.endScreen()
        break
    }
  }

  this.tick = () => {
    if (state === STATE_FADEIN && levelNameShowed !== currentLevel) {
      levelNameShowed = currentLevel
      showLevelName()
    }

    if (state === STATE_FADEIN || state === STATE_FADEOUT) {
      if (fadeTimer > 0) {
        fadeTimer -= 1 / settings_tps
      }
    }

    if (state === STATE_DEAD) {
      let mv = new Vec2(0, 0)
      while (mv.len() < 40 && currentTick > 0) {
        --currentTick
        mv = mv.sub(history[currentTick])
      }
      Draw.scale /= 0.95
      player.forceMove(mv)
      if (currentTick === 0) {
        reset()
      }
      return
    }

    if (state === STATE_PLAY) {
      if (level.completed) {
        state = STATE_FADEOUT
        player.movementVector = new Vec2(0, 0) //stops flickering while fading out
        fadeTimer = 1.0
        Sounds.win()
        return
      }
      if (currentTick === settings_timeToDie * settings_tps) {
        die()
        return
      }
      history[currentTick] = player.move(buttons)
      for (const g of ghosts) {
        g.tick(currentTick)
      }
      ++currentTick
    }

    if (state === STATE_FADEOUT && fadeTimer <= 0) {
      if (level.last) {
        document.body.className = 'started won'
      } else {
        this.loadLevel(currentLevel + 1)
        state = STATE_FADEIN
        fadeTimer = 1.0
      }
    }
  }

  this.buttonDown = key => {
    if (state === STATE_TITLE) {
      document.body.className = 'started'
      state = STATE_FADEIN
      fadeTimer = 1.0
      return
    }
    if (state === STATE_FADEIN && fadeTimer <= 0) {
      state = STATE_PLAY
    }
    buttons[key] = true
    if (key === 'back') {
      die()
    }
  }

  this.buttonUp = key => {
    if (key === undefined) {
      buttons = {}
    }
    buttons[key] = false
  }

  this.loadLevel = index => {
    currentLevel = index
    if (index >= levels.length) {
      state = STATE_COMPLETE
    }
    level = new Level(levels[index])
    history = []
    player = new Player(level)
    ghosts = []
    currentTick = 0
    Draw.resetCamera()
  }

  this.loadLevel(currentLevel)
}

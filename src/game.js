const STATE_TITLE = 0
const STATE_PLAY = 1
const STATE_DEAD = 2
const STATE_COMPLETE = 3

function Game(levels) {
  let level
  let player
  let ghosts = []
  let currentTick = 0
  let history = []
  let currentLevel = 0
  let state = STATE_TITLE

  const buttons = {}

  const reset = () => {
    for (const g of ghosts) {
      g.reset()
    }
    ghosts.push(new Ghost(history, level))
    currentTick = 0
    history = []

    //reset level and player
    level.reset()
    player = new Player(level)
    state = STATE_PLAY
    Draw.scale = 1.5
  }

  const die = () => {
    state = STATE_DEAD
  }

  this.draw = accumulator => {
    Draw.accumulator = accumulator
    switch (state) {
      case STATE_TITLE:
        Draw.titleScreen()
        break
      case STATE_DEAD:
      case STATE_PLAY:
        Draw.setCamera(player.position, player.movementVector)
        Draw.bg()
        Draw.level(level.getLevel())
        Draw.player(player)
        for (const g of ghosts) {
          Draw.ghost(g)
        }
        Draw.timer(currentTick / Settings.tps)
        break
      case STATE_COMPLETE:
        Draw.endScreen()
        break
    }
  }

  this.tick = () => {
    if (state === STATE_DEAD) {
      let mv = new Vec2(0, 0)
      while (mv.len() < 40 && currentTick > 0) {
        --currentTick
        mv = mv.sub(history[currentTick])
      }
      Draw.scale /= 0.95
      player.forceMove(mv)
      if (currentTick == 0) {
        reset()
      }
      return
    }

    if (state === STATE_PLAY) {
      if (level.completed) {
        this.loadLevel(currentLevel + 1)
        return
      }
      if (currentTick === Settings.timeToDie * Settings.tps) {
        state = STATE_DEAD
        return
      }
      history[currentTick] = player.move(buttons)
      for (const g of ghosts) {
        g.tick(currentTick)
      }
      ++currentTick
      return
    }
  }

  this.buttonDown = key => {
    buttons[key] = true
    if (key === 'back') {
      state = STATE_DEAD
    }
    if (state === STATE_TITLE) {
      state = STATE_PLAY
    }
  }

  this.buttonUp = key => (buttons[key] = false)

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
  }

  this.loadLevel(currentLevel)
}

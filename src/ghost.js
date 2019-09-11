const defaultMovementVector = new Vec2(0, -1)

function Ghost(history, level) {
  this.position = level.getStart()
  //stores the last movementVector
  this.movementVector = defaultMovementVector
  this._a = undefined

  this.tick = currentTick => {
    if (currentTick > history.length) {
      return
    }
    if (currentTick === history.length) {
      level.ghostRemoved(this.position, settings_playerRadius)
      this.dead = true
      return
    }

    const movementVector = history[currentTick]
    level.interact(this.position, settings_playerRadius, movementVector)
    this.position = this.position.add(movementVector) //always apply the vector, cause we're a ghost
    this.movementVector = currentTick === 0 ? defaultMovementVector : movementVector
  }

  this.reset = () => {
    this.position = level.getStart()
    this.dead = false
  }
}

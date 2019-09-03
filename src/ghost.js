function Ghost(history, level) {
  this.position = level.getStart()
  this.movementVector = new Vec2(0, 0) //stores the last movementVector

  this.tick = currentTick => {
    if (currentTick > history.length) {
      return
    }
    if (currentTick === history.length) {
      level.ghostRemoved(this.position, Settings.playerRadius)
      this.dead = true
      return
    }
    this.movementVector = history[currentTick]
    level.interact(this.position, Settings.playerRadius, this.movementVector)
    this.position = this.position.add(this.movementVector) //always apply the vector, cause we're a ghost
  }

  this.reset = () => {
    this.position = level.getStart()
    this.dead = false
  }
}

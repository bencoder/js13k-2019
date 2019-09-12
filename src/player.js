function Player(level) {
  this.position = level.getStart()
  this.movementVector = new Vec2(0, 0) //stores last movement vector
  this.drawMovementVector = new Vec2(0, -1)

  this.forceMove = v => {
    this.movementVector = v
    this.position = this.position.add(v)

    this.drawMovementVector = this.movementVector.mul(-1) //reverse so we draw correctly
  }

  this.move = buttons => {
    const movement = new Vec2(0, 0)

    if (buttons.up) {
      movement.y -= settings_playerSpeed
    }
    if (buttons.down) {
      movement.y += settings_playerSpeed
    }
    if (buttons.left) {
      movement.x -= settings_playerSpeed
    }
    if (buttons.right) {
      movement.x += settings_playerSpeed
    }
    if (movement.x || movement.y) {
      this.drawMovementVector = movement
    }

    this.movementVector = level.interact(this.position, settings_playerRadius, movement)
    this.position = this.position.add(this.movementVector)
    if (this.movementVector.x || this.movementVector.y) {
      Sounds.move()
    }

    return this.movementVector
  }
}

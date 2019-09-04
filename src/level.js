function Level(levelObject) {
  let currentLevel = JSON.parse(JSON.stringify(levelObject))

  const doesCircleCollide = (position, radius) => {
    for (let i = 0; i < currentLevel.walls.length; i++) {
      for (let j = 1; j < currentLevel.walls[i].length; j++) {
        if (doesLineInterceptCircle(currentLevel.walls[i][j - 1], currentLevel.walls[i][j], position, radius)) {
          return true
        }
      }
    }
    for (let i = 0; i < currentLevel.doors.length; i++) {
      for (let j = 1; j < currentLevel.doors[i].polygon.length; j++) {
        if (
          !currentLevel.doors[i].open &&
          doesLineInterceptCircle(
            currentLevel.doors[i].polygon[j - 1],
            currentLevel.doors[i].polygon[j],
            position,
            radius
          )
        ) {
          return true
        }
      }
    }
    return false
  }

  const toggleDoor = doorName => {
    const door = currentLevel.doors.find(d => d.name === doorName)
    door.open = !door.open
  }

  const handleSwitches = (oldPos, newPos, radius) => {
    for (const s of currentLevel.switches) {
      const switchPos = new Vec2(s.x, s.y)
      const wasTouching = oldPos.sub(switchPos).len() < radius + Settings.switchRadius
      const nowTouching = newPos.sub(switchPos).len() < radius + Settings.switchRadius
      if (!wasTouching && nowTouching) {
        if (s.pressed === 0) {
          for (const target of s.targets) {
            toggleDoor(target)
          }
        } //only toggle if you're the first one on it
        s.pressed++
      }
      if (wasTouching && !nowTouching) {
        s.pressed--
      }
      if (wasTouching && !nowTouching && s.type === 'momentary' && s.pressed === 0) {
        for (const target of s.targets) {
          toggleDoor(target)
        }
      }
    }
  }

  const handleEnd = (position, radius) => {
    const isEnded = position.sub(new Vec2(levelObject.end.x, levelObject.end.y)).len() < radius + Settings.switchRadius
    if (isEnded) {
      this.completed = true
    }
  }

  this.ghostRemoved = (position, radius) => {
    for (const s of currentLevel.switches) {
      const isTouching = position.sub(new Vec2(s.x, s.y)).len() < radius + Settings.switchRadius
      if (isTouching) {
        s.pressed--
        if (s.pressed === 0 && s.type === 'momentary') {
          toggleDoor(s.target)
        }
      }
    }
  }

  this.getStart = () => new Vec2(levelObject.start.x, levelObject.start.y)

  this.reset = () => {
    currentLevel = JSON.parse(JSON.stringify(levelObject))
  }

  this.interact = (oldPos, radius, plannedVector) => {
    const newPos = oldPos.add(plannedVector)

    if (doesCircleCollide(newPos, radius)) {
      return new Vec2(0, 0)
    }

    handleSwitches(oldPos, newPos, radius)

    handleEnd(newPos, radius)

    return plannedVector
  }

  this.getLevel = () => currentLevel
}

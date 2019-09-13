function Level(levelObject) {
  let currentLevel = JSON.parse(JSON.stringify(levelObject))

  this.last = !!currentLevel.last

  const doesCircleCollide = (position, radius) => {
    for (let i = 0; i < currentLevel.walls.length; i++) {
      for (let j = 1; j < currentLevel.walls[i].length; j++) {
        const colPos = doesLineInterceptCircle(currentLevel.walls[i][j - 1], currentLevel.walls[i][j], position, radius)
        if (colPos) {
          return doesCircleCollide(colPos, radius) || colPos
        }
      }
    }

    for (let i = 0; i < currentLevel.doors.length; i++) {
      if (currentLevel.doors[i].open) {
        continue
      }
      const colPos = doesLineInterceptCircle(
        currentLevel.doors[i].polygon[0],
        currentLevel.doors[i].polygon[1],
        position,
        radius
      )
      if (colPos) {
        return doesCircleCollide(colPos, radius) || colPos
      }
    }

    return false
  }

  const toggleDoor = doorName => {
    const door = currentLevel.doors.find(d => d.name === doorName)
    door.open = !door.open
  }

  const handleSwitches = (oldPos, newPos, radius) => {
    if (oldPos.x !== newPos.x || oldPos.y !== newPos.y) {
      for (const s of currentLevel.switches) {
        const switchPos = new Vec2(s.x, s.y)
        const wasTouching = oldPos.sub(switchPos).len() < radius + settings_switchRadius
        const nowTouching = newPos.sub(switchPos).len() < radius + settings_switchRadius

        if (!wasTouching && nowTouching) {
          //only toggle if you're the first one on it
          if (s.pressed === 0) {
            for (const target of s.targets) {
              toggleDoor(target)
            }
            Sounds.switchDown()
          }
          s.pressed++
        }
        if (wasTouching && !nowTouching && s.type !== 'single') {
          if (s.pressed <= 0) {
            continue
          }
          s.pressed--
        }
        if (wasTouching && !nowTouching && s.type === 'momentary' && s.pressed === 0) {
          for (const target of s.targets) {
            toggleDoor(target)
          }
        }
        if (wasTouching && !nowTouching && s.pressed === 0) {
          Sounds.switchUp()
        }
      }
    }
  }

  const handleEnd = (position, radius) => {
    const isEnded = position.sub(new Vec2(levelObject.end.x, levelObject.end.y)).len() < radius + settings_switchRadius
    if (isEnded) {
      this.completed = true
    }
  }

  this.ghostRemoved = (position, radius) => {
    for (const s of currentLevel.switches) {
      const isTouching = position.sub(new Vec2(s.x, s.y)).len() < radius + settings_switchRadius
      if (isTouching) {
        if (s.type !== 'single') {
          s.pressed--
        }
        if (s.pressed === 0 && s.type === 'momentary') {
          for (const target of s.targets) {
            toggleDoor(target)
          }
        }
      }
    }
  }

  this.getStart = () => new Vec2(levelObject.start.x, levelObject.start.y)

  this.reset = () => {
    currentLevel = JSON.parse(JSON.stringify(levelObject))
  }

  this.interact = (oldPos, radius, plannedVector) => {
    let newPos = oldPos.add(plannedVector)

    const collisionPosition = doesCircleCollide(newPos, radius)

    newPos = collisionPosition || newPos

    handleSwitches(oldPos, newPos, radius)

    handleEnd(newPos, radius)

    if (collisionPosition) {
      return collisionPosition.sub(oldPos)
    }

    return plannedVector
  }

  this.getLevel = () => currentLevel
}

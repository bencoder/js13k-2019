const { tmxParse, tmxArray, tmxObjectProperties, tmxPolygonPoints } = require('./tmx')

function tmxToLevel(xmlText, id) {
  const level = {
    id,
    walls: [],
    doors: [],
    switches: [],
    start: { x: 0, y: 0 },
    end: { x: 10, y: 10 }
  }

  const objectTypeMapping = {
    wall(object) {
      for (const polygon of tmxArray(object.polygon)) {
        level.walls.push(tmxPolygonPoints(polygon.points, object.x, object.y))
      }
    },

    door(object, properties) {
      level.doors.push({
        ...properties,
        name: object.name,
        polygon: tmxPolygonPoints(object.polygon.points, object.x, object.y),
        open: !!properties.open
      })
    },

    switch(object, properties) {
      level.switches.push({
        ...properties,
        x: object.x,
        y: object.y,
        name: object.name,
        targets: `${properties.target || ''}`.split(','),
        type: properties.type || 'momentary',
        pressed: 0
      })
    },

    start(object) {
      level.start.x = Math.round(object.x)
      level.start.y = Math.round(object.y)
    },

    end(object) {
      level.end.x = Math.round(object.x)
      level.end.y = Math.round(object.y)
    }
  }

  const xml = tmxParse(xmlText)
  for (const objectGroup of tmxArray(xml.map.objectgroup)) {
    for (const object of tmxArray(objectGroup.object)) {
      if (typeof objectTypeMapping[object.type] === 'function') {
        objectTypeMapping[object.type](object, tmxObjectProperties(object))
      } else {
        console.warn(`Warning, unknown object type "${object.type}". id:${object.id}`)
      }
    }
  }

  return level
}

module.exports = tmxToLevel

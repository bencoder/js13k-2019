const { tmxParse, tmxArray, tmxObjectProperties, tmxPolygonPoints } = require('./tmx')
const { orderClockwise, absHol, isClockwiseOrdered } = require('fernandez-polygon-decomposition')

/**
 *
 * @param {{x:number,y:number}[]} polygon
 */
function orderCounterClockwise(polygon) {
  if (isClockwiseOrdered(polygon)) {
    return polygon.reverse()
  }
  return polygon
}

class TmxToLevelConverter {
  constructor() {
    this.idCounter = 0
  }

  tmxToLevel(xmlText, id) {
    const level = {
      id,
      walls: [],
      polys: [],
      doors: [],
      switches: [],
      start: { x: 0, y: 0 },
      end: { x: 10, y: 10 }
    }

    const objectTypeMapping = {
      wall(object) {
        for (const polygon of tmxArray(object.polygon)) {
          const points = orderClockwise(tmxPolygonPoints(polygon.points, object.x, object.y))

          // Polygons are all counterclockwise
          try {
            level.polys.push(...absHol(points).map(orderCounterClockwise))
          } catch (_e) {
            level.polys.push(points)
          }
          level.walls.push(orderCounterClockwise(points))
        }
      },

      door(object, properties) {
        level.doors.push({
          name: object.name,
          polygon: tmxPolygonPoints(object.polygon.points, object.x, object.y),
          open: !!properties.open
        })
      },

      switch(object, properties) {
        level.switches.push({
          uid: this.idCounter++,
          x: object.x,
          y: object.y,
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
        const f = objectTypeMapping[object.type]
        if (typeof f === 'function') {
          f.call(this, object, tmxObjectProperties(object))
        } else {
          console.warn(`Warning, unknown object type "${object.type}". id:${object.id}`)
        }
      }
    }

    return level
  }
}

module.exports = TmxToLevelConverter

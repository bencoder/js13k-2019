const xmlParser = require('fast-xml-parser')

function tmxParse(xmlText) {
  return xmlParser.parse(xmlText, {
    allowBooleanAttributes: true,
    ignoreAttributes: false,
    arrayMode: false,
    attributeNamePrefix: '',
    parseAttributeValue: true,
    parseNodeValue: true,
    trimValues: true,
    ignoreNameSpace: true
  })
}

exports.tmxParse = tmxParse

function tmxArray(itemOrArray) {
  if (itemOrArray === null || itemOrArray === undefined) {
    return []
  }
  if (Array.isArray(itemOrArray)) {
    return itemOrArray.filter(x => x !== undefined && x !== null)
  }
  return [itemOrArray]
}

exports.tmxArray = tmxArray

function tmxObjectProperties(object, result = {}) {
  for (const properties of tmxArray(object.properties)) {
    for (const item of tmxArray(properties.property)) {
      result[item.name] = item.value
    }
  }
  return result
}

exports.tmxObjectProperties = tmxObjectProperties

function tmxPolygonPoints(text, objectX = 0, objectY = 0) {
  const array = text.split(' ').map(point => {
    const [x, y] = point.split(',').map(parseFloat)
    return { x: Math.round(x + objectX), y: Math.round(y + objectY) }
  })
  // Insert first element at the end to close the polygon
  const first = array[0]
  const last = array[array.length - 1]
  if (first && first !== last && (first.x !== last.x || first.y !== last.y)) {
    array.push({ ...first })
  }

  return array
}

exports.tmxPolygonPoints = tmxPolygonPoints

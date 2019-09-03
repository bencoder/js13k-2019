const fs = require('fs')
const prettyFileSize = require('prettysize')

function humanReadableFileSize(filenameOrSize) {
  try {
    const sz = typeof filenameOrSize === 'string' ? fs.statSync(filenameOrSize).size : filenameOrSize
    return `${prettyFileSize(sz)} (${sz} bytes)`
  } catch (e) {
    return 'NOT FOUND!'
  }
}

module.exports = humanReadableFileSize

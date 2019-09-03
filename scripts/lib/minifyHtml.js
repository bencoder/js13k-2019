const htmlMinifier = require('html-minifier')

function minifyHtml(html) {
  return htmlMinifier.minify(html, {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: false,
    collapseWhitespace: true,
    sortAttributes: true,
    sortClassName: true,
    decodeEntities: true,
    removeComments: true,
    removeCommentsFromCDATA: true,
    keepClosingSlash: false,
    minifyJS: true,
    minifyCSS: true,
    useShortDoctype: true
  })
}

module.exports = minifyHtml

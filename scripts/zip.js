const path = require('path')
const fs = require('fs')
const runPromise = require('./lib/runPromise')
const mkdirp = require('mkdirp')
const cheerio = require('cheerio')
const archiver = require('archiver')
const minifyHtml = require('./lib/minifyHtml')
const minifyJs = require('./lib/minifyJs')
const humanReadableFileSize = require('./lib/humanReadableFileSize')
const { getUsedBrowserGlobals } = require('./lib/browserGlobals')
const csso = require('csso')

const rootFolder = path.resolve(__dirname, '../')
const srcFolder = path.resolve(rootFolder, 'src')
const outFolder = path.resolve(rootFolder, 'out')

const outIndexHtmlPath = path.resolve(outFolder, 'index.html')
const outZipPath = path.resolve(outFolder, 'out.zip')

const options = {
  minifyJs: true,
  minifyHtml: false,
  minifyCss: true
}

function mergeScriptFiles(filenames) {
  const result = []

  for (const filename of filenames) {
    if (filename.startsWith('http:') || filename.startsWith('https:')) {
      continue
    }
    const filepath = path.resolve(srcFolder, filename)
    const js = fs.readFileSync(filepath, 'utf8')
    result.push(js)
  }

  return result.join('\n')
}

async function build() {
  mkdirp.sync(outFolder)

  const inputHtmlText = fs.readFileSync(path.resolve(srcFolder, 'index.html'), 'utf8')
  const $ = cheerio.load(inputHtmlText)

  const scriptTags = $('script')

  const scriptFiles = Array.from(scriptTags)
    .map(x => x.attribs.src)
    .filter(x => x)

  const cssLinks = $("link[type$='text/css']")

  console.log()
  console.log('----- input -----')
  console.log(`JavaSript files : ${scriptFiles.length}`)
  console.log(`CSS files       : ${cssLinks.length}`)

  let mergedJs = mergeScriptFiles(scriptFiles)

  let css = ''
  cssLinks.each((i, x) => {
    const href = $(x).attr('href')
    if (href) {
      css += `${fs.readFileSync(path.resolve(srcFolder, href))}\n`
    }
  })

  console.log('Input total size:', humanReadableFileSize(Buffer.from(inputHtmlText + mergedJs + css).length))
  console.log()

  if (options.minifyJs) {
    mergedJs = minifyJs(mergedJs)
    const usedGlobals = getUsedBrowserGlobals(mergedJs).join(',')
    console.log('Used globals: ', usedGlobals)
    mergedJs = `((${usedGlobals})=>{${mergedJs}})(${usedGlobals})`
    mergedJs = `'use strict';${mergedJs}`
    mergedJs = minifyJs(mergedJs)
  } else {
    mergedJs = `(()=>{'use strict';${mergedJs}})()`
  }

  cssLinks.remove()

  if (css) {
    if (options.minifyCss) {
      css = csso.minify(css, { comments: false }).css
    }
    if (css) {
      $('head').append($('<style></style>').text(css))
    }
  }

  $('<script></script>')
    .text(mergedJs)
    .insertAfter(scriptTags.last())

  scriptTags.remove()

  const outHtmlText = options.minifyHtml ? minifyHtml($.html()) : $.html()

  fs.writeFileSync(outIndexHtmlPath, outHtmlText)

  const zipFileSize = await zipOutFile(outHtmlText)

  console.log()
  console.log('----- output -----')
  console.log('index.html :', humanReadableFileSize(outIndexHtmlPath))
  console.log('out.zip    :', humanReadableFileSize(zipFileSize))
  console.log()
}

function zipOutFile(outHtmlText) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outZipPath)
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    })

    output.on('close', () => {
      return resolve(archive.pointer())
    })

    archive.on('warning', err => {
      throw err
    })

    archive.on('error', err => {
      reject(err)
    })

    archive.pipe(output)

    archive.append(Buffer.from(outHtmlText), { name: path.basename(outIndexHtmlPath) })

    archive.finalize()
  })
}

runPromise(build, 'build')

function runPromise(func, name) {
  console.time(name)
  return func()
    .then(() => console.timeEnd(name))
    .catch(e => {
      console.error(e)
      process.exitCode = -1
    })
}

module.exports = runPromise

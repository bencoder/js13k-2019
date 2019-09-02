function runPromise(promise, name) {
	console.time(name);
	return promise
		.then(() => console.timeEnd(name))
		.catch(e => {
			console.error(e);
			process.exitCode = -1;
		});
}

module.exports = runPromise;

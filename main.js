const level1 = {"walls":[[{"x":448,"y":960},{"x":448,"y":736},{"x":128,"y":736},{"x":128,"y":384},{"x":416,"y":384},{"x":416,"y":640},{"x":192,"y":640},{"x":192,"y":672},{"x":448,"y":672},{"x":448,"y":352},{"x":320,"y":352},{"x":320,"y":224},{"x":640,"y":224},{"x":640,"y":352},{"x":512,"y":352},{"x":512,"y":672},{"x":800,"y":672},{"x":800,"y":736},{"x":512,"y":736},{"x":512,"y":960}]],"doors":[{"name":"door2","polygon":[{"x":448,"y":352},{"x":512,"y":352},{"x":448,"y":352}],"open":false},{"name":"door1","polygon":[{"x":448,"y":672},{"x":448,"y":736},{"x":448,"y":672}],"open":false}],"switches":[{"x":352,"y":512,"target":"door2","type":"momentary", "pressed":0},{"x":769,"y":702,"target":"door1","type":"toggle", "pressed":0}],"start":{"x":480,"y":928},"end":{"x":480,"y":288}};
const Settings = {
    tps: 20,
    timeToDie: 13,
    playerRadius: 10,
    switchRadius: 20,
    playerSpeed: 5
}

const Draw = new Drawing(document.getElementById('c'));
const game = new Game(level1);

let previous;
let accumulator = 0; //stores incrementing value (in seconds) until the next tick, when it's then decremented by 1 tick's length
const update = time => {
    window.requestAnimationFrame(update);
    if (previous === undefined) { previous = time; }
    const dt = (time - previous) / 1000.0;
    accumulator += dt;

    if (accumulator > 1.0/Settings.tps) {
        accumulator -= 1.0/Settings.tps;
        game.tick();
    }
    game.draw(accumulator);
    previous = time;
}
window.requestAnimationFrame(update);

const keyMap = {
    'ArrowUp': 'up',
    'KeyW': 'up',
    'ArrowDown': 'down',
    'KeyS': 'down',
    'ArrowLeft': 'left',
    'KeyA': 'left',
    'ArrowRight': 'right',
    'KeyD': 'right',
    'Backspace': 'back'
}
window.addEventListener('keydown', ev => {
    if (keyMap[ev.code]) {
        game.buttonDown(keyMap[ev.code]),
        ev.preventDefault();
        return false;
    }
});
window.addEventListener('keyup', ev => {
    if (keyMap[ev.code]) {
        game.buttonUp(keyMap[ev.code])
        ev.preventDefault();
        return false;
    }
});
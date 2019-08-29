const c=document.getElementById('c');
let screenWidth;
let screenHeight;
let scale = 2;
const setScreen = () => {
    screenWidth=c.width=c.clientWidth;
    screenHeight=c.height=c.clientHeight;
}
setScreen();
window.addEventListener('resize', setScreen);

const ctx=c.getContext("2d");
const level1 = {"walls":[[{"x":448,"y":960},{"x":448,"y":736},{"x":128,"y":736},{"x":128,"y":384},{"x":416,"y":384},{"x":416,"y":640},{"x":192,"y":640},{"x":192,"y":672},{"x":448,"y":672},{"x":448,"y":352},{"x":320,"y":352},{"x":320,"y":224},{"x":640,"y":224},{"x":640,"y":352},{"x":512,"y":352},{"x":512,"y":672},{"x":800,"y":672},{"x":800,"y":736},{"x":512,"y":736},{"x":512,"y":960}]],"doors":[{"name":"door2","polygon":[{"x":448,"y":352},{"x":512,"y":352},{"x":448,"y":352}],"open":false},{"name":"door1","polygon":[{"x":448,"y":672},{"x":448,"y":736},{"x":448,"y":672}],"open":false}],"switches":[{"x":352,"y":512,"target":"door2","type":"momentary", "pressed":0},{"x":769,"y":702,"target":"door1","type":"toggle", "pressed":0}],"start":{"x":480,"y":928},"end":{"x":480,"y":288}};
let camera = new Vec2(0,0);
const worldToScreen = ({x,y}) => ({
    x: (x-camera.x)*scale+screenWidth/2,
    y: (y-camera.y)*scale+screenHeight/2,
})
const clearScreen = () => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,screenWidth,screenHeight);
}
const setColor = (color) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
}
const drawPoly = polygon => {
    const screenPoly = polygon.map(worldToScreen);
    ctx.beginPath();
    ctx.moveTo(screenPoly[0].x, screenPoly[0].y);
    for(let i=1;i<screenPoly.length;i++)
        ctx.lineTo(screenPoly[i].x,screenPoly[i].y);
    ctx.closePath();
    ctx.stroke();
}
const drawCircle = (c,r,fill=false) => {
    const {x,y} = worldToScreen(c);
    ctx.beginPath();
    ctx.arc(x, y, r*scale, 0, 2 * Math.PI);
    ctx.stroke();
    if (fill) ctx.fill();
}

const drawTimer = (time) => {
    const r = 255;
    const g = b = Math.floor(255 * (1-time/timeToDie));

    setColor(`rgb(${r},${g},${b})`);
    ctx.font = '48px serif'
    ctx.fillText(time.toFixed(1), 10, 40)
}
function doesLineInterceptCircle(A, B, C, radius) {
    let dist;
    const v1x = B.x - A.x;
    const v1y = B.y - A.y;
    const v2x = C.x - A.x;
    const v2y = C.y - A.y;
    // get the unit distance along the line of the closest point to
    // circle center
    const u = (v2x * v1x + v2y * v1y) / (v1y * v1y + v1x * v1x);
    
    
    // if the point is on the line segment get the distance squared
    // from that point to the circle center
    if(u >= 0 && u <= 1){
        dist  = (A.x + v1x * u - C.x) ** 2 + (A.y + v1y * u - C.y) ** 2;
    } else {
        // if closest point not on the line segment
        // use the unit distance to determine which end is closest
        // and get dist square to circle
        dist = u < 0 ?
                (A.x - C.x) ** 2 + (A.y - C.y) ** 2 :
                (B.x - C.x) ** 2 + (B.y - C.y) ** 2;
    }
    return dist < radius * radius;
}

function Vec2(x,y) {
    this.x=x;
    this.y=y;
    this.add = v => new Vec2(this.x+v.x, this.y+v.y);
    this.sub = v => new Vec2(this.x-v.x, this.y-v.y);
    this.len = () => Math.sqrt(this.x*this.x+this.y*this.y);
    this.mul = n =>new Vec2(this.x*n, this.y*n);
    this.copy = () => new Vec2(this.x,this.y);
}


const tps = 20; // number of ticks per second (FPS is greater and is done by interpolating from the previous movement to the next)
const timeToDie = 13; //13 seconds to die
let accumulator = 0; //stores incrementing value (in seconds) until the next frame, when it's then decremented by 1 frame's length

function interpolate(position, movementVector) {
    return position.sub(movementVector.mul(1-tps*accumulator));
}

function Level(levelObject) {
    let currentLevel = JSON.parse(JSON.stringify(levelObject));
    const switchRadius = 20;
    
    const doesCircleCollide = (position, radius) => {
        for (let i=0;i<currentLevel.walls.length;i++) {
            for (let j=1;j<currentLevel.walls[i].length;j++) {
                if (doesLineInterceptCircle(currentLevel.walls[i][j-1],currentLevel.walls[i][j], position, radius))
                    return true;
            }
        }
        for (let i=0;i<currentLevel.doors.length;i++) {
            for (let j=1;j<currentLevel.doors[i].polygon.length;j++) {
                if (!currentLevel.doors[i].open && doesLineInterceptCircle(currentLevel.doors[i].polygon[j-1],currentLevel.doors[i].polygon[j], position, radius))
                    return true;
            }
        }
        return false;
    }

    const toggleDoor = doorName => {
        const door = currentLevel.doors.find(d => d.name == doorName);
        door.open = !door.open;
    }

    const handleSwitches = (oldPos, newPos, radius) => {
        for(let s of currentLevel.switches) {
            const switchPos = new Vec2(s.x, s.y);
            const wasTouching = oldPos.sub(switchPos).len() < (radius + switchRadius);
            const nowTouching = newPos.sub(switchPos).len() < (radius + switchRadius);
            if (!wasTouching && nowTouching) {
                if (s.pressed == 0) toggleDoor(s.target);   //only toggle if you're the first one on it
                s.pressed++;
            }
            if (wasTouching && !nowTouching) {
                s.pressed--;
            }
            if (wasTouching && !nowTouching && s.type == 'momentary' && s.pressed == 0) {
                toggleDoor(s.target);
            }
        }
    }

    this.ghostRemoved = (position, radius) => {
        for (let s of currentLevel.switches) {
            const isTouching = position.sub(new Vec2(s.x,s.y)).len() < (radius + switchRadius);
            if (isTouching) {
                s.pressed--;
                if (s.pressed == 0 && s.type == 'momentary') {
                    toggleDoor(s.target);
                }
            }
        }
    }

    this.getStart = () => new Vec2(levelObject.start.x, levelObject.start.y);

    this.reset = () => {
        currentLevel = JSON.parse(JSON.stringify(levelObject));
    }

    this.interact = (oldPos, radius, plannedVector) => {
        const newPos = oldPos.add(plannedVector);

        if (doesCircleCollide(newPos, radius)) {
            return new Vec2(0,0);
        }

        handleSwitches(oldPos, newPos, radius);

        return plannedVector;
    }

    this.draw = () => {
        setColor('white');
        currentLevel.walls.forEach(drawPoly);

        setColor('purple');
        currentLevel.doors.filter(door => !door.open).forEach(door => drawPoly(door.polygon));

        setColor('yellow');
        currentLevel.switches.forEach(s => {
            drawCircle(s, switchRadius);
            if (s.pressed) {
                drawCircle(s, switchRadius-2);
            }
        });
    }
}

function Player(level) {
    const speed = 100 / tps;
    const radius = 10;
    this.position = level.getStart()
    this.movementVector = new Vec2(0,0); //stores last movement vector

    this.draw = () => {
        setColor('green');
        drawCircle(interpolate(this.position, this.movementVector), radius, true);
    }

    this.move = (buttons) => {
        const movement = new Vec2(0,0);

        if (buttons.up) movement.y -= speed;
        if (buttons.down)  movement.y += speed;
        if (buttons.left) movement.x -= speed;
        if (buttons.right) movement.x += speed;

        this.movementVector = level.interact(this.position, radius, movement)
        this.position = this.position.add(this.movementVector);

        return this.movementVector;
    }
}


function Ghost(history, level) {
    let position = level.getStart();
    const radius = 10;
    let movementVector = new Vec2(0,0); //stores the last movementVector

    this.tick = currentTick => {
        if (currentTick > history.length) return;
        if (currentTick == history.length) {
            level.ghostRemoved(position, radius);
            return;
        }
        movementVector = history[currentTick];
        level.interact(position, radius, movementVector);
        position = position.add(movementVector); //always apply the vector, cause we're a ghost
    }

    this.draw = currentTick => {
        if (currentTick > history.length) return; //could draw a dead ghost(??)
        setColor('orange');
        drawCircle(interpolate(position, movementVector), radius, true);
    }

    this.reset = () => {
        position = level.getStart();
    }
}

const Game = function(levelObject) {
    let level;
    let player;
    let ghosts = [];
    let currentTick = 0;
    let history = [];

    const buttons = {}

    const die = () => {
        for(g of ghosts) g.reset();
        ghosts.push(new Ghost(history, level));
        currentTick = 0;
        history = [];

         //reset level and player
        level.reset();
        player = new Player(level);
    }

    this.draw = () => {
        camera = interpolate(player.position, player.movementVector);
        clearScreen();
        level.draw();
        for(g of ghosts) g.draw(currentTick);
        player.draw();
        drawTimer(currentTick / tps);
    }

    this.tick = () => {
        if (currentTick == timeToDie * tps) {
            die();
            return;
        }
        history[currentTick] = player.move(buttons);
        for(g of ghosts) g.tick(currentTick);
        ++currentTick;
    }

    this.buttonDown = key => {
        buttons[key] = true;
        if (key == 'back') {
            die();
        }
    }

    this.buttonUp = key => buttons[key] = false;

    this.loadLevel = (levelObject) => {
        level = new Level(levelObject);
        player = new Player(level);
    }

    if (levelObject) {
        this.loadLevel(levelObject);
    }
}

const game = new Game(level1);

let previous;
const update = time => {
    window.requestAnimationFrame(update);
    if (previous === undefined) { previous = time; }
    const dt = (time - previous) / 1000.0;
    accumulator += dt;

    if (accumulator > 1.0/tps) {
        accumulator -= 1.0/tps;
        game.tick();
    }

    game.draw();
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
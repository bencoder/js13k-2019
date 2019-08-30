const Drawing = function(c) {
    let screenWidth;
    let screenHeight;
    let scale = 1.5;
    const setScreen = () => {
        screenWidth=c.width=c.clientWidth;
        screenHeight=c.height=c.clientHeight;
    }
    setScreen();
    window.addEventListener('resize', setScreen);

    const ctx=c.getContext("2d");
    
    camera = {x:0,y:0};
    this.accumulator = 0;
    
    const interpolate = (position, movementVector) => {
        return position.sub(movementVector.mul(1-Settings.tps*this.accumulator));
    }

    const worldToScreen = ({x,y}) => ({
        x: (x-camera.x)*scale+screenWidth/2,
        y: (y-camera.y)*scale+screenHeight/2,
    });

    const color = (color) => {
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
    }
    const poly = polygon => {
        const screenPoly = polygon.map(worldToScreen);
        ctx.beginPath();
        ctx.moveTo(screenPoly[0].x, screenPoly[0].y);
        for(let i=1;i<screenPoly.length;i++)
            ctx.lineTo(screenPoly[i].x,screenPoly[i].y);
        ctx.closePath();
        ctx.stroke();
    }
    const circle = (c,r,fill=false) => {
        const {x,y} = worldToScreen(c);
        ctx.beginPath();
        ctx.arc(x, y, r*scale, 0, 2 * Math.PI);
        ctx.stroke();
        if (fill) ctx.fill();
    }

    this.setCamera = (position, movementVector) => {
        camera = interpolate(position, movementVector);
    }

    this.bg = () => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0,screenWidth,screenHeight);
    }

    this.timer = (time) => {
        const r = 255;
        const g = b = Math.floor(255 * (1-time/Settings.timeToDie));

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.font = '48px serif'
        ctx.fillText(time.toFixed(1), 10, 40)
    }

    this.player = (player) => {
        color('green');
        circle(interpolate(player.position, player.movementVector), 10, true);
    }

    this.ghost = (ghost) => {
        if (ghost.dead) return;
        color('yellow');
        circle(interpolate(ghost.position, ghost.movementVector), 10, true);
    }

    this.level = (level) => {
        color('white');
        level.walls.forEach(poly);

        color('purple');
        level.doors.filter(door => !door.open).forEach(door => poly(door.polygon));

        color('yellow');
        level.switches.forEach(s => {
            circle(s, Settings.switchRadius);
            if (s.pressed) {
                circle(s, Settings.switchRadius-2);
            }
        });
    }
}
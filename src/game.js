function Game(levelObject) {
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

    this.draw = (accumulator) => {
        Draw.accumulator = accumulator;
        Draw.setCamera(player.position, player.movementVector);
        Draw.bg();
        Draw.level(level.getLevel());
        Draw.player(player);
        for(g of ghosts) Draw.ghost(g);
        Draw.timer(currentTick / Settings.tps);
    }

    this.tick = () => {
        if (currentTick == Settings.timeToDie * Settings.tps) {
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
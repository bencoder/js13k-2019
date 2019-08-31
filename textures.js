function rand(max) {
    return Math.floor(Math.random()*max);
}
const grass = new OffscreenCanvas(128,128);
let ctx = grass.getContext('2d');
ctx.fillStyle = '#59681b';
ctx.fillRect(0,0,128,128);
const colors = ['#a1c708', '#819824', '#839b22', '#8aa71c']
for (let i=0;i<1000;i++) {
    ctx.fillStyle = colors[rand(colors.length)];
    let x = rand(128);
    let y = rand(128);
    ctx.fillRect( x, y, 1, 1 );
}

//const brick = new OffscreenCanvas(16,16);
const brick = new Image();
brick.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAACVBMVEVmXFF/c2ZMRT3dnBtFAAAAGElEQVQI12MQDQ0NZWhgYGCknFi1atUKAH7KCsnrs38dAAAAAElFTkSuQmCC';

const cobbles = new Image();
cobbles.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAANlBMVEV8WT+XbU6Takx+W0BlSTRpTDZ0VDyKZEa6lHiyi26HYkaDX0N3Vz52VDtjRzKtg2Kke1yab08XC7i3AAAAQklEQVQY02NgZGdkQgWMnAzcbMwMqIBrUAoy8LHAAB+EZBNgYIQDQQ52JjCDCUkbOwcvD8SowSjICgMsbPxsLBAmAOy1A9vBDRVuAAAAAElFTkSuQmCC';

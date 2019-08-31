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
brick.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wgfCSEE4C0l8QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAALUlEQVQoz2NMiwmUFBdlIBqwPHv5hnjVkuKiTAwkglENoxqopYGFgYGBpAQLAFgIBzfMPOVLAAAAAElFTkSuQmCC';

const cobbles = new Image();
cobbles.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAAwUlEQVQ4y+2SSwrCUAxFk5dHK9Yf6EiLKIi7cSeux3WpmxCRttrar23iSFCxfsFR7zBwLiQ5uJjPwjSzTKNggbdDCgfDkXaC6BCllpEVzG+SLNCsmzaigh9SwV/C+BmGAICgkyx3/cgnEnksCTMTkQgAyGUiYZLZnqv73Zbdaz8xaTyZLldr09CGpqt+8TxPbxy/3CTpNGqCtNsfkcjUim8VVi9XqyT5I4yAWHZ87QRx6Z9ZTnkRuNucJYxiInVn4RnC7lXmFp/t1gAAAABJRU5ErkJggg==';

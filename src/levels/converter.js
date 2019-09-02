const fs = require('fs');

const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

const result = {
    walls: [],
    doors: [],
    switches: []
};
let currentType = 
data.layers.forEach(layer => {
    if (layer.name === 'walls') {
        layer.objects.forEach(object => {
            result.walls.push(object.polygon.map(({x,y}) => ({x: x+object.x, y:y+object.y})));
        })
        return;
    }
    layer.objects.forEach(object => {
        if (object.type === 'door') {
            result.doors.push({
                name: object.name,
                polygon: object.polygon.map(({x,y}) => ({x: x+object.x, y:y+object.y})),
                open: object.properties.find(p => p.name==='open').value
            });
        }
        if (object.type === 'start') {
            result.start = {x: object.x, y: object.y};
        }
        if (object.type === 'end') {
            result.end = {x: object.x, y: object.y};
        }
        if (object.type === 'switch') {
            result.switches.push({
                x: object.x,
                y: object.y,
                target: object.properties.find(p=>p.name==='target').value,
                type: object.properties.find(p=>p.name==='type').value
            });
        }
    })
})

console.log(JSON.stringify(result));
const tmx = require('tmx-parser')

async function loadMap () {
    map = await new Promise((resolve, reject) => {
        tmx.parseFile("./src/my_map.tmx", function (err, loadedMap) {
            if(err) reject(err)
            resolve(loadedMap)
        })
    })
    const layer = map.layers[0]
    const map2D = []
    for(let row = 0; row < map.height; row++) {
        const tileRow = []
        for(let col = 0; col < map.width; col++) {
            const tile = layer.tiles[row * map.height + col];
            tileRow.push({id : tile.id, gid: tile.gid })
        }
        map2D.push(tileRow)
    }
    return map2D
}

module.exports = loadMap
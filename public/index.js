const mapImage = new Image()
mapImage.src = './tmw_desert_spacing.png'

const playerImage = new Image()
playerImage.src = './santa.png'

const canvasEl = document.getElementById('canvas')
canvasEl.width = window.innerWidth
canvasEl.height = window.innerHeight
const canvas = canvasEl.getContext('2d')

const TILESIZE = 32
const TILES_IN_ROW = 8
let map = [[]]

const socket = io('ws://localhost:5000');
socket.on('connect', () => {
    console.log('connect');
});
socket.on('map', (loadedMap) => {
    map = loadedMap
})

const inputs = {
    'up' : false,
    'down' : false,
    'left' : false,
    'right' : false,
}

window.addEventListener('keydown', (e) => {
    if(e.key === 'w'){
        inputs['up'] = true
    }else if(e.key === 's'){
        inputs['down'] = true
    }else if(e.key === 'd'){
        inputs['right'] = true
    }else if(e.key === 'a'){
        inputs['left'] = true
    }
    socket.emit('input', inputs)
})

window.addEventListener('keyup', (e) => {
    if(e.key === 'w'){
        inputs['up'] = false
    }else if(e.key === 's'){
        inputs['down'] = false
    }else if(e.key === 'd'){
        inputs['right'] = false
    }else if(e.key === 'a'){
        inputs['left'] = false
    }
    socket.emit('input', inputs)
})



function loop() {
    canvas.clearRect(0, 0, canvas.width, canvas.height)
    for(let row = 0; row < map.length; row++) {
        for(let col = 0; col < map[0].length; col++) {
            const {id} = map[row][col]
            
            const imageRow = parseInt(id / TILES_IN_ROW)
            const imageCol = id % TILES_IN_ROW

            canvas.drawImage(
                mapImage, 
                imageCol * TILESIZE,
                imageRow * TILESIZE,
                TILESIZE,
                TILESIZE,
                col * TILESIZE,
                row * TILESIZE,
                TILESIZE,
                TILESIZE
            )
        }
    }

    canvas.drawImage(playerImage, 0, 0)

    window.requestAnimationFrame(loop)
}
window.requestAnimationFrame(loop)
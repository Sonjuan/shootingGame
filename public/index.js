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

const socket = io('ws://localhost:5000');
socket.on('connect', () => {
    console.log('connect');
});

let map = [[]]
socket.on('map', (loadedMap) => {
    map = loadedMap
})

const inputs = {
    'up' :   false,
    'down' : false,
    'left' : false,
    'right': false,
}

window.addEventListener('keydown', (e) => {
    if(e.key === 'w') {
        inputs['up'] = true
    }else if (e.key === 's') {
        inputs['down'] = true
    }else if (e.key === 'a') {
        inputs['left'] = true
    }else if (e.key === 'd') {
        inputs['right'] = true
    }
    socket.emit('inputs', inputs)
})

window.addEventListener('keyup', (e) => {
    if(e.key === 'w') {
        inputs['up']    = false
    }else if (e.key === 's') {
        inputs['down']  = false
    }else if (e.key === 'a') {
        inputs['left']  = false
    }else if (e.key === 'd') {
        inputs['right'] = false
    }
    socket.emit('inputs', inputs)
})

window.addEventListener('click', (e) => {
    const angle = Math.atan2(
        e.clientY - canvasEl.height, 
        e.clientX - canvasEl.width
    )
    socket.emit('bullets', angle)
})

let players = []
socket.on('players', (serverPlayers) => {
    players = serverPlayers
})

function loop() {
    canvas.clearRect(0, 0, canvasEl.width, canvasEl.height)

    const myPlayer = players.find((player) => player.id === socket.id)
    let cameraX = 0
    let cameraY = 0
    if(myPlayer) {  
        cameraX = parseInt(myPlayer.x - canvasEl.width / 2)
        cameraY = parseInt(myPlayer.y - canvasEl.height/ 2)
    } 
    
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
                col * TILESIZE - cameraX,
                row * TILESIZE - cameraY,
                TILESIZE,
                TILESIZE
            )
        }
    }

    for(let player of players) {
        canvas.drawImage(playerImage, player.x - cameraX, player.y - cameraY)
    }
    window.requestAnimationFrame(loop)
}
window.requestAnimationFrame(loop)
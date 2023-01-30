const mapImage = new Image()
mapImage.src = './tmw_desert_spacing.png'

const canvasEl = document.getElementById('canvas')
canvasEl.width = window.innerWidth
canvasEl.height = window.innerHeight
const canvas = canvasEl.getContext('2d')

const socket = io('ws://localhost:5000');

socket.on('connect', () => {
    console.log('connect');
});

let map = [[]]
socket.on('map', (loadedMap) => {
    map = loadedMap
})

const TILESIZE = 32
const TILES_IN_ROW = 8

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

    window.requestAnimationFrame(loop)
}
window.requestAnimationFrame(loop)
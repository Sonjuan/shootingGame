const mapImage = new Image()
mapImage.src = './tmw_desert_spacing.png'

const playerImage = new Image()
playerImage.src = './player.png'

const canvasEl = document.getElementById('canvas')
const canvas = canvasEl.getContext('2d')
canvasEl.width = window.innerWidth
canvasEl.height = window.innerHeight

const TILESIZE = 32
const TILES_IN_ROW = 8

const socket = io('ws://localhost:5000')
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
const myPeer = new Peer()

const muteButton = document.getElementById("mute")
let isPlaying = true

navigator.mediaDevices.getUserMedia({
    video : true,
    audio : true
}).then(stream => {
    addVideoStream(myVideo, stream)
    myPeer.on("call", call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on("stream", (remoteStream) => {
            addVideoStream(video, remoteStream)
        })
    })
    socket.on("user-connected", (userId) => {
        connectNewUser(userId, stream)
    })
    muteButton.addEventListener("click", () => {
        if(isPlaying) {
            stream.getAudioTracks()[0].enabled = false
            muteButton.innerText = "unmute"
        } else {
            stream.getAudioTracks()[0].enabled = true
            muteButton.innerText = "mute"
        }
        isPlaying = !isPlaying
    })
})

myPeer.on('open', (id) => {
    socket.emit('enter-room', id)
})

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

function connectNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    socket.on('user-disconnected', (targetId) => {
        if(targetId === userId) {
            video.parentElement.removeChild(video)
        }
    })
}


let map = [[]]
socket.on('map', (loadedMap) => {
    map = loadedMap
})

let bullets = []
socket.on('bullets', (serverBullets) => {
    bullets = serverBullets
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
        e.clientY - canvasEl.height / 2, 
        e.clientX - canvasEl.width  / 2
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
        cameraX = parseInt(myPlayer.x - canvasEl.width  / 2)
        cameraY = parseInt(myPlayer.y - canvasEl.height / 2)
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

    for(const player of players) {
        canvas.drawImage(playerImage, player.x - cameraX, player.y - cameraY)
    }

    for(const bullet of bullets) {
        canvas.fillStyle = '#000000'
        canvas.beginPath()
        canvas.arc(bullet.x - cameraX, bullet.y - cameraY, 5, 0, 2 * Math.PI)
        canvas.fill()
    }

    window.requestAnimationFrame(loop)
}
window.requestAnimationFrame(loop)
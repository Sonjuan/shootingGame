const express = require('express')
const { createServer } = require("http")
const { Server } = require("socket.io")
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const loadMap = require('./maploader')

const TICK_RATE = 30
const SPEED = 5
const BULLET_SPEED = 7
const PLAYER_SIZE = 32

const inputsMap = {}
let players = []
let bullets = []

function tick (delta) {
    for(const player of players) {
        const inputs = inputsMap[player.id]
        if(inputs.up) {
            player.y -= SPEED
        }else if(inputs.down) {
            player.y += SPEED
        }

        if(inputs.left) {
            player.x -= SPEED
        }else if(inputs.right) {
            player.x += SPEED
        }
    }

    for(const bullet of bullets) {
        bullet.x += Math.cos(bullet.angle) * BULLET_SPEED
        bullet.y += Math.sin(bullet.angle) * BULLET_SPEED
        bullet.timeLeft -= delta
        
        for(const player of players) {
            if(player.id === bullet.playerId) continue
            const dist = Math.sqrt(
                (player.x + PLAYER_SIZE/2 - bullet.x)**2 + 
                (player.y + PLAYER_SIZE/2 - bullet.y)**2
            )
            if(dist <= PLAYER_SIZE/2) {
                player.x = 0
                player.y = 0
                bullet.timeLeft = -1;
                break
            }    
        }
    }
    bullets = bullets.filter((bullet) => bullet.timeLeft > 0 )

    io.emit('players', players)
    io.emit('bullets', bullets)
}

async function main() {
    const map2D = await loadMap()

    io.on('connection', (socket) => {
        console.log("user connected", socket.id)
        inputsMap[socket.id] = {
            'up'    : false,
            'down'  : false,
            'left'  : false,
            'right' : false,
        }
        players.push({
            id: socket.id,
            x : 0,
            y : 0,
        })
        socket.emit('map', map2D)
        socket.on('inputs', (inputs) => {
            inputsMap[socket.id] = inputs
        })

        socket.on('bullets', (angle) => {
            const player = players.find((player) => player.id === socket.id)
            bullets.push({
                angle,
                x : player.x,
                y : player.y,
                timeLeft : 1000,
                playerId : socket.id,
            })
        })
        socket.on('disconnect', () => {
            players = players.filter(player => player.id !== socket.id)
        })
    });
    app.use(express.static("public"))
    httpServer.listen(5000)

    let lastUpdate = Date.now()
    setInterval( () => {
        const now = Date.now()
        const delta = now - lastUpdate
        tick(delta)
        lastUpdate = now
    }, 1000 / TICK_RATE)
}

main()

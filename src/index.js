const express = require('express')
const { createServer } = require("http")
const { Server } = require("socket.io")

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const loadMap = require('./maploader')

const SPEED = 5
const TICk_RATE = 30

function tick() {
    for(const player of players) {
        const inputs = inputsMap[player.id]
        if(inputs.up) {
            player.y -= SPEED
        }else if(inputs.down) {
            player.y += SPEED
        }
        
        if(inputs.left) {
            player.x -= SPEED
        }else if(inputss.right) {
            player.x += SPEED
        }
    }
}

const players =[]
const inputsMap = {}


async function main() {
    const map2D = await loadMap()

    io.on('connection', (socket) => {
        console.log("user connected", socket.id)    
        inputsMap[socket.id] = {
            up: false,
            down: false,
            left: false,
            right : false,
        }
        players.push({
            id : socket.id,
            x : 0,
            y : 0,
        })

        socket.emit('map', map2D)
        socket.on('inputs', (inputs) => {
            inputsMap[socket.id] = inputs
        })
    });
    app.use(express.static("public"))
    httpServer.listen(5000)
    setInterval(tick, 1000 / TICk_RATE)
}

main()

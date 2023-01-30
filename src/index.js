const express = require('express')
const { createServer } = require("http")
const { Server } = require("socket.io")

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const loadMap = require('./maploader')

async function main() {
    const map2D = await loadMap()

    io.on('connection', (socket) => {
        console.log("user connected", socket.id)    
        socket.emit('map', map2D)
    });
    app.use(express.static("public"))
    httpServer.listen(5000)
}

main()

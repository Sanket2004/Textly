import express from "express"
import "dotenv/config"
import connectDB from "./config/db.js"
import cors from "cors"
import roomRoutes from "./routes/room.route.js"
import messageRoutes from "./routes/message.route.js"
import { createServer } from "http"
import { Server } from "socket.io"
import socketHandler from "./socket/index.socket.js"

connectDB()
const PORT = process.env.PORT || 5000
const app = express()

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() })
})

app.use("/api/rooms", roomRoutes)
app.use("/api/messages", messageRoutes)

const server = createServer(app)

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
})

socketHandler(io)

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Health check available at http://localhost:${PORT}/health`)
})

process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully")
    server.close(() => {
        console.log("Process terminated")
    })
})

process.on("SIGINT", () => {
    console.log("SIGINT received, shutting down gracefully")
    server.close(() => {
        console.log("Process terminated")
    })
})

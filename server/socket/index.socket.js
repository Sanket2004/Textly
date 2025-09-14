import Room from "../models/room.model.js"
import Message from "../models/message.model.js"

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id)

    // Join a room
    socket.on("joinRoom", async ({ roomId, username, password }) => {
      try {
        const room = await Room.findById(roomId)
        if (!room) {
          socket.emit("error", { message: "Room not found" })
          return
        }

        // If private, check password
        if (room.isPrivate) {
          if (!password) {
            socket.emit("error", { message: "Invalid password" })
            return
          }

          const isPasswordValid = await room.comparePassword(password)
          if (!isPasswordValid) {
            socket.emit("error", { message: "Invalid password" })
            return
          }
        }

        if (!username || username.trim() === "") {
          socket.emit("error", { message: "Username is required" })
          return
        }

        socket.join(roomId)
        socket.roomId = roomId
        socket.username = username.trim()

        socket.emit("roomJoined", {
          room: {
            ...room.toObject(),
            password: undefined, // Never send password to client
          },
        })

        // Build a list of usernames in this room
        const socketsInRoom = await io.in(roomId).fetchSockets()
        const users = [...new Set(socketsInRoom.map((s) => s.username).filter(Boolean))] // Remove duplicates

        // Broadcast updated list + count
        io.to(roomId).emit("roomUsers", {
          count: users.length,
          users,
        })

        console.log(`${username} joined room ${roomId}. Users: ${users.length}`)
      } catch (error) {
        console.error("Error joining room:", error)
        socket.emit("error", { message: error.message || "Failed to join room" })
      }
    })

    // Handle sending messages
    socket.on("sendMessage", async ({ content }) => {
      try {
        const { roomId, username } = socket
        if (!roomId || !username) {
          socket.emit("error", { message: "Not connected to a room" })
          return
        }

        if (!content || content.trim() === "") {
          socket.emit("error", { message: "Message content cannot be empty" })
          return
        }

        const message = await Message.create({
          content: content.trim(),
          sender: username,
          room: roomId,
        })

        const populatedMessage = await Message.findById(message._id)

        io.to(roomId).emit("new-message", populatedMessage)
      } catch (error) {
        console.error("Error sending message:", error)
        socket.emit("error", { message: error.message || "Failed to send message" })
      }
    })

    // Handle user disconnect
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id)

      const { roomId, username } = socket
      if (roomId) {
        try {
          // Get updated list of users in room after disconnect
          const socketsInRoom = await io.in(roomId).fetchSockets()
          const users = [...new Set(socketsInRoom.map((s) => s.username).filter(Boolean))] // Remove duplicates

          // Broadcast updated list to remaining users
          io.to(roomId).emit("roomUsers", {
            count: users.length,
            users,
          })

          console.log(`${username} left room ${roomId}. Users: ${users.length}`)
        } catch (error) {
          console.error("Error updating users on disconnect:", error)
        }
      }
    })

    socket.on("leaveRoom", async () => {
      const { roomId, username } = socket
      if (roomId) {
        socket.leave(roomId)
        socket.roomId = null
        socket.username = null

        try {
          // Get updated list of users in room after leaving
          const socketsInRoom = await io.in(roomId).fetchSockets()
          const users = [...new Set(socketsInRoom.map((s) => s.username).filter(Boolean))]

          // Broadcast updated list to remaining users
          io.to(roomId).emit("roomUsers", {
            count: users.length,
            users,
          })

          console.log(`${username} left room ${roomId}. Users: ${users.length}`)
        } catch (error) {
          console.error("Error updating users on leave:", error)
        }
      }
    })
  })
}

export default socketHandler

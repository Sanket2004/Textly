import { create } from "zustand"
import { persist } from "zustand/middleware"
import io from "socket.io-client"
import api from "../utils/api"
import { toast } from "react-toastify"
import { playNotificationSound } from "../utils/initNotification"

const useAppStore = create(
    persist(
        (set, get) => ({
            username: "",
            availableRooms: [],
            loading: false,
            room: null,
            messages: [],
            socket: null, // ⚡ never persist socket
            connectedUsers: [], // Add connected users
            userCount: 0, // Add user count
            socketError: null,
            clearSocketError: () => set({ socketError: null }),

            // set username
            setUserName: (username) => set({ username }),

            // fetch available rooms
            getAvailableRooms: async () => {
                try {
                    set({ loading: true })
                    const res = await api.get("/rooms")
                    if (res.data.ok) {
                        set({ availableRooms: res.data.rooms })
                    }
                } catch (error) {
                    console.error("Failed to fetch rooms:", error)
                } finally {
                    set({ loading: false })
                }
            },

            // join a room via REST
            joinRoom: async (id, password = "") => {
                try {
                    set({ loading: true })
                    const res = await api.post(`/rooms/${id}/join`, { password })
                    if (res.data.ok) {
                        set({ room: res.data.room })
                        return { ok: true }
                    }
                    return { ok: false, error: res.data }
                } catch (error) {
                    console.error("Failed to join room:", error)
                    return { ok: false, error: error.response?.data || error }
                } finally {
                    set({ loading: false })
                }
            },

            createRoom: async (data) => {
                try {
                    set({ loading: true })
                    const res = await api.post("/rooms/create", { ...data, owner: get().username })
                    if (res.data.ok) {
                        set({ room: res.data.room })                        
                        return { ok: true, room: res.data.room }
                    }
                    return { ok: false, error: res.data }
                } catch (error) {
                    console.error("Failed to create room:", error)
                    return { ok: false, error: error.response?.data || error }
                } finally {
                    set({ loading: false })
                }
            },

            // fetch old messages
            fetchMessages: async () => {
                try {
                    const room = get().room
                    if (!room) return
                    set({ loading: true })
                    const res = await api.get(`/messages/${room._id}`)
                    if (res.data.ok) {
                        set({ messages: res.data.messages })
                    }
                } catch (error) {
                    console.error("Failed to fetch messages:", error)
                } finally {
                    set({ loading: false })
                }
            },

            // connect socket
            connectSocket: () => {
                if (!get().socket) {
                    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"
                    const socket = io(socketUrl)

                    // Listen for new messages
                    socket.on("new-message", (message) => {
                        set((state) => ({
                            messages: [...state.messages, message],
                        }))

                        const currentUser = get().username
                        if (message.sender !== currentUser) {
                            playNotificationSound()
                        }
                    })

                    // Listen for room users updates
                    socket.on("roomUsers", ({ count, users }) => {
                        set({
                            connectedUsers: users,
                            userCount: count,
                        })
                    })

                    // Handle room joined confirmation
                    socket.on("roomJoined", (data) => {
                        console.log("Successfully joined room:", data)
                        set({ room: data.room })
                        toast.success(`Room #${data.room.name} connected successfully`)
                    })

                    // Handle socket errors
                    socket.on("error", (error) => {
                        console.error("Socket error:", error)
                        set({ socketError: error.message })

                        // Clear room data if authentication fails
                        if (error.message === "Invalid password" || error.message === "Room not found") {
                            set({ room: null })
                        }
                    })

                    socket.on("connect_error", (error) => {
                        console.error("Socket connection error:", error)
                        toast.error("Failed to connect to server")
                    })

                    socket.on("disconnect", (reason) => {
                        console.log("Socket disconnected:", reason)
                        if (reason === "io server disconnect") {
                            // Server disconnected, try to reconnect
                            socket.connect()
                        }
                    })

                    set({ socket })
                }
            },

            // join a socket room
            joinRoomSocket: (roomId, password = "") => {
                const { socket, username } = get()
                if (!socket || !username) return
                socket.emit("joinRoom", { roomId, username, password })
            },

            // send message via socket
            sendMessageSocket: (content) => {
                const { socket } = get()
                if (!socket) return
                socket.emit("sendMessage", { content })
            },

            // disconnect and cleanup
            disconnectSocket: () => {
                const { socket } = get()
                if (socket) {
                    socket.disconnect()
                    set({
                        socket: null,
                        connectedUsers: [],
                        userCount: 0,
                    })
                }
            },
        }),
        {
            name: "app-storage",
            partialize: (state) => ({
                username: state.username,
                availableRooms: state.availableRooms,
                room: state.room,
                messages: state.messages,
                // Don't persist socket, connectedUsers, or userCount
            }),
        },
    ),
)

export default useAppStore

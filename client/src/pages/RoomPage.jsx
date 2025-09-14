"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import useAppStore from "../stores/useStore"
import {
  GoLock,
  GoGlobe,
  GoPerson,
  GoArrowLeft,
  GoArrowUpRight,
  GoSidebarExpand,
  GoSidebarCollapse,
  GoCircle,
  GoX,
} from "react-icons/go"
import { toast } from "react-toastify"

export default function RoomPage() {
  const { roomId } = useParams()
  const {
    room,
    messages,
    joinRoom,
    fetchMessages,
    connectSocket,
    joinRoomSocket,
    sendMessageSocket,
    loading,
    username,
    connectedUsers,
    userCount,
    socketError,
    clearSocketError,
  } = useAppStore()

  const [content, setContent] = useState("")
  const [showUsersList, setShowUsersList] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const [passwordInput, setPasswordInput] = useState("")
  const [passwordPrompt, setPasswordPrompt] = useState(false)
  const [joinAttempted, setJoinAttempted] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    connectSocket()
  }, [])

  useEffect(() => {
    if (!roomId || joinAttempted) return

    const tryJoin = async (password = "") => {
      setJoinAttempted(true)
      const result = await joinRoom(roomId, password)

      if (result.ok) {
        await fetchMessages()
        joinRoomSocket(roomId, password)
        setPasswordPrompt(false)
      } else if (result.error?.message === "Invalid password") {
        setPasswordPrompt(true)
        setPasswordInput("")
      } else {
        toast.error(result.error?.message || "Failed to join room")
      }
    }

    tryJoin()
  }, [roomId, joinAttempted])

  useEffect(() => {
    if (socketError) {
      if (socketError === "Invalid password") {
        setPasswordPrompt(true)
        setPasswordInput("")
        toast.error("Invalid password. Please try again.")
      } else if (socketError === "Room not found") {
        toast.error("Room not found")
      } else {
        toast.error(socketError)
      }
      clearSocketError()
    }
  }, [socketError, clearSocketError])

  useEffect(() => {
    if (inputRef.current && !loading && room) {
      inputRef.current.focus()
    }
  }, [loading, room])

  if (loading) {
    return (
      <div className="h-[calc(100vh-125px)] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Connecting to room...</p>
        </div>
      </div>
    )
  }

  const handleSend = () => {
    if (content.trim() !== "") {
      sendMessageSocket(content)
      setContent("")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const handlePasswordSubmit = async () => {
    if (!passwordInput.trim()) {
      toast.error("Please enter a password")
      return
    }

    setJoinAttempted(false) // Reset to allow retry
    const result = await joinRoom(roomId, passwordInput)

    if (result.ok) {
      await fetchMessages()
      joinRoomSocket(roomId, passwordInput)
      setPasswordPrompt(false)
    } else {
      toast.error(result.error?.message || "Invalid password")
      setPasswordInput("")
    }
  }

  if (passwordPrompt) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg w-80">
          <h3 className="font-semibold text-gray-900 mb-2">Enter Room Password</h3>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
            className="w-full p-2 border border-gray-300 rounded-xl mb-4"
            placeholder="Password"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handlePasswordSubmit}
              className="flex-1 bg-sky-500 text-white py-2 rounded-xl hover:bg-sky-600"
            >
              Join
            </button>
            <button
              onClick={() => {
                setPasswordPrompt(false)
                setJoinAttempted(false)
                history.back()
              }}
              className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="h-[calc(100vh-125px)] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <p className="text-gray-500 text-lg">Room not found or access denied</p>
          <button onClick={() => history.back()} className="px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-[calc(100vh-80px)] bg-gray-50">
        {/* Main Chat Area */}
        <div className="flex flex-col flex-1">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => history.back()}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors md:hidden"
              >
                <GoArrowLeft size={20} className="text-gray-600" />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-xl font-semibold text-gray-900 truncate">{room.name}</h1>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${room.isPrivate
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-green-50 text-green-700 border border-green-200"
                      }`}
                  >
                    {room.isPrivate ? <GoLock size={12} /> : <GoGlobe size={12} />}
                    {room.isPrivate ? "Private" : "Public"}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                  {room.description && <span className="truncate">{room.description}</span>}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <GoPerson size={14} />
                    <span>@{room.owner || "Anonymous"}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <GoCircle size={8} className="text-green-500 fill-current" />
                    <span>{userCount} online</span>
                  </div>
                </div>
              </div>

              {/* Toggle Users List Button */}
              <button
                onClick={() => setShowUsersList(!showUsersList)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                title={showUsersList ? "Hide users" : "Show users"}
              >
                {showUsersList ? <GoSidebarCollapse size={20} /> : <GoSidebarExpand size={20} />}
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: "thin" }}>
            {messages.map((msg, index) => {
              const isMyMessage = msg.sender === username
              const prevMessage = messages[index - 1]
              const isFirstFromUser = !prevMessage || prevMessage.sender !== msg.sender

              return (
                <div key={msg._id} className={`flex gap-3 ${isMyMessage ? "flex-row-reverse" : ""}`}>
                  {isFirstFromUser ? (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 ${isMyMessage ? "bg-sky-500" : "bg-gray-500"
                        }`}
                    >
                      {msg.sender.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-10 h-10 flex-shrink-0" />
                  )}

                  <div className={`flex flex-col max-w-xs sm:max-w-md ${isMyMessage ? "items-end" : "items-start"}`}>
                    {isFirstFromUser && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${isMyMessage ? "order-2" : ""}`}>
                          {isMyMessage ? "You" : msg.sender}
                        </span>
                      </div>
                    )}

                    <div
                      className={`px-4 py-1 rounded-2xl ${isMyMessage
                          ? "bg-sky-500 text-white rounded-tr-md"
                          : "bg-white text-gray-500 rounded-tl-md border border-gray-200"
                        }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap break-all">{msg.content}</p>
                      {msg.createdAt && (
                        <span
                          className={`text-xs ${isMyMessage ? "float-end text-white/70" : "float-start text-gray-300"}`}
                        >
                          {formatTime(msg.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-300 p-4">
            <div className="max-w-2xl mx-auto flex gap-3 justify-between border border-gray-300 shadow-lg rounded-2xl px-4 py-3">
              <textarea
                ref={inputRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 resize-none outline-0 ring-0 border-0"
                placeholder="Type your message..."
                rows="3"
                style={{ minHeight: "48px", maxHeight: "120px", scrollbarWidth: "none" }}
              />
              <button
                onClick={handleSend}
                disabled={!content.trim()}
                className={`h-10 w-10 flex items-center justify-center rounded-full transition-all ${content.trim()
                    ? "bg-sky-500 hover:bg-sky-600 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                <GoArrowUpRight size={22} />
              </button>
            </div>

            <div className="flex justify-center mt-2">
              <p className="text-xs text-gray-400">Press Enter to send, Shift + Enter for new line</p>
            </div>
          </div>
        </div>

        {/* Connected Users Sidebar */}
        {showUsersList && (
          <>
            {/* Mobile Overlay */}
            <div className="fixed inset-0 bg-black/5 z-40 md:hidden" onClick={() => setShowUsersList(false)} />

            {/* Sidebar */}
            <div className="bg-white border-l border-gray-200 w-80 sm:w-64 flex-shrink-0 fixed right-0 top-0 h-full z-50 md:relative md:z-auto shadow-2xl md:shadow-none">
              {/* Header with close button for mobile */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <GoPerson size={16} />
                  Connected Users ({userCount})
                </h3>
                <button className="p-1 hover:bg-gray-100 rounded md:hidden" onClick={() => setShowUsersList(false)}>
                  <GoX size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="p-4 space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto">
                {connectedUsers.map((user, index) => {
                  const isCurrentUser = user === username

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isCurrentUser ? "bg-sky-50 border border-sky-200" : "hover:bg-gray-50"
                        }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 ${isCurrentUser ? "bg-sky-500" : "bg-gray-500"
                          }`}
                      >
                        {user.charAt(0).toUpperCase()}
                      </div>

                      {/* User info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium truncate ${isCurrentUser ? "text-sky-900" : "text-gray-900"
                              }`}
                          >
                            {isCurrentUser ? `${user} (You)` : user}
                          </span>
                          <div size={8} className="bg-green-500 p-1 rounded-full flex-shrink-0" />
                        </div>
                        <span className="text-xs text-gray-500">Online</span>
                      </div>
                    </div>
                  )
                })}

                {connectedUsers.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GoPerson size={24} className="text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-700 mb-1">No users connected</h4>
                    <p className="text-gray-500 text-sm">Users will appear here when they join</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

import { io } from 'socket.io-client'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4090/api'

class SocketService {
    constructor() {
        this.socket = null
        this.listeners = new Map()
    }

    connect() {
        if (this.socket?.connected) return this.socket

        this.socket = io(API_BASE_URL.replace('/api', ''), {
            withCredentials: true,
            transports: ['websocket', 'polling']
        })

        this.socket.on('connect', () => {
            console.log('🟢 Connected to socket server')
        })

        this.socket.on('disconnect', () => {
            console.log('🔴 Disconnected from socket server')
        })

        this.socket.on('error', (error) => {
            console.error('Socket error:', error)
        })

        return this.socket
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
            this.listeners.clear()
        }
    }

    joinRoom(roomId) {
        if (this.socket) {
            this.socket.emit('joinRoom', { roomId })
        }
    }

    leaveRoom(roomId) {
        if (this.socket) {
            this.socket.emit('leaveRoom', { roomId })
        }
    }

    sendMessage(data) {
        if (this.socket) {
            this.socket.emit('sendMessage', data)
        }
    }

    sendTyping(roomId, isTyping) {
        if (this.socket) {
            this.socket.emit('typing', { roomId, isTyping })
        }
    }

    markAsSeen(messageId) {
        if (this.socket) {
            this.socket.emit('markAsSeen', { messageId })
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback)
            // Store listener reference for cleanup
            if (!this.listeners.has(event)) {
                this.listeners.set(event, [])
            }
            this.listeners.get(event).push(callback)
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback)
            // Remove from listeners map
            if (this.listeners.has(event)) {
                const callbacks = this.listeners.get(event)
                const index = callbacks.indexOf(callback)
                if (index > -1) {
                    callbacks.splice(index, 1)
                }
            }
        }
    }

    removeAllListeners(event) {
        if (this.socket) {
            this.socket.removeAllListeners(event)
            this.listeners.delete(event)
        }
    }

    isConnected() {
        return this.socket?.connected || false
    }
}

export const socketService = new SocketService()
export default socketService

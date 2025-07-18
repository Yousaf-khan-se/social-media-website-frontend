import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks for chat operations
export const fetchChats = createAsyncThunk(
    'chats/fetchChats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/chats')
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const createChat = createAsyncThunk(
    'chats/createChat',
    async ({ participants, isGroup, name }, { rejectWithValue }) => {
        try {
            const response = await api.post('/chats/create', {
                participants,
                isGroup,
                name
            })
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const fetchChatMessages = createAsyncThunk(
    'chats/fetchChatMessages',
    async ({ roomId, page = 1, limit = 50 }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/chats/${roomId}/messages?page=${page}&limit=${limit}`)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const uploadChatMedia = createAsyncThunk(
    'chats/uploadChatMedia',
    async ({ roomId, mediaFiles }, { rejectWithValue }) => {
        try {
            const formData = new FormData()
            mediaFiles.forEach(file => {
                formData.append('media', file)
            })

            const response = await api.put(`/chats/media/${roomId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const deleteChat = createAsyncThunk(
    'chats/deleteChat',
    async (roomId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/chats/${roomId}`)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { roomId, ...data }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const deleteMessage = createAsyncThunk(
    'chats/deleteMessage',
    async (messageId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/chats/message/${messageId}`)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { messageId, ...data }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

const initialState = {
    chats: [],
    messages: {},
    activeChat: null,
    onlineUsers: [],
    typingUsers: {},
    searchQuery: '',
    filteredChats: [],
    unreadCounts: {},
    loading: {
        chats: false,
        messages: false,
        creating: false,
        uploading: false
    },
    error: null,
    pagination: {}
}

const chatSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        setActiveChat: (state, action) => {
            state.activeChat = action.payload
        },
        addMessage: (state, action) => {
            const { chatRoom, ...message } = action.payload
            if (!state.messages[chatRoom]) {
                state.messages[chatRoom] = []
            }
            state.messages[chatRoom].push(message)

            // Update last message in chat
            const chat = state.chats.find(c => c._id === chatRoom)
            if (chat) {
                chat.lastMessage = message
                chat.updatedAt = message.createdAt
            }
        },
        updateMessage: (state, action) => {
            const { chatRoom, messageId, updates } = action.payload
            if (state.messages[chatRoom]) {
                const messageIndex = state.messages[chatRoom].findIndex(m => m._id === messageId)
                if (messageIndex !== -1) {
                    state.messages[chatRoom][messageIndex] = {
                        ...state.messages[chatRoom][messageIndex],
                        ...updates
                    }
                }
            }
        },
        addOnlineUser: (state, action) => {
            const user = action.payload;
            console.log('Adding online user:', user.id, user.firstName);
            // Check if user is already in online users list
            if (!state.onlineUsers.find(u => u.id === user.id)) {
                state.onlineUsers.push(user);
            }
        },
        removeOnlineUser: (state, action) => {
            const user = action.payload;
            console.log('Removing online user:', user.id, user.firstName);
            state.onlineUsers = state.onlineUsers.filter(u => u.id !== user.id);
        }
        ,
        setTypingUsers: (state, action) => {
            const { roomId, user, isTyping } = action.payload
            console.log('setTypingUsers action:', { roomId, user, isTyping })

            if (!state.typingUsers[roomId]) {
                state.typingUsers[roomId] = []
            }

            if (isTyping) {
                // Check if user is already in typing list
                const existingUserIndex = state.typingUsers[roomId].findIndex(u => u.id === user.id)
                if (existingUserIndex === -1) {
                    console.log('Adding user to typing list:', user.firstName)
                    state.typingUsers[roomId].push(user)
                } else {
                    console.log('User already in typing list:', user.firstName)
                }
            } else {
                console.log('Removing user from typing list:', user.firstName)
                state.typingUsers[roomId] = state.typingUsers[roomId].filter(u => u.id !== user.id)
            }

            console.log('Updated typing users for room:', roomId, state.typingUsers[roomId])
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload
            state.filteredChats = state.chats.filter(chat => {
                const query = action.payload.toLowerCase()
                if (chat.isGroup) {
                    return chat.name.toLowerCase().includes(query)
                } else {
                    // For direct messages, search in participant names
                    return chat.participants.some(p =>
                        p.firstName?.toLowerCase().includes(query) ||
                        p.lastName?.toLowerCase().includes(query) ||
                        p.username?.toLowerCase().includes(query)
                    )
                }
            })
        },
        markMessageAsSeen: (state, action) => {
            const { messageId, userId } = action.payload
            Object.keys(state.messages).forEach(roomId => {
                const message = state.messages[roomId].find(m => m._id === messageId)
                if (message && !message.seenBy.includes(userId)) {
                    message.seenBy.push(userId)
                }
            })
        },
        updateUnreadCount: (state, action) => {
            const { roomId, count } = action.payload
            state.unreadCounts[roomId] = count
        },
        clearError: (state) => {
            state.error = null
        },
        clearMessages: (state, action) => {
            if (action.payload) {
                delete state.messages[action.payload]
            } else {
                state.messages = {}
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch chats
            .addCase(fetchChats.pending, (state) => {
                state.loading.chats = true
                state.error = null
            })
            .addCase(fetchChats.fulfilled, (state, action) => {
                state.loading.chats = false
                state.chats = action.payload.chats
                state.filteredChats = action.payload.chats
            })
            .addCase(fetchChats.rejected, (state, action) => {
                state.loading.chats = false
                state.error = action.payload
            })

            // Create chat
            .addCase(createChat.pending, (state) => {
                state.loading.creating = true
                state.error = null
            })
            .addCase(createChat.fulfilled, (state, action) => {
                state.loading.creating = false
                state.chats.unshift(action.payload.chat)
                state.filteredChats = state.chats
            })
            .addCase(createChat.rejected, (state, action) => {
                state.loading.creating = false
                state.error = action.payload
            })

            // Fetch chat messages
            .addCase(fetchChatMessages.pending, (state) => {
                state.loading.messages = true
                state.error = null
            })
            .addCase(fetchChatMessages.fulfilled, (state, action) => {
                state.loading.messages = false
                const { chat, messages, pagination } = action.payload
                const roomId = chat._id

                if (pagination.currentPage === 1) {
                    state.messages[roomId] = messages
                } else {
                    // Append older messages for pagination
                    state.messages[roomId] = [...(state.messages[roomId] || []), ...messages]
                }

                state.pagination[roomId] = pagination
            })
            .addCase(fetchChatMessages.rejected, (state, action) => {
                state.loading.messages = false
                state.error = action.payload
            })

            // Upload chat media
            .addCase(uploadChatMedia.pending, (state) => {
                state.loading.uploading = true
                state.error = null
            })
            .addCase(uploadChatMedia.fulfilled, (state) => {
                state.loading.uploading = false
            })
            .addCase(uploadChatMedia.rejected, (state, action) => {
                state.loading.uploading = false
                state.error = action.payload
            })

            // Delete chat
            .addCase(deleteChat.fulfilled, (state, action) => {
                const { roomId } = action.payload
                state.chats = state.chats.filter(chat => chat._id !== roomId)
                state.filteredChats = state.filteredChats.filter(chat => chat._id !== roomId)
                delete state.messages[roomId]
                delete state.pagination[roomId]
                delete state.unreadCounts[roomId]
                if (state.activeChat === roomId) {
                    state.activeChat = null
                }
            })

            // Delete message
            .addCase(deleteMessage.fulfilled, (state, action) => {
                const { messageId } = action.payload
                Object.keys(state.messages).forEach(roomId => {
                    state.messages[roomId] = state.messages[roomId].filter(m => m._id !== messageId)
                })
            })
    }
})

export const {
    setActiveChat,
    addMessage,
    updateMessage,
    addOnlineUser,
    removeOnlineUser,
    setTypingUsers,
    setSearchQuery,
    markMessageAsSeen,
    updateUnreadCount,
    clearError,
    clearMessages
} = chatSlice.actions

export default chatSlice.reducer

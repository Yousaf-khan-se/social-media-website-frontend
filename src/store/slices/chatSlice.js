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
    async ({ participants, isGroup, name, message }, { rejectWithValue }) => {
        try {
            const response = await api.post('/chats/create', {
                participants,
                isGroup,
                name,
                message
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

// New thunk for fetching chat permission requests
export const fetchChatPermissionRequests = createAsyncThunk(
    'chats/fetchChatPermissionRequests',
    async (type = 'received', { rejectWithValue }) => {
        try {
            const response = await api.get(`/chats/permission-requests?type=${type}`)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { ...data, requestType: type }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

// New thunk for responding to permission requests
export const respondToChatPermissionRequest = createAsyncThunk(
    'chats/respondToChatPermissionRequest',
    async ({ requestId, response }, { rejectWithValue }) => {
        try {
            const apiResponse = await api.post(`/chats/permission-requests/${requestId}/respond`, {
                response
            })
            const data = apiResponse.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

const initialState = {
    chats: [],
    messages: {},
    activeChat: null,
    typingUsers: {},
    searchQuery: '',
    filteredChats: [],
    unreadCounts: {},
    // Permission requests
    permissionRequests: {
        received: [],
        sent: []
    },
    loading: {
        chats: false,
        messages: false,
        creating: false,
        uploading: false,
        permissionRequests: false,
        respondingToRequest: false
    },
    error: null,
    pagination: {},
    // Permission request specific states
    lastPermissionRequestResult: null, // To track if last chat creation required permission
}

const chatSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        setActiveChat: (state, action) => {
            state.activeChat = action.payload
        },
        resetFilteredChats: (state) => {
            state.filteredChats = state.chats;
        },
        addMessage: (state, action) => {
            const { chatRoom, ...message } = action.payload;

            // Append message
            if (!state.messages[chatRoom]) {
                state.messages[chatRoom] = [];
            }
            state.messages[chatRoom].push(message);

            // Helper function to update chat
            const updateChat = chat => {
                if (chat._id === chatRoom) {
                    chat.lastMessage = message;
                    chat.updatedAt = message.createdAt;
                }
            };

            // Ensure both original and filtered chats are updated
            state.chats.forEach(updateChat);
            state.filteredChats.forEach(updateChat);
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
        updateOnlineUserStatus: (state, action) => {
            const user = action.payload;
            console.log('Updating online user status:', user.id);
            const targetUser = state.chats.find(chat => {
                const targetParticipant = chat.participants.find(p => p._id === user.id);
                if (targetParticipant && targetParticipant?.isOnline) {
                    targetParticipant.isOnline = user?.isOnline;
                }
                return targetParticipant;
            });

            if (!targetUser) {
                console.warn('User not found in chats to update online status:', user.id);
            }
        }
        ,
        setTypingUsers: (state, action) => {
            const { roomId, userId, isTyping } = action.payload

            if (!state.typingUsers[roomId]) {
                state.typingUsers[roomId] = []
            }

            if (isTyping) {
                // Check if user ID is already in typing list
                if (!state.typingUsers[roomId].includes(userId)) {
                    // Store just the user ID
                    state.typingUsers[roomId].push(userId)
                }
            } else {
                // Remove user ID from typing list
                state.typingUsers[roomId] = state.typingUsers[roomId].filter(id => id !== userId)
            }
        },
        clearTypingUsers: (state, action) => {
            const { roomId, userId } = action.payload
            if (roomId && state.typingUsers[roomId]) {
                if (userId) {
                    // Clear specific user ID
                    state.typingUsers[roomId] = state.typingUsers[roomId].filter(id => id !== userId)
                } else {
                    // Clear all typing users for room
                    state.typingUsers[roomId] = []
                }
            } else if (!roomId) {
                // Clear all typing users
                state.typingUsers = {}
            }
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload
            if (state.searchQuery.trim() === '') {
                state.filteredChats = state.chats
                return;
            }
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

                    // If this was the last unread message, we might want to update unread count
                    // For now, we'll let the activeChat change handle the reset
                }
            })
        },
        updateUnreadCount: (state, action) => {
            const { roomId, actionType, count } = action.payload;
            if (actionType === '++') {
                if (!state.unreadCounts[roomId]) state.unreadCounts[roomId] = 0;
                state.unreadCounts[roomId] += 1;
            }
            else if (actionType === '--') {
                if (state.unreadCounts[roomId]) {
                    state.unreadCounts[roomId] -= 1;
                }

                if (state.unreadCounts[roomId] <= 0) {
                    delete state.unreadCounts[roomId];
                }
            }
            else if (actionType === 'reset') {
                delete state.unreadCounts[roomId];
            }
            else if (actionType === 'set') {
                // For setting a specific count
                if (count !== undefined && count > 0) {
                    state.unreadCounts[roomId] = count;
                } else {
                    delete state.unreadCounts[roomId];
                }
            }
            else {
                console.warn('Unknown action for updateUnreadCount:', actionType);
            }
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
        },
        // Permission request reducers
        addPermissionRequest: (state, action) => {
            const { request, type } = action.payload
            if (type === 'received') {
                state.permissionRequests.received.unshift(request)
            } else if (type === 'sent') {
                state.permissionRequests.sent.unshift(request)
            }
        },
        updatePermissionRequest: (state, action) => {
            const { requestId, updates } = action.payload

            // Update in received requests
            const receivedIndex = state.permissionRequests.received.findIndex(req => req._id === requestId)
            if (receivedIndex !== -1) {
                Object.assign(state.permissionRequests.received[receivedIndex], updates)
            }

            // Update in sent requests
            const sentIndex = state.permissionRequests.sent.findIndex(req => req._id === requestId)
            if (sentIndex !== -1) {
                Object.assign(state.permissionRequests.sent[sentIndex], updates)
            }
        },
        removePermissionRequest: (state, action) => {
            const requestId = action.payload
            state.permissionRequests.received = state.permissionRequests.received.filter(req => req._id !== requestId)
            state.permissionRequests.sent = state.permissionRequests.sent.filter(req => req._id !== requestId)
        },
        clearLastPermissionRequestResult: (state) => {
            state.lastPermissionRequestResult = null
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

                console.log('************Fetched chats:\n', state.chats);
            })
            .addCase(fetchChats.rejected, (state, action) => {
                state.loading.chats = false
                state.error = action.payload
            })

            // Create chat
            .addCase(createChat.pending, (state) => {
                state.loading.creating = true
                state.error = null
                state.lastPermissionRequestResult = null
            })
            .addCase(createChat.fulfilled, (state, action) => {
                state.loading.creating = false

                // Check if this was a permission request or actual chat creation
                if (action.payload.requiresPermission) {
                    // Permission request was sent
                    state.lastPermissionRequestResult = {
                        type: 'permission_request',
                        message: action.payload.message,
                        permissionRequest: action.payload.permissionRequest
                    }
                    // Add to sent permission requests
                    if (action.payload.permissionRequest) {
                        state.permissionRequests.sent.unshift(action.payload.permissionRequest)
                    }
                } else if (action.payload.chat) {
                    // Chat was created successfully
                    state.chats.unshift(action.payload.chat)
                    state.filteredChats = state.chats
                    state.lastPermissionRequestResult = {
                        type: 'chat_created',
                        chat: action.payload.chat
                    }
                }
            })
            .addCase(createChat.rejected, (state, action) => {
                state.loading.creating = false
                state.error = action.payload
                state.lastPermissionRequestResult = {
                    type: 'error',
                    error: action.payload
                }
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

            // Fetch permission requests
            .addCase(fetchChatPermissionRequests.pending, (state) => {
                state.loading.permissionRequests = true
                state.error = null
            })
            .addCase(fetchChatPermissionRequests.fulfilled, (state, action) => {
                state.loading.permissionRequests = false
                const { requests, requestType } = action.payload

                if (requestType === 'received') {
                    state.permissionRequests.received = requests
                } else if (requestType === 'sent') {
                    state.permissionRequests.sent = requests
                }
            })
            .addCase(fetchChatPermissionRequests.rejected, (state, action) => {
                state.loading.permissionRequests = false
                state.error = action.payload
            })

            // Respond to permission request
            .addCase(respondToChatPermissionRequest.pending, (state) => {
                state.loading.respondingToRequest = true
                state.error = null
            })
            .addCase(respondToChatPermissionRequest.fulfilled, (state, action) => {
                state.loading.respondingToRequest = false
                const { permissionRequest, chatRoom } = action.payload

                // Update the request status in received requests
                const requestIndex = state.permissionRequests.received.findIndex(
                    req => req._id === permissionRequest._id
                )
                if (requestIndex !== -1) {
                    state.permissionRequests.received[requestIndex] = permissionRequest
                }

                // If approved and chat was created, add to chats
                if (chatRoom && permissionRequest.status === 'approved') {
                    state.chats.unshift(chatRoom)
                    state.filteredChats = state.chats
                }
            })
            .addCase(respondToChatPermissionRequest.rejected, (state, action) => {
                state.loading.respondingToRequest = false
                state.error = action.payload
            })
    }
})

export const {
    setActiveChat,
    resetFilteredChats,
    addMessage,
    updateMessage,
    updateOnlineUserStatus,
    removeOnlineUser,
    setTypingUsers,
    clearTypingUsers,
    setSearchQuery,
    markMessageAsSeen,
    updateUnreadCount,
    clearError,
    clearMessages,
    addPermissionRequest,
    updatePermissionRequest,
    removePermissionRequest,
    clearLastPermissionRequestResult
} = chatSlice.actions

export default chatSlice.reducer

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 20, type, read } = params
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(type && { type }),
                ...(read !== undefined && { read: read.toString() }),
            })
            const response = await api.get(`/notifications?${queryParams}`)
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

export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId, { rejectWithValue }) => {
        try {
            const response = await api.put(`/notifications/${notificationId}/read`)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return notificationId
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.put('/notifications/read-all')
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return true
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const deleteNotification = createAsyncThunk(
    'notifications/deleteNotification',
    async (notificationId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/notifications/${notificationId}`)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return notificationId
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

const initialState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    hasMore: true,
    page: 1,
}

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        resetNotifications: (state) => {
            state.notifications = []
            state.page = 1
            state.hasMore = true
        },
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload)
            if (!action.payload.read) {
                state.unreadCount += 1
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false
                if (action.payload.page === 1) {
                    state.notifications = action.payload.notifications
                } else {
                    state.notifications = [...state.notifications, ...action.payload.notifications]
                }
                state.unreadCount = action.payload.unreadCount
                state.hasMore = action.payload.hasMore
                state.page = action.payload.page
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Mark as read
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n.id === action.payload)
                if (notification && !notification.read) {
                    notification.read = true
                    state.unreadCount -= 1
                }
            })
            // Mark all as read
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications.forEach(notification => {
                    notification.read = true
                })
                state.unreadCount = 0
            })
            // Delete notification
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const index = state.notifications.findIndex(n => n.id === action.payload)
                if (index !== -1) {
                    const notification = state.notifications[index]
                    if (!notification.read) {
                        state.unreadCount -= 1
                    }
                    state.notifications.splice(index, 1)
                }
            })
    },
})

export const { clearError, resetNotifications, addNotification } = notificationsSlice.actions
export default notificationsSlice.reducer

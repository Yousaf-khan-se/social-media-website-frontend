import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import notificationService from '../../services/notificationService'

// Async thunks for notifications
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 20, type, unreadOnly } = params
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(type && { type }),
                ...(unreadOnly !== undefined && { unreadOnly: unreadOnly.toString() })
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

export const clearAllNotifications = createAsyncThunk(
    'notifications/clearAllNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.delete('/notifications')
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

// FCM Token management
export const subscribeToPushNotifications = createAsyncThunk(
    'notifications/subscribeToPushNotifications',
    async (tokenData, { rejectWithValue }) => {
        try {
            const initialized = await notificationService.initialize()
            if (!initialized) {
                return rejectWithValue({ error: 'Failed to initialize push notifications' })
            }
            return { success: true, token: notificationService.fcmToken }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const unsubscribeFromPushNotifications = createAsyncThunk(
    'notifications/unsubscribeFromPushNotifications',
    async (_, { rejectWithValue }) => {
        try {
            await notificationService.disable()
            return { success: true }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

// Notification settings
export const fetchNotificationSettings = createAsyncThunk(
    'notifications/fetchNotificationSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await notificationService.getSettings()
            if (!response.success) {
                return rejectWithValue(response)
            }
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const updateNotificationSettings = createAsyncThunk(
    'notifications/updateNotificationSettings',
    async (settings, { rejectWithValue }) => {
        try {
            const response = await notificationService.updateSettings(settings)
            if (!response.success) {
                return rejectWithValue(response)
            }
            return response
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
    // Settings state
    settings: {
        push: true,
        email: true,
        inApp: true,
        likes: true,
        comments: true,
        follows: true,
        messages: true,
        posts: true,
        admin: true,
    },
    settingsLoading: false,
    settingsError: null,
    // Push notification state
    pushSupported: false,
    pushEnabled: false,
    fcmToken: null,
}

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
            state.settingsError = null
        },
        resetNotifications: (state) => {
            state.notifications = []
            state.page = 1
            state.hasMore = true
        },
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload)
            if (!action.payload.read && !action.payload.isRead) {
                state.unreadCount += 1
            }
        },
        updateNotificationInList: (state, action) => {
            const { id, updates } = action.payload
            const notification = state.notifications.find(n =>
                (n._id === id || n.id === id)
            )
            if (notification) {
                Object.assign(notification, updates)
            }
        },
        setPushSupport: (state, action) => {
            state.pushSupported = action.payload
        },
        setPushEnabled: (state, action) => {
            state.pushEnabled = action.payload
        },
        setFcmToken: (state, action) => {
            state.fcmToken = action.payload
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
                const index = state.notifications.findIndex(n =>
                    (n._id === action.payload || n.id === action.payload)
                )
                if (index !== -1) {
                    const notification = state.notifications[index]
                    if (!notification.read && !notification.isRead) {
                        state.unreadCount -= 1
                    }
                    state.notifications.splice(index, 1)
                }
            })
            // Clear all notifications
            .addCase(clearAllNotifications.fulfilled, (state) => {
                state.notifications = []
                state.unreadCount = 0
            })
            // Push notification subscription
            .addCase(subscribeToPushNotifications.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(subscribeToPushNotifications.fulfilled, (state, action) => {
                state.isLoading = false
                state.pushEnabled = true
                state.fcmToken = action.payload.token
                state.settings.push = true
            })
            .addCase(subscribeToPushNotifications.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
                state.pushEnabled = false
            })
            // Push notification unsubscription
            .addCase(unsubscribeFromPushNotifications.fulfilled, (state) => {
                state.pushEnabled = false
                state.fcmToken = null
                state.settings.push = false
            })
            // Notification settings
            .addCase(fetchNotificationSettings.pending, (state) => {
                state.settingsLoading = true
                state.settingsError = null
            })
            .addCase(fetchNotificationSettings.fulfilled, (state, action) => {
                state.settingsLoading = false
                state.settings = { ...state.settings, ...action.payload.data }
            })
            .addCase(fetchNotificationSettings.rejected, (state, action) => {
                state.settingsLoading = false
                state.settingsError = action.payload
            })
            .addCase(updateNotificationSettings.pending, (state) => {
                state.settingsLoading = true
                state.settingsError = null
            })
            .addCase(updateNotificationSettings.fulfilled, (state, action) => {
                state.settingsLoading = false
                state.settings = { ...state.settings, ...action.payload.data }
            })
            .addCase(updateNotificationSettings.rejected, (state, action) => {
                state.settingsLoading = false
                state.settingsError = action.payload
            })
    },
})

export const {
    clearError,
    resetNotifications,
    addNotification,
    updateNotificationInList,
    setPushSupport,
    setPushEnabled,
    setFcmToken
} = notificationsSlice.actions
export default notificationsSlice.reducer

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchSettings = createAsyncThunk(
    'settings/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/settings')
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

export const fetchSettingsSummary = createAsyncThunk(
    'settings/fetchSettingsSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/settings/summary')
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

export const updateSettings = createAsyncThunk(
    'settings/updateSettings',
    async ({ section, updates }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/settings/${section}`, updates)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { section, data }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

// Individual section update thunks
export const updatePrivacySettings = createAsyncThunk(
    'settings/updatePrivacySettings',
    async (updates, { rejectWithValue }) => {
        try {
            const response = await api.put('/settings/privacy', updates)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { section: 'privacy', data }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const updateNotificationSettings = createAsyncThunk(
    'settings/updateNotificationSettings',
    async (updates, { rejectWithValue }) => {
        try {
            const response = await api.put('/settings/notifications', updates)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { section: 'notifications', data }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const updateSecuritySettings = createAsyncThunk(
    'settings/updateSecuritySettings',
    async (updates, { rejectWithValue }) => {
        try {
            const response = await api.put('/settings/security', updates)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { section: 'security', data }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const updateChatSettings = createAsyncThunk(
    'settings/updateChatSettings',
    async (updates, { rejectWithValue }) => {
        try {
            const response = await api.put('/settings/chat', updates)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { section: 'chat', data }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const updateContentSettings = createAsyncThunk(
    'settings/updateContentSettings',
    async (updates, { rejectWithValue }) => {
        try {
            const response = await api.put('/settings/content', updates)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { section: 'content', data }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const updateAccessibilitySettings = createAsyncThunk(
    'settings/updateAccessibilitySettings',
    async (updates, { rejectWithValue }) => {
        try {
            const response = await api.put('/settings/accessibility', updates)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { section: 'accessibility', data }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const updatePreferencesSettings = createAsyncThunk(
    'settings/updatePreferencesSettings',
    async (updates, { rejectWithValue }) => {
        try {
            const response = await api.put('/settings/preferences', updates)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { section: 'preferences', data }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const exportSettings = createAsyncThunk(
    'settings/exportSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/settings/export', {
                responseType: 'blob'
            })

            const blob = new Blob([response.data], { type: 'application/json' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            return { success: true }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const importSettings = createAsyncThunk(
    'settings/importSettings',
    async (file, { rejectWithValue }) => {
        try {
            const formData = new FormData()
            formData.append('settings', file)

            const response = await api.post('/settings/import', formData, {
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

export const resetSettings = createAsyncThunk(
    'settings/resetSettings',
    async (section = null, { rejectWithValue }) => {
        try {
            const response = await api.post('/settings/reset', section ? { section } : {})
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { section, data }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const fetchBlockedUsers = createAsyncThunk(
    'settings/fetchBlockedUsers',
    async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
        try {
            const response = await api.get(`/settings/blocked-users?page=${page}&limit=${limit}`)
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

export const blockUser = createAsyncThunk(
    'settings/blockUser',
    async ({ targetUserId, reason }, { rejectWithValue }) => {
        try {
            const response = await api.post('/settings/block', { targetUserId, reason })
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

export const unblockUser = createAsyncThunk(
    'settings/unblockUser',
    async (targetUserId, { rejectWithValue }) => {
        try {
            const response = await api.post('/settings/unblock', { targetUserId })
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { targetUserId }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const fetchBlockedKeywords = createAsyncThunk(
    'settings/fetchBlockedKeywords',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/settings/blocked-keywords')
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            // Fetched blocked keywords successfully
            return data
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const addBlockedKeyword = createAsyncThunk(
    'settings/addBlockedKeyword',
    async (keyword, { rejectWithValue }) => {
        try {
            const response = await api.post('/settings/block-keyword', { keyword })
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

export const removeBlockedKeyword = createAsyncThunk(
    'settings/removeBlockedKeyword',
    async (keyword, { rejectWithValue }) => {
        try {
            const response = await api.post('/settings/unblock-keyword', { keyword })
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { keyword }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

// Security actions
export const changePassword = createAsyncThunk(
    'settings/changePassword',
    async ({ currentPassword, newPassword }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/change-password', {
                currentPassword,
                newPassword
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

export const logoutAllDevices = createAsyncThunk(
    'settings/logoutAllDevices',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/logout-all')
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

const initialState = {
    settings: {
        privacy: {},
        notifications: {},
        security: {},
        chat: {},
        content: {},
        accessibility: {},
        preferences: {},
        blocked: {}
    },
    settingsSummary: null,
    blockedUsers: [],
    blockedKeywords: [],
    blockedKeywordsPagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 20
    },
    blockedUsersPagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 20
    },
    isLoading: false,
    isLoadingSummary: false,
    isExporting: false,
    isImporting: false,
    isUpdating: false,
    isResetting: false,
    isLoadingBlocked: false,
    isChangingPassword: false,
    isLoggingOutAll: false,
    isBlockingUser: false,
    error: null,
    exportError: null,
    importError: null,
    updateError: null,
    resetError: null,
    blockedError: null,
    securityError: null
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
            state.exportError = null
            state.importError = null
            state.updateError = null
            state.resetError = null
            state.blockedError = null
            state.securityError = null
        },
        clearExportError: (state) => {
            state.exportError = null
        },
        clearImportError: (state) => {
            state.importError = null
        },
        clearUpdateError: (state) => {
            state.updateError = null
        },
        clearResetError: (state) => {
            state.resetError = null
        },
        clearBlockedError: (state) => {
            state.blockedError = null
        },
        clearSecurityError: (state) => {
            state.securityError = null
        },
        updateLocalSettings: (state, action) => {
            const { section, updates } = action.payload
            state.settings[section] = {
                ...state.settings[section],
                ...updates
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch settings
            .addCase(fetchSettings.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.isLoading = false
                state.settings = action.payload.data?.settings || action.payload.settings || state.settings
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Fetch settings summary
            .addCase(fetchSettingsSummary.pending, (state) => {
                state.isLoadingSummary = true
                state.error = null
            })
            .addCase(fetchSettingsSummary.fulfilled, (state, action) => {
                state.isLoadingSummary = false
                state.settingsSummary = action.payload.data?.summary || action.payload.summary
            })
            .addCase(fetchSettingsSummary.rejected, (state, action) => {
                state.isLoadingSummary = false
                state.error = action.payload
            })

            // Update settings
            .addCase(updateSettings.pending, (state) => {
                state.isUpdating = true
                state.updateError = null
            })
            .addCase(updateSettings.fulfilled, (state, action) => {
                state.isUpdating = false
                const { section, data } = action.payload
                state.settings[section] = {
                    ...state.settings[section],
                    ...(data.data?.settings || data.settings || {})
                }
            })
            .addCase(updateSettings.rejected, (state, action) => {
                state.isUpdating = false
                state.updateError = action.payload
            })

            // Individual settings updates
            .addCase(updatePrivacySettings.pending, (state) => {
                state.isUpdating = true
                state.updateError = null
            })
            .addCase(updatePrivacySettings.fulfilled, (state, action) => {
                state.isUpdating = false
                const { data } = action.payload
                state.settings.privacy = {
                    ...state.settings.privacy,
                    ...(data.data?.settings || data.settings || {})
                }
            })
            .addCase(updatePrivacySettings.rejected, (state, action) => {
                state.isUpdating = false
                state.updateError = action.payload
            })

            .addCase(updateNotificationSettings.pending, (state) => {
                state.isUpdating = true
                state.updateError = null
            })
            .addCase(updateNotificationSettings.fulfilled, (state, action) => {
                state.isUpdating = false
                const { data } = action.payload
                state.settings.notifications = {
                    ...state.settings.notifications,
                    ...(data.data?.settings || data.settings || {})
                }
            })
            .addCase(updateNotificationSettings.rejected, (state, action) => {
                state.isUpdating = false
                state.updateError = action.payload
            })

            .addCase(updateSecuritySettings.pending, (state) => {
                state.isUpdating = true
                state.updateError = null
            })
            .addCase(updateSecuritySettings.fulfilled, (state, action) => {
                state.isUpdating = false
                const { data } = action.payload
                state.settings.security = {
                    ...state.settings.security,
                    ...(data.data?.settings || data.settings || {})
                }
            })
            .addCase(updateSecuritySettings.rejected, (state, action) => {
                state.isUpdating = false
                state.updateError = action.payload
            })

            .addCase(updateChatSettings.pending, (state) => {
                state.isUpdating = true
                state.updateError = null
            })
            .addCase(updateChatSettings.fulfilled, (state, action) => {
                state.isUpdating = false
                const { data } = action.payload
                state.settings.chat = {
                    ...state.settings.chat,
                    ...(data.data?.settings || data.settings || {})
                }
            })
            .addCase(updateChatSettings.rejected, (state, action) => {
                state.isUpdating = false
                state.updateError = action.payload
            })

            .addCase(updateContentSettings.pending, (state) => {
                state.isUpdating = true
                state.updateError = null
            })
            .addCase(updateContentSettings.fulfilled, (state, action) => {
                state.isUpdating = false
                const { data } = action.payload
                state.settings.content = {
                    ...state.settings.content,
                    ...(data.data?.settings || data.settings || {})
                }
            })
            .addCase(updateContentSettings.rejected, (state, action) => {
                state.isUpdating = false
                state.updateError = action.payload
            })

            .addCase(updateAccessibilitySettings.pending, (state) => {
                state.isUpdating = true
                state.updateError = null
            })
            .addCase(updateAccessibilitySettings.fulfilled, (state, action) => {
                state.isUpdating = false
                const { data } = action.payload
                state.settings.accessibility = {
                    ...state.settings.accessibility,
                    ...(data.data?.settings || data.settings || {})
                }
            })
            .addCase(updateAccessibilitySettings.rejected, (state, action) => {
                state.isUpdating = false
                state.updateError = action.payload
            })

            .addCase(updatePreferencesSettings.pending, (state) => {
                state.isUpdating = true
                state.updateError = null
            })
            .addCase(updatePreferencesSettings.fulfilled, (state, action) => {
                state.isUpdating = false
                const { data } = action.payload
                state.settings.preferences = {
                    ...state.settings.preferences,
                    ...(data.data?.settings || data.settings || {})
                }
            })
            .addCase(updatePreferencesSettings.rejected, (state, action) => {
                state.isUpdating = false
                state.updateError = action.payload
            })

            // Export settings
            .addCase(exportSettings.pending, (state) => {
                state.isExporting = true
                state.exportError = null
            })
            .addCase(exportSettings.fulfilled, (state) => {
                state.isExporting = false
            })
            .addCase(exportSettings.rejected, (state, action) => {
                state.isExporting = false
                state.exportError = action.payload
            })

            // Import settings
            .addCase(importSettings.pending, (state) => {
                state.isImporting = true
                state.importError = null
            })
            .addCase(importSettings.fulfilled, (state, action) => {
                state.isImporting = false
                state.settings = action.payload.data?.settings || action.payload.settings || state.settings
            })
            .addCase(importSettings.rejected, (state, action) => {
                state.isImporting = false
                state.importError = action.payload
            })

            // Reset settings
            .addCase(resetSettings.pending, (state) => {
                state.isResetting = true
                state.resetError = null
            })
            .addCase(resetSettings.fulfilled, (state, action) => {
                state.isResetting = false
                const { section, data } = action.payload
                if (section) {
                    // Reset specific section
                    state.settings[section] = data.data?.settings?.[section] || data.settings?.[section] || {}
                } else {
                    // Reset all settings
                    state.settings = data.data?.settings || data.settings || initialState.settings
                }
            })
            .addCase(resetSettings.rejected, (state, action) => {
                state.isResetting = false
                state.resetError = action.payload
            })

            // Fetch blocked users
            .addCase(fetchBlockedUsers.pending, (state) => {
                state.isLoadingBlocked = true
                state.blockedError = null
            })
            .addCase(fetchBlockedUsers.fulfilled, (state, action) => {
                state.isLoadingBlocked = false
                const data = action.payload.data
                state.blockedUsers = data?.blockedUsers || []
                state.blockedUsersPagination = {
                    currentPage: data?.currentPage || 1,
                    totalPages: data?.totalPages || 1,
                    totalCount: data?.totalCount || 0,
                    limit: state.blockedUsersPagination.limit
                }
            })
            .addCase(fetchBlockedUsers.rejected, (state, action) => {
                state.isLoadingBlocked = false
                state.blockedError = action.payload
            })

            // Block user
            .addCase(blockUser.pending, (state) => {
                state.isBlockingUser = true
                state.blockedError = null
            })
            .addCase(blockUser.fulfilled, (state) => {
                state.isBlockingUser = false
                // Refresh the blocked users list
                // This will be handled by re-fetching blocked users in the component
            })
            .addCase(blockUser.rejected, (state, action) => {
                state.isBlockingUser = false
                state.blockedError = action.payload
            })

            // Unblock user
            .addCase(unblockUser.fulfilled, (state, action) => {
                state.blockedUsers = state.blockedUsers.filter(
                    blockedUser => blockedUser.user._id !== action.payload.targetUserId
                )
                state.blockedUsersPagination.totalCount = Math.max(0, state.blockedUsersPagination.totalCount - 1)
            })
            .addCase(unblockUser.rejected, (state, action) => {
                state.blockedError = action.payload
            })

            // Fetch blocked keywords
            .addCase(fetchBlockedKeywords.fulfilled, (state, action) => {
                state.blockedKeywords = action.payload.blockedKeywords || []
                state.blockedKeywordsPagination = {
                    currentPage: action.payload.currentPage || 1,
                    totalCount: action.payload.totalCount || 0,
                    totalPages: action.payload.totalPages || 1,
                }
            })
            .addCase(fetchBlockedKeywords.rejected, (state, action) => {
                state.blockedError = action.payload
            })

            // Add blocked keyword
            .addCase(addBlockedKeyword.fulfilled, (state, action) => {
                state.blockedKeywords.push(action.payload.data || action.payload)
            })
            .addCase(addBlockedKeyword.rejected, (state, action) => {
                state.blockedError = action.payload
            })

            // Remove blocked keyword
            .addCase(removeBlockedKeyword.fulfilled, (state, action) => {
                state.blockedKeywords = state.blockedKeywords.filter(
                    keywordItem => keywordItem.keyword !== action.payload.keyword
                )
            })
            .addCase(removeBlockedKeyword.rejected, (state, action) => {
                state.blockedError = action.payload
            })

            // Change password
            .addCase(changePassword.pending, (state) => {
                state.isChangingPassword = true
                state.securityError = null
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.isChangingPassword = false
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.isChangingPassword = false
                state.securityError = action.payload
            })

            // Logout all devices
            .addCase(logoutAllDevices.pending, (state) => {
                state.isLoggingOutAll = true
                state.securityError = null
            })
            .addCase(logoutAllDevices.fulfilled, (state) => {
                state.isLoggingOutAll = false
            })
            .addCase(logoutAllDevices.rejected, (state, action) => {
                state.isLoggingOutAll = false
                state.securityError = action.payload
            })
    }
})

export const {
    clearError,
    clearExportError,
    clearImportError,
    clearUpdateError,
    clearResetError,
    clearBlockedError,
    clearSecurityError,
    updateLocalSettings
} = settingsSlice.actions

export default settingsSlice.reducer

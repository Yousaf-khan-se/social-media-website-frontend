import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Simplified Auth Check - just check if we have a valid session
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/me')
            return response.data
        } catch {
            // If 401 or any error, user is not authenticated
            return rejectWithValue(null)
        }
    }
)

// Login action
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials)
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

// Register action
export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/register', userData)
            const data = response.data
            if (!data.success) {
                // If backend returns success: false, treat as error
                return rejectWithValue(data)
            }
            return data
        } catch (error) {
            // If error.response.data exists, use it; else fallback to error.message
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

// Logout action
export const logout = createAsyncThunk(
    'auth/logout',
    async () => {
        try {
            await api.post('/auth/logout')
        } catch {
            // Even if logout fails, clear local state
        }
        return true
    }
)

// Forgot password
export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/forgot-password', { email })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

// Reset password
export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ token, newPassword }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/reset-password', { token, newPassword })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

// Change password
export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async ({ currentPassword, newPassword }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/change-password', { currentPassword, newPassword })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await api.put('/users/profile', profileData)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            console.log('update Profile data: ', data)
            return data
        } catch (error) {
            console.log('update Profile error: ', error)
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

// Simple initial state for HTTP secure cookies
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    initialized: false, // Has the app checked auth status?
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearAuth: (state) => {
            state.user = null
            state.isAuthenticated = false
            state.error = null
            state.initialized = true
        },
    },
    extraReducers: (builder) => {
        builder
            // Initial auth check
            .addCase(checkAuth.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload.user
                state.isAuthenticated = true
                state.initialized = true
                state.error = null
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isLoading = false
                state.user = null
                state.isAuthenticated = false
                state.initialized = true // <--- ENSURE THIS IS ALWAYS TRUE
                state.error = null
            })
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload.user
                state.isAuthenticated = true
                state.initialized = true
                state.error = null
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
                state.isAuthenticated = false
            })
            // Register
            .addCase(register.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload.user
                state.isAuthenticated = true
                state.initialized = true
                state.error = null
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
                state.isAuthenticated = false
            })
            //update user
            .addCase(updateProfile.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload.user
                state.error = null
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.isLoading = false
                state.user = null
                state.isAuthenticated = false
                state.initialized = true // <--- ENSURE THIS IS ALWAYS TRUE
                state.error = action.payload
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null
                state.isAuthenticated = false
                state.error = null
                state.initialized = true
            })
    },
})

export const { clearError, clearAuth } = authSlice.actions
export default authSlice.reducer

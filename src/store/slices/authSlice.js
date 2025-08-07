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

// Delete account action
export const deleteAccount = createAsyncThunk(
    'auth/deleteAccount',
    async (_, { rejectWithValue }) => {
        try {
            await api.delete('/auth/account')
            return true
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

// Forgot password
export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/forgot-password', { email: data.email, username: data.username })
            return {
                ...response.data,
                requestEmail: data.email // Store the email from request
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const verifyOTP = createAsyncThunk(
    'auth/verifyOTP',
    async ({ otp, email }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/verify-otp', { otp, email })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

// Reset password
export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ otp, newPassword }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/reset-password', { otp, newPassword })
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

//update profile
export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await api.put('/users/profile', profileData)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            // Profile data updated successfully
            return data
        } catch (error) {
            // Profile update failed
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const followUser = createAsyncThunk(
    'profile/followUser',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.post(`/users/${userId}/follow`)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const unfollowUser = createAsyncThunk(
    'profile/unfollowUser',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/users/${userId}/follow`)
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

export const uploadProfilePicture = createAsyncThunk(
    'auth/uploadProfilePicture',
    async (profilePicture, { rejectWithValue }) => {
        try {
            const response = await api.post('/users/profile-picture', profilePicture, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
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

// Simple initial state for HTTP secure cookies
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    initialized: false, // Has the app checked auth status?
    success: false, // For actions like password reset
    message: null, // For success messages,
    forgotPasswordMailAdress: null, // For storing email address used in forgot password

    otpVerifying: false,
    otpData: null, // For storing OTP data {email, username, message} message is actually success message
    otpError: null, // For storing OTP errors
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearSuccess: (state) => {
            state.success = null
        },
        clearAuth: (state) => {
            state.user = null
            state.isAuthenticated = false
            state.error = null
            state.initialized = true
        },
        resetOTPdata: (state) => {
            state.otpData = null
        },
        resetOTPerror: (state) => {
            state.otpError = null
        }
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
                state.initialized = true
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
            .addCase(register.fulfilled, (state) => {
                state.isLoading = false
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
                state.initialized = true
                state.error = action.payload
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null
                state.isAuthenticated = false
                state.initialized = true
                state.error = null
            })
            // Delete account
            .addCase(deleteAccount.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(deleteAccount.fulfilled, (state) => {
                state.user = null
                state.isAuthenticated = false
                state.initialized = true
                state.error = null
                state.isLoading = false
            })
            .addCase(deleteAccount.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Follow user
            .addCase(followUser.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = { ...state.user, ...action.payload.user }
                state.error = null;
            })
            // Unfollow user
            .addCase(unfollowUser.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = { ...state.user, ...action.payload.user }
                state.error = null;
            })
            // upload profile picture
            .addCase(uploadProfilePicture.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(uploadProfilePicture.fulfilled, (state, action) => {
                state.isLoading = false
                state.user.profilePicture = action.payload.profilePicture; // url of profile picture
                state.error = null
            })
            .addCase(uploadProfilePicture.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Forgot password
            .addCase(forgotPassword.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.success = false
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.isLoading = false
                state.success = true
                state.message = action.payload.data?.message || 'Check your email for reset instructions.'
                state.forgotPasswordMailAdress = action.payload.requestEmail || null
                state.error = null
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload?.error || action.payload?.message || 'Failed to send password reset email.'
                state.success = false
            })

            //reset password
            .addCase(resetPassword.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.success = false
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.isLoading = false
                state.success = true
                state.message = action.payload.data?.message || 'Your password has been reset successfully.'
                state.error = null
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload?.error || action.payload?.message || 'Failed to reset password.'
                state.success = false
            })

            // otp verification
            .addCase(verifyOTP.pending, (state) => {
                state.otpVerifying = true
                state.otpError = null
            })
            .addCase(verifyOTP.fulfilled, (state, action) => {
                state.otpVerifying = false
                state.otpData = action.payload
                state.otpError = null
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.otpVerifying = false
                state.otpError = action.payload?.error || action.payload?.message || 'Failed to verify OTP.'
            })
    },
})

export const { clearError, clearAuth, clearSuccess, resetOTPerror, resetOTPdata } = authSlice.actions
export default authSlice.reducer

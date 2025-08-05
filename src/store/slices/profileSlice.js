import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchProfile = createAsyncThunk(
    'profile/fetchProfile',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/users/${userId}`)
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

export const updateProfile = createAsyncThunk(
    'profile/updateProfile',
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

export const uploadAvatar = createAsyncThunk(
    'profile/uploadAvatar',
    async (file, { rejectWithValue }) => {
        try {
            const formData = new FormData()
            formData.append('avatar', file)
            const response = await api.post('/users/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const uploadCoverPhoto = createAsyncThunk(
    'profile/uploadCoverPhoto',
    async (file, { rejectWithValue }) => {
        try {
            const formData = new FormData()
            formData.append('cover', file)
            const response = await api.post('/users/cover', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const fetchFollowers = createAsyncThunk(
    'profile/fetchFollowers',
    async (userId, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 20 } = {}
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            })
            const response = await api.get(`/users/${userId}/followers?${queryParams}`)
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

export const fetchFollowing = createAsyncThunk(
    'profile/fetchFollowing',
    async (userId, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 20 } = {}
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            })
            const response = await api.get(`/users/${userId}/following?${queryParams}`)
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
    currentProfile: null,
    followers: [],
    following: [],
    isLoading: false,
    error: null,
    isFollowing: false,
    limit: 10,
    hasMore: false,
    visibility: 'public', // default visibility
}

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearProfile: (state) => {
            state.currentProfile = null
            state.followers = []
            state.following = []
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch profile
            .addCase(fetchProfile.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                // Profile fetched successfully
                state.isLoading = false
                state.currentProfile = action.payload.user
                state.visibility = action.payload.visibility || 'public'
                state.error = null;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Update profile
            .addCase(updateProfile.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.isLoading = false
                state.currentProfile = { ...state.currentProfile, ...action.payload.user }
                state.error = null;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Fetch followers
            .addCase(fetchFollowers.fulfilled, (state, action) => {
                state.followers = action.payload
                state.error = null;
            })
            // Fetch following
            .addCase(fetchFollowing.fulfilled, (state, action) => {
                state.following = action.payload
                state.error = null;
            })

    },
})

export const { clearError, clearProfile } = profileSlice.actions
export default profileSlice.reducer

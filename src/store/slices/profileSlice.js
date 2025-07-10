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
            console.log('update Profile data: ', data)
            return data
        } catch (error) {
            console.log('update Profile error: ', error)
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

export const followUser = createAsyncThunk(
    'profile/followUser',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.post(`/users/${userId}/follow`)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { userId, ...data }
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
            return { userId, ...data }
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
                state.isLoading = false
                state.currentProfile = action.payload
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
                console.log('update Profile data: ', action.payload)
                state.currentProfile = { ...state.currentProfile, ...action.payload.user }
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Follow user
            .addCase(followUser.fulfilled, (state, action) => {
                if (state.currentProfile && state.currentProfile.id === action.payload.userId) {
                    state.currentProfile.isFollowing = true
                    state.currentProfile.followersCount += 1
                }
                state.isFollowing = true
            })
            // Unfollow user
            .addCase(unfollowUser.fulfilled, (state, action) => {
                if (state.currentProfile && state.currentProfile.id === action.payload.userId) {
                    state.currentProfile.isFollowing = false
                    state.currentProfile.followersCount -= 1
                }
                state.isFollowing = false
            })
            // Fetch followers
            .addCase(fetchFollowers.fulfilled, (state, action) => {
                state.followers = action.payload
            })
            // Fetch following
            .addCase(fetchFollowing.fulfilled, (state, action) => {
                state.following = action.payload
            })
    },
})

export const { clearError, clearProfile } = profileSlice.actions
export default profileSlice.reducer

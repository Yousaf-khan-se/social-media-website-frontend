import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const searchUsers = createAsyncThunk(
    'posts/searchUsers',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { query, page = 1, limit = 10 } = params
            const queryParams = new URLSearchParams({
                query,
                page: page.toString(),
                limit: limit.toString(),
            })
            const response = await api.get(`/users/search?${queryParams}`)
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

export const fetchAuthUserFollowings = createAsyncThunk(
    'posts/fetchAuthUserFollowings',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { query, page = 1, limit = 10 } = params
            const queryParams = new URLSearchParams({
                query,
                page: page.toString(),
                limit: limit.toString(),
            })
            const response = await api.get(`/users/followings?${queryParams}`)
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

export const fetchAuthUserFollowers = createAsyncThunk(
    'posts/fetchAuthUserFollowers',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { query, page = 1, limit = 10 } = params
            const queryParams = new URLSearchParams({
                query,
                page: page.toString(),
                limit: limit.toString(),
            })
            const response = await api.get(`/users/followers?${queryParams}`)
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
    profiles: [],
    isLoadingProfiles: false,
    error: null,
    limit: 10,
    hasMore: false,
}

const profileListSlice = createSlice({
    name: 'profileList',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearProfiles: (state) => {
            state.profiles = []
        },
    }, extraReducers: (builder) => {
        builder
            // Search users
            .addCase(searchUsers.pending, (state) => {
                state.isLoadingProfiles = true
                state.error = null
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
                state.isLoadingProfiles = false
                if (action.payload.pagination.page === 1) {
                    state.profiles = action.payload.profiles || []
                } else {
                    state.profiles = [...state.profiles, ...(action.payload.profiles || [])]
                }
                state.page = action.payload.pagination.page
                // Optionally calculate hasMore:
                const total = action.payload.pagination.total || 0
                state.limit = action.payload.pagination.limit || 10
                state.hasMore = state.profiles.length < total
            })
            .addCase(searchUsers.rejected, (state, action) => {
                state.isLoadingProfiles = false
                state.error = action.payload
            })
            // Fetch Auth User Followings
            .addCase(fetchAuthUserFollowings.pending, (state) => {
                state.isLoadingProfiles = true
                state.error = null
            })
            .addCase(fetchAuthUserFollowings.fulfilled, (state, action) => {
                const uniqueProfiles = new Map();
                state.isLoadingProfiles = false;
                [...state.profiles, ...(action.payload.profiles || [])].forEach(
                    profile => uniqueProfiles.set(profile._id, profile)
                );
                state.profiles = Array.from(uniqueProfiles.values());
                state.page = action.payload.pagination.page;
                const total = action.payload.pagination.total || 0;
                state.limit = action.payload.pagination.limit || 10;
                state.hasMore = state.profiles.length < total;
            })
            .addCase(fetchAuthUserFollowings.rejected, (state, action) => {
                state.isLoadingProfiles = false
                state.error = action.payload
            })
            // Fetch Auth User Followers
            .addCase(fetchAuthUserFollowers.pending, (state) => {
                state.isLoadingProfiles = true
                state.error = null
            })
            .addCase(fetchAuthUserFollowers.fulfilled, (state, action) => {
                const uniqueProfiles = new Map();
                state.isLoadingProfiles = false;
                [...state.profiles, ...(action.payload.profiles || [])].forEach(
                    profile => uniqueProfiles.set(profile._id, profile)
                );
                state.profiles = Array.from(uniqueProfiles.values());
                state.page = action.payload.pagination.page;
                const total = action.payload.pagination.total || 0;
                state.limit = action.payload.pagination.limit || 10;
                state.hasMore = state.profiles.length < total;
            })
            .addCase(fetchAuthUserFollowers.rejected, (state, action) => {
                state.isLoadingProfiles = false
                state.error = action.payload
            })
    },
})

export const { clearError, clearProfiles } = profileListSlice.actions

export default profileListSlice.reducer
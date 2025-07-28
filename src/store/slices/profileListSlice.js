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
    // Search results (other users)
    otherProfiles: [],
    searchPagination: {
        page: 1,
        limit: 10,
        total: 0,
        hasMore: false
    },

    // Followers data
    followersProfiles: [],
    followersPagination: {
        page: 1,
        limit: 10,
        total: 0,
        hasMore: false
    },

    // Following data  
    followingProfiles: [],
    followingPagination: {
        page: 1,
        limit: 10,
        total: 0,
        hasMore: false
    },

    // Loading states
    loadingStates: {
        search: false,
        followers: false,
        following: false
    },

    // Error states
    errors: {
        search: null,
        followers: null,
        following: null
    },

    // Legacy support (deprecated)
    isLoadingProfiles: false,
    error: null,
    limit: 10,
    hasMore: false,
}

const profileListSlice = createSlice({
    name: 'profileList',
    initialState,
    reducers: {
        // Clear all errors
        clearError: (state) => {
            state.errors.search = null
            state.errors.followers = null
            state.errors.following = null
            state.error = null // Legacy support
        },

        // Clear specific error types
        clearSearchError: (state) => {
            state.errors.search = null
        },

        clearFollowersError: (state) => {
            state.errors.followers = null
        },

        clearFollowingError: (state) => {
            state.errors.following = null
        },

        // Clear profiles
        clearProfiles: (state) => {
            state.otherProfiles = []
            state.searchPagination = { page: 1, limit: 10, total: 0, hasMore: false }
        },

        clearFollowers: (state) => {
            state.followersProfiles = []
            state.followersPagination = { page: 1, limit: 10, total: 0, hasMore: false }
        },

        clearFollowing: (state) => {
            state.followingProfiles = []
            state.followingPagination = { page: 1, limit: 10, total: 0, hasMore: false }
        },

        clearAllProfiles: (state) => {
            state.otherProfiles = []
            state.followersProfiles = []
            state.followingProfiles = []
            state.searchPagination = { page: 1, limit: 10, total: 0, hasMore: false }
            state.followersPagination = { page: 1, limit: 10, total: 0, hasMore: false }
            state.followingPagination = { page: 1, limit: 10, total: 0, hasMore: false }
        },

        // Update follow status in all relevant arrays
        updateFollowStatus: (state, action) => {
            const { userId, isFollowing } = action.payload

            // Helper function to update profile in array
            const updateProfileInArray = (profiles) => {
                const profile = profiles.find(p => p._id === userId)
                if (profile) {
                    profile.isFollowing = isFollowing
                    // Update followers count if needed
                    if (isFollowing) {
                        profile.followersCount = (profile.followersCount || 0) + 1
                    } else {
                        profile.followersCount = Math.max((profile.followersCount || 0) - 1, 0)
                    }
                }
            }

            updateProfileInArray(state.otherProfiles)
            updateProfileInArray(state.followersProfiles)
            updateProfileInArray(state.followingProfiles)
        }
    },
    extraReducers: (builder) => {
        builder
            // Search users
            .addCase(searchUsers.pending, (state) => {
                state.loadingStates.search = true
                state.errors.search = null
                // Legacy support
                state.isLoadingProfiles = true
                state.error = null
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
                state.loadingStates.search = false
                state.isLoadingProfiles = false

                const { profiles = [], pagination = {} } = action.payload
                const { page = 1, limit = 10, total = 0 } = pagination

                if (page === 1) {
                    // Replace profiles for first page
                    state.otherProfiles = profiles
                } else {
                    // Append profiles for subsequent pages, avoiding duplicates
                    const existingIds = new Set(state.otherProfiles.map(p => p._id))
                    const newProfiles = profiles.filter(p => !existingIds.has(p._id))
                    state.otherProfiles = [...state.otherProfiles, ...newProfiles]
                }

                // Update pagination
                state.searchPagination = {
                    page,
                    limit,
                    total,
                    hasMore: state.otherProfiles.length < total
                }

                // Legacy support
                state.page = page
                state.limit = limit
                state.hasMore = state.otherProfiles.length < total
            })
            .addCase(searchUsers.rejected, (state, action) => {
                state.loadingStates.search = false
                state.errors.search = action.payload
                // Legacy support
                state.isLoadingProfiles = false
                state.error = action.payload
            })

            // Fetch Auth User Followings
            .addCase(fetchAuthUserFollowings.pending, (state) => {
                state.loadingStates.following = true
                state.errors.following = null
                // Legacy support
                state.isLoadingProfiles = true
                state.error = null
            })
            .addCase(fetchAuthUserFollowings.fulfilled, (state, action) => {
                state.loadingStates.following = false
                state.isLoadingProfiles = false

                const { profiles = [], pagination = {} } = action.payload
                const { page = 1, limit = 10, total = 0 } = pagination

                if (page === 1) {
                    // Replace profiles for first page
                    state.followingProfiles = profiles
                } else {
                    // Append profiles for subsequent pages, avoiding duplicates
                    const existingIds = new Set(state.followingProfiles.map(p => p._id))
                    const newProfiles = profiles.filter(p => !existingIds.has(p._id))
                    state.followingProfiles = [...state.followingProfiles, ...newProfiles]
                }

                // Update pagination
                state.followingPagination = {
                    page,
                    limit,
                    total,
                    hasMore: state.followingProfiles.length < total
                }

                // Legacy support - also update otherProfiles for backward compatibility
                const existingOtherIds = new Set(state.otherProfiles.map(p => p._id))
                const newOtherProfiles = profiles.filter(p => !existingOtherIds.has(p._id))
                state.otherProfiles = [...state.otherProfiles, ...newOtherProfiles]
                state.page = page
                state.limit = limit
                state.hasMore = state.followingProfiles.length < total
            })
            .addCase(fetchAuthUserFollowings.rejected, (state, action) => {
                state.loadingStates.following = false
                state.errors.following = action.payload
                // Legacy support
                state.isLoadingProfiles = false
                state.error = action.payload
            })

            // Fetch Auth User Followers
            .addCase(fetchAuthUserFollowers.pending, (state) => {
                state.loadingStates.followers = true
                state.errors.followers = null
                // Legacy support
                state.isLoadingProfiles = true
                state.error = null
            })
            .addCase(fetchAuthUserFollowers.fulfilled, (state, action) => {
                state.loadingStates.followers = false
                state.isLoadingProfiles = false

                const { profiles = [], pagination = {} } = action.payload
                const { page = 1, limit = 10, total = 0 } = pagination

                if (page === 1) {
                    // Replace profiles for first page
                    state.followersProfiles = profiles
                } else {
                    // Append profiles for subsequent pages, avoiding duplicates
                    const existingIds = new Set(state.followersProfiles.map(p => p._id))
                    const newProfiles = profiles.filter(p => !existingIds.has(p._id))
                    state.followersProfiles = [...state.followersProfiles, ...newProfiles]
                }

                // Update pagination
                state.followersPagination = {
                    page,
                    limit,
                    total,
                    hasMore: state.followersProfiles.length < total
                }

                // Legacy support - also update otherProfiles for backward compatibility
                const existingOtherIds = new Set(state.otherProfiles.map(p => p._id))
                const newOtherProfiles = profiles.filter(p => !existingOtherIds.has(p._id))
                state.otherProfiles = [...state.otherProfiles, ...newOtherProfiles]
                state.page = page
                state.limit = limit
                state.hasMore = state.followersProfiles.length < total
            })
            .addCase(fetchAuthUserFollowers.rejected, (state, action) => {
                state.loadingStates.followers = false
                state.errors.followers = action.payload
                // Legacy support
                state.isLoadingProfiles = false
                state.error = action.payload
            })
    },
})

export const {
    clearError,
    clearProfiles,
    clearSearchError,
    clearFollowersError,
    clearFollowingError,
    clearFollowers,
    clearFollowing,
    clearAllProfiles,
    updateFollowStatus
} = profileListSlice.actions

export default profileListSlice.reducer
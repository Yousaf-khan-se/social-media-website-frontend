/**
 * Utility functions and selectors for the optimized profileListSlice
 */

// Selectors for different profile types
export const selectSearchProfiles = (state) => state.profileList.otherProfiles
export const selectFollowersProfiles = (state) => state.profileList.followersProfiles
export const selectFollowingProfiles = (state) => state.profileList.followingProfiles

// Pagination selectors
export const selectSearchPagination = (state) => state.profileList.searchPagination
export const selectFollowersPagination = (state) => state.profileList.followersPagination
export const selectFollowingPagination = (state) => state.profileList.followingPagination

// Loading state selectors
export const selectIsSearchLoading = (state) => state.profileList.loadingStates.search
export const selectIsFollowersLoading = (state) => state.profileList.loadingStates.followers
export const selectIsFollowingLoading = (state) => state.profileList.loadingStates.following

// Error state selectors
export const selectSearchError = (state) => state.profileList.errors.search
export const selectFollowersError = (state) => state.profileList.errors.followers
export const selectFollowingError = (state) => state.profileList.errors.following

// Legacy selectors for backward compatibility
export const selectOtherProfiles = (state) => state.profileList.otherProfiles
export const selectIsLoadingProfiles = (state) => state.profileList.isLoadingProfiles
export const selectProfilesError = (state) => state.profileList.error

// Combined selectors
export const selectAllProfiles = (state) => {
    const searchProfiles = state.profileList.otherProfiles
    const followersProfiles = state.profileList.followersProfiles
    const followingProfiles = state.profileList.followingProfiles

    // Combine all profiles and remove duplicates
    const allProfiles = [...searchProfiles, ...followersProfiles, ...followingProfiles]
    const uniqueProfiles = new Map()

    allProfiles.forEach(profile => {
        uniqueProfiles.set(profile._id, profile)
    })

    return Array.from(uniqueProfiles.values())
}

export const selectIsAnyLoading = (state) => {
    const { loadingStates } = state.profileList
    return loadingStates.search || loadingStates.followers || loadingStates.following
}

export const selectHasAnyError = (state) => {
    const { errors } = state.profileList
    return errors.search || errors.followers || errors.following
}

// Utility functions for common operations

/**
 * Find a profile by ID across all profile arrays
 */
export const findProfileById = (state, userId) => {
    const allProfiles = selectAllProfiles(state)
    return allProfiles.find(profile => profile._id === userId)
}

/**
 * Check if a user is being followed
 */
export const isUserFollowing = (state, userId) => {
    const profile = findProfileById(state, userId)
    return profile ? profile.isFollowing : false
}

/**
 * Get profile statistics
 */
export const getProfileStats = (state) => {
    return {
        searchCount: state.profileList.otherProfiles.length,
        followersCount: state.profileList.followersProfiles.length,
        followingCount: state.profileList.followingProfiles.length,
        totalUniqueProfiles: selectAllProfiles(state).length
    }
}

/**
 * Check if more data can be loaded for a specific type
 */
export const canLoadMore = (state, type) => {
    switch (type) {
        case 'search':
            return state.profileList.searchPagination.hasMore && !state.profileList.loadingStates.search
        case 'followers':
            return state.profileList.followersPagination.hasMore && !state.profileList.loadingStates.followers
        case 'following':
            return state.profileList.followingPagination.hasMore && !state.profileList.loadingStates.following
        default:
            return false
    }
}

/**
 * Get next page number for a specific type
 */
export const getNextPage = (state, type) => {
    switch (type) {
        case 'search':
            return state.profileList.searchPagination.page + 1
        case 'followers':
            return state.profileList.followersPagination.page + 1
        case 'following':
            return state.profileList.followingPagination.page + 1
        default:
            return 1
    }
}

# ProfileListSlice Optimization - Migration Guide

## Overview
The `profileListSlice` has been optimized to efficiently manage different types of user profiles separately, improving performance and reducing memory usage.

## Key Changes

### 1. State Structure Changes

**Before:**
```javascript
{
  profiles: [],           // Mixed array of all profiles
  otherProfiles: [],     // Search results
  isLoadingProfiles: false,
  error: null
}
```

**After:**
```javascript
{
  // Separated profile arrays
  otherProfiles: [],        // Search results only
  followersProfiles: [],    // User's followers
  followingProfiles: [],    // User's following
  
  // Granular loading states
  loadingStates: {
    search: false,
    followers: false,
    following: false
  },
  
  // Granular error states
  errors: {
    search: null,
    followers: null,
    following: null
  },
  
  // Separate pagination for each type
  searchPagination: { page: 1, hasMore: true },
  followersPagination: { page: 1, hasMore: true },
  followingPagination: { page: 1, hasMore: true },
  
  // Legacy compatibility
  isLoadingProfiles: false,  // Maps to search loading
  error: null                // Maps to search error
}
```

### 2. New Actions

- `clearSearchProfiles()` - Clear search results only
- `clearFollowersProfiles()` - Clear followers only
- `clearFollowingProfiles()` - Clear following only
- `clearAllProfiles()` - Clear all profile arrays
- `clearErrors()` - Clear all error states
- `updateFollowStatus(userId, isFollowing)` - Update follow status across all arrays

### 3. Updated Actions

- `searchUsers` - Now specifically for search results
- `fetchAuthUserFollowers` - Now stores in `followersProfiles`
- `fetchAuthUserFollowings` - Now stores in `followingProfiles`

## Migration Steps

### For Components Using Profile Data

**Before:**
```javascript
const { profiles, isLoadingProfiles, error } = useSelector(state => state.profileList)
```

**After - Option 1 (Use specific arrays):**
```javascript
const { 
  otherProfiles,           // For search results
  followersProfiles,       // For followers
  followingProfiles,       // For following
  loadingStates,
  errors 
} = useSelector(state => state.profileList)
```

**After - Option 2 (Use selectors):**
```javascript
import { 
  selectSearchProfiles,
  selectFollowersProfiles,
  selectIsSearchLoading,
  selectAllProfiles
} from '@/store/selectors/profileListSelectors'

const searchProfiles = useSelector(selectSearchProfiles)
const isLoading = useSelector(selectIsSearchLoading)
const allProfiles = useSelector(selectAllProfiles) // Combines all unique profiles
```

### For Search Functionality

**Before:**
```javascript
dispatch(clearProfiles())
dispatch(clearError())
dispatch(searchUsers({ query, page: 1 }))
```

**After:**
```javascript
dispatch(clearSearchProfiles())
dispatch(clearErrors())
dispatch(searchUsers({ query, page: 1 }))
```

### For Followers/Following

**Before:**
```javascript
// Mixed with search results
const { profiles } = useSelector(state => state.profileList)
```

**After:**
```javascript
const { followersProfiles, followingProfiles } = useSelector(state => state.profileList)

// Or combine them
const socialConnections = [...followersProfiles, ...followingProfiles]
  .filter((profile, index, array) => 
    array.findIndex(p => p._id === profile._id) === index
  ) // Remove duplicates
```

## Backward Compatibility

The following legacy selectors are still available:
- `state.profileList.otherProfiles` (same as before - search results)
- `state.profileList.isLoadingProfiles` (maps to search loading state)
- `state.profileList.error` (maps to search error state)

## Performance Benefits

1. **Reduced Memory Usage**: Separate arrays prevent duplicate user objects
2. **Faster Rendering**: Components only re-render when their specific data changes
3. **Better Pagination**: Each profile type has its own pagination state
4. **Granular Loading**: Show loading states for specific operations
5. **Efficient Updates**: Follow status updates only affect relevant arrays

## Helper Utilities

Use the new selector functions for common operations:

```javascript
import { 
  selectAllProfiles,      // Get all unique profiles
  selectIsAnyLoading,     // Check if any loading
  findProfileById,        // Find profile by ID
  isUserFollowing,        // Check follow status
  canLoadMore,           // Check pagination
  getProfileStats        // Get statistics
} from '@/store/selectors/profileListSelectors'
```

## Examples

### Search Component
```javascript
import { selectSearchProfiles, selectIsSearchLoading } from '@/store/selectors/profileListSelectors'

const SearchComponent = () => {
  const profiles = useSelector(selectSearchProfiles)
  const isLoading = useSelector(selectIsSearchLoading)
  
  const handleSearch = (query) => {
    dispatch(clearSearchProfiles())
    dispatch(searchUsers({ query, page: 1 }))
  }
  
  return (
    <div>
      {isLoading ? <Spinner /> : <ProfileList profiles={profiles} />}
    </div>
  )
}
```

### Social Connections Component
```javascript
import { selectFollowersProfiles, selectFollowingProfiles } from '@/store/selectors/profileListSelectors'

const SocialConnectionsComponent = () => {
  const followers = useSelector(selectFollowersProfiles)
  const following = useSelector(selectFollowingProfiles)
  
  useEffect(() => {
    dispatch(fetchAuthUserFollowers({ page: 1 }))
    dispatch(fetchAuthUserFollowings({ page: 1 }))
  }, [])
  
  return (
    <div>
      <section>
        <h3>Followers ({followers.length})</h3>
        <ProfileList profiles={followers} />
      </section>
      <section>
        <h3>Following ({following.length})</h3>
        <ProfileList profiles={following} />
      </section>
    </div>
  )
}
```

## Testing

After migration, verify:
1. Search functionality works correctly
2. Followers/Following lists load properly
3. Follow/Unfollow actions update the correct arrays
4. Pagination works for each profile type
5. Loading states show appropriately
6. Error handling works for each operation

## Rollback Plan

If issues arise, the legacy structure can be restored by:
1. Reverting to the previous `profileListSlice.js`
2. Updating components to use the old structure
3. Removing the new selector utilities

The current implementation maintains backward compatibility for most use cases.

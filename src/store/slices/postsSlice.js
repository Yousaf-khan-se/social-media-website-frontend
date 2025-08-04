import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchPosts = createAsyncThunk(
    'posts/fetchPosts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 10 } = params
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            })
            const response = await api.get(`/posts/feed?${queryParams}`)
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

export const getMyPosts = createAsyncThunk(
    'posts/getMyPosts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 10 } = params
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            })
            const response = await api.get(`/posts/my-posts?${queryParams}`)
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

export const getExplore = createAsyncThunk(
    'posts/getExplore',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 10 } = params
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            })
            const response = await api.get(`/posts/explore?${queryParams}`)
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

export const searchPosts = createAsyncThunk(
    'posts/searchPosts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { query, page = 1, limit = 10 } = params
            const queryParams = new URLSearchParams({
                query,
                page: page.toString(),
                limit: limit.toString(),
            })
            const response = await api.get(`/posts/search?${queryParams}`)
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

export const getUserPosts = createAsyncThunk(
    'posts/getUserPosts',
    async ({ userId, ...params }, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 10 } = params
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            })
            const response = await api.get(`/posts/user/${userId}?${queryParams}`)
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

export const getPost = createAsyncThunk(
    'posts/getPost',
    async (postId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/posts/${postId}`)
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

export const createPost = createAsyncThunk(
    'posts/createPost',
    async (postData, { rejectWithValue }) => {
        try {
            const response = await api.post('/posts', postData)
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

export const updatePost = createAsyncThunk(
    'posts/updatePost',
    async ({ id, postData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/posts/${id}`, postData)
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

export const deletePost = createAsyncThunk(
    'posts/deletePost',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/posts/${id}`)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return id
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const likePost = createAsyncThunk(
    'posts/likePost',
    async (postId, { rejectWithValue }) => {
        try {
            const response = await api.post(`/posts/${postId}/like`)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { postId, ...data }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const toggleLike = createAsyncThunk(
    'posts/toggleLike',
    async (postId, { rejectWithValue }) => {
        try {
            const response = await api.post(`/posts/${postId}/like`)
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

export const addComment = createAsyncThunk(
    'posts/addComment',
    async ({ postId, comment }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/posts/${postId}/comments`, comment)
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

export const deleteComment = createAsyncThunk(
    'posts/deleteComment',
    async ({ postId, commentId }, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/posts/${postId}/comments/${commentId}`)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { postId, commentId }
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const addCommentReply = createAsyncThunk(
    'posts/addCommentReply',
    async ({ postId, commentId, commentReply }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/posts/${postId}/comments/${commentId}/reply`, commentReply)
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


export const deleteCommentReply = createAsyncThunk(
    'posts/deleteCommentReply',
    async ({ postId, commentId, replyId }, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/posts/${postId}/comments/${commentId}/reply/${replyId}`)
            const data = response.data
            if (!data.success) {
                return rejectWithValue(data)
            }
            return { postId, commentId, replyId };
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message })
        }
    }
)

export const getTrendingTopics = createAsyncThunk(
    'posts/getTrendingTopics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/posts/trending')
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

export const getSuggestedUsers = createAsyncThunk(
    'posts/getSuggestedUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/users/suggested')
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

export const uploadPostMedia = createAsyncThunk(
    'posts/uploadPostMedia',
    async ({ id, media }, { rejectWithValue }) => {
        try {
            console.log('mediaFiles:', media.getAll('media')) // Debugging line to check files being uploaded
            const response = await api.put(`/posts/media/${id}`, media,
                {
                    timeout: 120000, // 2 minutes timeout for media uploads
                }
            )
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
    posts: [],
    currentPost: null,
    isLoading: false,
    error: null,
    hasMore: true,
    page: 1,
    trendingTopics: [],
    suggestedUsers: [],
    isLoadingTrending: false,
    isLoadingSuggested: false,
    limit: 10,
    visibility: 'public', // default visibility
}

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearCurrentPost: (state) => {
            state.currentPost = null
        },
        resetPosts: (state) => {
            state.posts = []
            state.page = 1
            state.hasMore = true
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch posts (feed)
            .addCase(fetchPosts.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.isLoading = false
                if (action.payload.page === 1) {
                    state.posts = action.payload.posts || action.payload.data || []
                } else {
                    state.posts = [...state.posts, ...(action.payload.posts || action.payload.data || [])]
                }
                state.hasMore = action.payload.hasMore
                state.page = action.payload.page
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Get my posts
            .addCase(getMyPosts.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(getMyPosts.fulfilled, (state, action) => {
                state.isLoading = false
                if (action.payload.page === 1) {
                    state.posts = action.payload.posts || action.payload.data || []
                } else {
                    state.posts = [...state.posts, ...(action.payload.posts || action.payload.data || [])]
                }
                state.hasMore = action.payload.hasMore
                state.page = action.payload.page
            })
            .addCase(getMyPosts.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Get explore posts
            .addCase(getExplore.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(getExplore.fulfilled, (state, action) => {
                state.isLoading = false
                if (action.payload.page === 1) {
                    state.posts = action.payload.posts || action.payload.data || []
                } else {
                    state.posts = [...state.posts, ...(action.payload.posts || action.payload.data || [])]
                }
                state.hasMore = action.payload.hasMore
                state.page = action.payload.page

            })
            .addCase(getExplore.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Search posts
            .addCase(searchPosts.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(searchPosts.fulfilled, (state, action) => {
                state.isLoading = false
                if (action.payload.pagination.page === 1) {
                    state.posts = action.payload.posts || []
                } else {
                    state.posts = [...state.posts, ...(action.payload.posts || [])]
                }
                state.page = action.payload.pagination.page
                // Optionally calculate hasMore:
                const total = action.payload.pagination.total || 0
                state.limit = action.payload.pagination.limit || 10
                state.hasMore = state.posts.length < total
            })
            .addCase(searchPosts.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Get user posts
            .addCase(getUserPosts.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(getUserPosts.fulfilled, (state, action) => {
                state.isLoading = false
                if (action.payload.page === 1) {
                    state.posts = action.payload.posts || action.payload.data || []
                } else {
                    state.posts = [...state.posts, ...(action.payload.posts || action.payload.data || [])]
                }
                state.hasMore = action.payload.hasMore
                state.page = action.payload.page
            })
            .addCase(getUserPosts.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Get single post
            .addCase(getPost.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(getPost.fulfilled, (state, action) => {
                state.isLoading = false
                state.currentPost = action.payload.post || action.payload.data
            })
            .addCase(getPost.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Create post
            .addCase(createPost.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(createPost.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
                // const newPost = action.payload.post || action.payload.data
                // state.posts.unshift(newPost)
            })
            .addCase(createPost.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // upload post media
            .addCase(uploadPostMedia.fulfilled, (state, action) => {
                const updatedPost = action.payload.post || action.payload.data
                const index = state.posts.findIndex(post => post._id === updatedPost._id || post.id === updatedPost.id)
                if (index !== -1) {
                    state.posts[index] = updatedPost
                }
                if (state.currentPost && (state.currentPost._id === updatedPost._id || state.currentPost.id === updatedPost.id)) {
                    state.currentPost = updatedPost
                }
                state.error = null;
            })
            // Update post
            .addCase(updatePost.fulfilled, (state, action) => {
                const updatedPost = action.payload.post || action.payload.data
                const index = state.posts.findIndex(post => post._id === updatedPost._id || post.id === updatedPost.id)
                if (index !== -1) {
                    state.posts[index] = updatedPost
                }
                if (state.currentPost && (state.currentPost._id === updatedPost._id || state.currentPost.id === updatedPost.id)) {
                    state.currentPost = updatedPost
                }
                state.error = null;
            })
            // Delete post
            .addCase(deletePost.fulfilled, (state, action) => {
                const postId = action.payload
                state.posts = state.posts.filter(post => post._id !== postId && post.id !== postId)
                if (state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId)) {
                    state.currentPost = null
                }
                state.error = null;
            })
            // Toggle like (replaces like/unlike)
            .addCase(toggleLike.fulfilled, (state, action) => {
                const updatedPost = action.payload.post || action.payload.data
                const index = state.posts.findIndex(post => post._id === updatedPost._id || post.id === updatedPost.id)
                if (index !== -1) {
                    state.posts[index] = updatedPost
                }
                if (state.currentPost && (state.currentPost._id === updatedPost._id || state.currentPost.id === updatedPost.id)) {
                    state.currentPost = updatedPost
                }
                state.error = null;
            })
            // Add comment
            .addCase(addComment.fulfilled, (state, action) => {
                const updatedPost = action.payload.post || action.payload.data
                const index = state.posts.findIndex(post => post._id === updatedPost._id || post.id === updatedPost.id)
                if (index !== -1) {
                    state.posts[index] = updatedPost
                }
                if (state.currentPost && (state.currentPost._id === updatedPost._id || state.currentPost.id === updatedPost.id)) {
                    state.currentPost = updatedPost
                }
                state.error = null;
            })
            // Add comment reply
            .addCase(addCommentReply.fulfilled, (state, action) => {
                const updatedPost = action.payload.post || action.payload.data
                const index = state.posts.findIndex(post => post._id === updatedPost._id || post.id === updatedPost.id)
                if (index !== -1) {
                    state.posts[index] = updatedPost
                }
                if (state.currentPost && (state.currentPost._id === updatedPost._id || state.currentPost.id === updatedPost.id)) {
                    state.currentPost = updatedPost
                }
                state.error = null;
            })
            // delete comment reply
            .addCase(deleteCommentReply.fulfilled, (state, action) => {
                const { postId, commentId, replyId } = action.payload
                const post = state.posts.find(p => p._id === postId || p.id === postId)
                if (post && post.comments) {
                    const comment = post.comments.find(c => c._id === commentId || c.id === commentId)
                    if (comment && comment.replies) {
                        comment.replies = comment.replies.filter(reply => reply._id !== replyId && reply.id !== replyId)
                        post.commentsCount = Math.max((post.commentsCount || 0) - 1, 0)
                    }
                }
                if (state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId)) {
                    const comment = state.currentPost.comments.find(c => c._id === commentId || c.id === commentId)
                    if (comment && comment.replies) {
                        comment.replies = comment.replies.filter(reply => reply._id !== replyId && reply.id !== replyId)
                        state.currentPost.commentsCount = Math.max((state.currentPost.commentsCount || 0) - 1, 0)
                    }
                }
                state.error = null;
            })


            // Delete comment
            .addCase(deleteComment.fulfilled, (state, action) => {
                const { postId, commentId } = action.payload
                const post = state.posts.find(p => p._id === postId || p.id === postId)
                if (post && post.comments) {
                    post.comments = post.comments.filter(comment => comment._id !== commentId && comment.id !== commentId)
                    post.commentsCount = Math.max((post.commentsCount || 0) - 1, 0)
                }
                if (state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId) && state.currentPost.comments) {
                    state.currentPost.comments = state.currentPost.comments.filter(comment => comment._id !== commentId && comment.id !== commentId)
                    state.currentPost.commentsCount = Math.max((state.currentPost.commentsCount || 0) - 1, 0)
                }
                state.error = null;
            })
            // Get trending topics
            .addCase(getTrendingTopics.pending, (state) => {
                state.isLoadingTrending = true
                state.error = null;
            })
            .addCase(getTrendingTopics.fulfilled, (state, action) => {
                state.isLoadingTrending = false
                state.trendingTopics = action.payload.topics || action.payload.data || []
                state.error = null;
            })
            .addCase(getTrendingTopics.rejected, (state, action) => {
                state.isLoadingTrending = false
                state.error = action.payload
            })
            // Get suggested users
            .addCase(getSuggestedUsers.pending, (state) => {
                state.isLoadingSuggested = true
                state.error = null;
            })
            .addCase(getSuggestedUsers.fulfilled, (state, action) => {
                state.isLoadingSuggested = false
                state.suggestedUsers = action.payload.users || action.payload.data || []
                state.error = null;
            })
            .addCase(getSuggestedUsers.rejected, (state, action) => {
                state.isLoadingSuggested = false
                state.error = action.payload
            })
    },
})

export const { clearError, clearCurrentPost, resetPosts } = postsSlice.actions
export default postsSlice.reducer

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',
        REFRESH: '/auth/refresh',
    },
    USERS: {
        PROFILE: '/users/profile',
        FOLLOW: (userId) => `/users/${userId}/follow`,
        FOLLOWERS: (userId) => `/users/${userId}/followers`,
        FOLLOWING: (userId) => `/users/${userId}/following`,
    },
    POSTS: {
        LIST: '/posts',
        CREATE: '/posts',
        UPDATE: (postId) => `/posts/${postId}`,
        DELETE: (postId) => `/posts/${postId}`,
        LIKE: (postId) => `/posts/${postId}/like`,
        COMMENTS: (postId) => `/posts/${postId}/comments`,
    },
    NOTIFICATIONS: {
        LIST: '/notifications',
        READ: (notificationId) => `/notifications/${notificationId}/read`,
        READ_ALL: '/notifications/read-all',
    },
}

export const STORAGE_KEYS = {
    USER: 'user',
    THEME: 'theme',
}

export const POST_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    LINK: 'link',
}

export const NOTIFICATION_TYPES = {
    LIKE: 'like',
    COMMENT: 'comment',
    FOLLOW: 'follow',
    MENTION: 'mention',
}

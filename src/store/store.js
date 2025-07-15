import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import postsReducer from './slices/postsSlice'
import profileReducer from './slices/profileSlice'
import notificationsReducer from './slices/notificationsSlice'
import profileListSlice from './slices/profileListSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postsReducer,
        profile: profileReducer,
        notifications: notificationsReducer,
        profileList: profileListSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
})

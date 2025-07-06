import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bell, Heart, MessageCircle, UserPlus, Settings } from 'lucide-react'
import { fetchNotifications, markAsRead, markAllAsRead } from '@/store/slices/notificationsSlice'

export const NotificationsPage = () => {
    const dispatch = useDispatch()
    const { notifications, isLoading, error, unreadCount } = useSelector(state => state.notifications || {})

    // Load notifications on mount
    useEffect(() => {
        dispatch(fetchNotifications({ page: 1, limit: 20 }))
    }, [dispatch])

    const handleMarkAsRead = (notificationId) => {
        dispatch(markAsRead(notificationId))
    }

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead())
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like':
                return <Heart className="h-4 w-4 text-red-500" />
            case 'comment':
                return <MessageCircle className="h-4 w-4 text-blue-500" />
            case 'follow':
                return <UserPlus className="h-4 w-4 text-green-500" />
            default:
                return <Bell className="h-4 w-4" />
        }
    }

    return (
        <div className="flex-1 border-r border-border">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
                <div className="flex items-center justify-between px-4 py-3">
                    <h1 className="text-xl font-semibold">Notifications</h1>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </div>
            </div>

            <ScrollArea className="h-[calc(100vh-60px)]">
                {error && (
                    <div className="p-8 text-center text-destructive">
                        {Array.isArray(error?.details?.errors)
                            ? error.details.errors.map((err, idx) => (
                                <div key={idx}>{err}</div>
                            ))
                            : error?.error || error?.message || (typeof error === 'string' ? error : 'Failed to load notifications')}
                    </div>
                )}
                <div className="divide-y divide-border">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">
                            Loading notifications...
                        </div>
                    ) : notifications && notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                            <p>No notifications yet</p>
                        </div>
                    ) : notifications ? (
                        notifications.map((notification) => (
                            <div
                                key={notification._id || notification.id}
                                className={`p-4 hover:bg-accent cursor-pointer ${!notification.read ? 'bg-accent/50' : ''}`}
                                onClick={() => !notification.read && handleMarkAsRead(notification._id || notification.id)}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={notification.user?.profilePicture} alt={`${notification.user?.firstName} ${notification.user?.lastName}`} />
                                        <AvatarFallback>{notification.user?.firstName?.charAt(0)}{notification.user?.lastName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm">
                                            <span className="font-medium">{notification.user?.firstName} {notification.user?.lastName}</span>
                                            <span className="text-muted-foreground"> {notification.message || notification.content}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : null}
                </div>
            </ScrollArea>
        </div>
    )
}

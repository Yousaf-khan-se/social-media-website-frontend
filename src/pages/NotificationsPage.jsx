import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Bell,
    Heart,
    MessageCircle,
    UserPlus,
    Filter,
    MoreVertical,
    Trash2,
    Check,
    Share,
    Users,
    Shield
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
} from '@/store/slices/notificationsSlice'

export const NotificationsPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { notifications, isLoading, error, unreadCount, hasMore, page } = useSelector(state => state.notifications || {})
    const [filterType, setFilterType] = useState('all')

    const handleMarkAsRead = (notificationId) => {
        dispatch(markAsRead(notificationId))
    }

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead())
    }

    const handleNotificationClick = (notification) => {
        // Mark as read when clicked
        if (!notification.read && !notification.isRead) {
            handleMarkAsRead(notification._id || notification.id)
        }

        // Navigate based on notification type
        const { type, postId, chatRoomId, senderId } = notification.data || notification

        switch (type) {
            case 'message':
            case 'chat_created':
            case 'group_created':
            case 'group_added':
                navigate(chatRoomId ? `/messages?chat=${chatRoomId}` : '/messages')
                break
            case 'chat_permission_request':
                // Navigate to messages page with permission requests view
                navigate('/messages?view=requests')
                break
            case 'like':
            case 'comment':
            case 'share':
                navigate(postId ? `/post/${postId}` : '/notifications')
                break
            case 'follow':
                navigate(senderId ? `/user/${senderId}` : '/notifications')
                break
            default:
                // For other types, stay on notifications page
                break
        }
    }

    const handleDeleteNotification = (notificationId) => {
        dispatch(deleteNotification(notificationId))
    }

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
            dispatch(clearAllNotifications())
        }
    }

    const handleLoadMore = () => {
        if (hasMore && !isLoading) {
            dispatch(fetchNotifications({ page: page + 1, limit: 20 }))
        }
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like':
                return <Heart className="h-4 w-4 text-red-500" />
            case 'comment':
                return <MessageCircle className="h-4 w-4 text-blue-500" />
            case 'message':
                return <MessageCircle className="h-4 w-4 text-blue-500" />
            case 'follow':
                return <UserPlus className="h-4 w-4 text-green-500" />
            case 'share':
                return <Share className="h-4 w-4 text-purple-500" />
            case 'chat_created':
            case 'group_created':
            case 'group_added':
                return <Users className="h-4 w-4 text-cyan-500" />
            case 'chat_permission_request':
                return <Shield className="h-4 w-4 text-orange-500" />
            default:
                return <Bell className="h-4 w-4" />
        }
    }

    const getNotificationTime = (createdAt) => {
        const now = new Date()
        const notificationTime = new Date(createdAt)
        const diffInMs = now - notificationTime
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
        const diffInHours = Math.floor(diffInMinutes / 60)
        const diffInDays = Math.floor(diffInHours / 24)

        if (diffInMinutes < 1) return 'Just now'
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`
        if (diffInHours < 24) return `${diffInHours}h ago`
        if (diffInDays < 7) return `${diffInDays}d ago`
        return notificationTime.toLocaleDateString()
    }

    const filteredNotifications = notifications?.filter(notification => {
        if (filterType === 'all') return true
        if (filterType === 'unread') return !notification.read && !notification.isRead
        if (filterType === 'message') {
            return ['message', 'chat_created', 'group_created', 'group_added', 'chat_permission_request'].includes(notification.type)
        }
        return notification.type === filterType
    }) || []

    const filterOptions = [
        { value: 'all', label: 'All', count: notifications?.length || 0 },
        { value: 'unread', label: 'Unread', count: unreadCount },
        { value: 'like', label: 'Likes', count: notifications?.filter(n => n.type === 'like').length || 0 },
        { value: 'comment', label: 'Comments', count: notifications?.filter(n => n.type === 'comment').length || 0 },
        { value: 'follow', label: 'Follows', count: notifications?.filter(n => n.type === 'follow').length || 0 },
        { value: 'message', label: 'Messages', count: notifications?.filter(n => n.type === 'message' || n.type === 'chat_created' || n.type === 'group_created' || n.type === 'group_added' || n.type === 'chat_permission_request').length || 0 },
        { value: 'share', label: 'Shares', count: notifications?.filter(n => n.type === 'share').length || 0 },
    ]

    return (
        <div className="flex-1 border-r border-border">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
                <div className="flex items-center justify-between px-4 py-3">
                    <h1 className="text-xl font-semibold">Notifications</h1>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                                <Check className="h-4 w-4 mr-2" />
                                Mark all as read
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleClearAll} className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear all
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 px-4 py-2 border-b border-border/50">
                    {filterOptions.map((option) => (
                        <Button
                            key={option.value}
                            variant={filterType === option.value ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setFilterType(option.value)}
                            className="flex items-center gap-2"
                        >
                            {option.label}
                            {option.count > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {option.count}
                                </Badge>
                            )}
                        </Button>
                    ))}
                </div>
            </div>

            <ScrollArea className="h-[calc(100vh-120px)]">
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
                    {isLoading && filteredNotifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            Loading notifications...
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                            <p>
                                {filterType === 'all'
                                    ? 'No notifications yet'
                                    : `No ${filterType} notifications`
                                }
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification._id || notification.id}
                                className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer ${!notification.read && !notification.isRead ? 'bg-accent/30' : ''
                                    }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={notification.sender?.profilePicture || notification.user?.profilePicture}
                                            alt={`${notification.sender?.firstName || notification.user?.firstName} ${notification.sender?.lastName || notification.user?.lastName}`}
                                        />
                                        <AvatarFallback>
                                            {(notification.sender?.firstName || notification.user?.firstName)?.charAt(0)}
                                            {(notification.sender?.lastName || notification.user?.lastName)?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm">
                                            <span className="font-medium">
                                                {notification.sender?.firstName || notification.user?.firstName} {notification.sender?.lastName || notification.user?.lastName}
                                            </span>
                                            <span className="text-muted-foreground"> {notification.message || notification.body || notification.content}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {getNotificationTime(notification.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!notification.read && !notification.isRead && (
                                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {!notification.read && !notification.isRead && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleMarkAsRead(notification._id || notification.id)}
                                                    >
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Mark as read
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteNotification(notification._id || notification.id)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Load more button */}
                {hasMore && filteredNotifications.length > 0 && (
                    <div className="p-4 text-center">
                        <Button
                            variant="outline"
                            onClick={handleLoadMore}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : 'Load more'}
                        </Button>
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}

import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import {
    Home,
    Search,
    Bell,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    Hash,
    MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Explore', href: '/explore', icon: Search },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export const Sidebar = () => {
    const location = useLocation()
    const dispatch = useDispatch()
    const [collapsed, setCollapsed] = useState(false)
    const { user } = useSelector(state => state.auth)
    const { unreadCount } = useSelector(state => state.notifications)

    const handleLogout = () => {
        dispatch(logout())
    }

    // Responsive: hide sidebar on mobile, show mobile nav
    return (
        <>
            {/* Desktop Sidebar */}
            <div className={cn(
                "hidden md:flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out",
                collapsed ? "w-16" : "w-64"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    {!collapsed && (
                        <div className="flex items-center space-x-2">
                            <Hash className="h-8 w-8 text-primary" />
                            <span className="text-xl font-bold">SocialApp</span>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCollapsed(!collapsed)}
                        className="h-8 w-8"
                    >
                        {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 px-3 py-4">
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href
                            const Icon = item.icon
                            const showBadge = item.name === 'Notifications' && unreadCount > 0

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <div className="relative">
                                        <Icon className="h-5 w-5" />
                                        {showBadge && (
                                            <span className="absolute -top-2 -right-2 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    {!collapsed && <span>{item.name}</span>}
                                </Link>
                            )
                        })}
                    </nav>
                </ScrollArea>

                {/* User Profile */}
                <div className="p-4 border-t border-border">
                    {user && (
                        <div className={cn(
                            "flex items-center gap-3",
                            collapsed ? "justify-center" : "justify-between"
                        )}>
                            <Link
                                to="/profile"
                                className={cn(
                                    "flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors",
                                    collapsed ? "justify-center" : "flex-1"
                                )}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {!collapsed && (
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                                    </div>
                                )}
                            </Link>
                            {!collapsed && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleLogout}
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-card border-t border-border shadow-lg justify-around py-2">
                {navigation.slice(0, 5).map((item) => {
                    const isActive = location.pathname === item.href
                    const Icon = item.icon
                    const showBadge = item.name === 'Notifications' && unreadCount > 0
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 px-2 text-xs font-medium transition-colors relative",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            <span className="relative">
                                <Icon className="h-6 w-6" />
                                {showBadge && (
                                    <span className="absolute -top-1 right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </span>
                            <span className="hidden xs:block">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </>
    )
}

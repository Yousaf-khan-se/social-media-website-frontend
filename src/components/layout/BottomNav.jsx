import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
    Home,
    Search,
    Bell,
    MessageCircle,
    User,
    Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Explore', href: '/explore', icon: Search },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export const BottomNav = () => {
    const location = useLocation()
    const { unreadCount } = useSelector(state => state.notifications)

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-card border-t border-border shadow-lg justify-around py-2">
            {navigation.map((item) => {
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
    )
}

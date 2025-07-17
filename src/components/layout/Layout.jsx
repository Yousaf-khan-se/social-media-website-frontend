import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { cn } from '@/lib/utils'

export const Layout = ({ className }) => {
    return (
        <div className={cn("flex min-h-screen bg-background flex-col md:flex-row", className)}>
            {/* Sidebar: hidden on mobile, visible on md+ */}
            <div className="hidden md:block">
                <Sidebar />
            </div>
            {/* Main content: full width on mobile, flex-1 on desktop */}
            <main className="flex-1 w-full max-w-full md:overflow-hidden md:w-auto">
                <div className="h-full min-h-screen md:min-h-0 px-2 sm:px-4 md:px-8">
                    <Outlet />
                </div>
            </main>
            <BottomNav />
        </div>
    )
}

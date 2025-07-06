import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

export const Layout = ({ className }) => {
    return (
        <div className={cn("flex min-h-screen bg-background", className)}>
            <Sidebar />
            <main className="flex-1 overflow-hidden">
                <div className="h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

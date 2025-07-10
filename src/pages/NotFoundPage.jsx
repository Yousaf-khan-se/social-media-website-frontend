import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="mb-6 text-muted-foreground">Sorry, the page you are looking for does not exist.</p>
            <Link to="/" className="text-primary underline hover:no-underline">Go back home</Link>
        </div>
    )
}

export { NotFoundPage }

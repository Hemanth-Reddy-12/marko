import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 p-4">
            <h1 className="text-6xl font-bold text-zinc-900 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-zinc-700 mb-8">Page Not Found</h2>
            <p className="text-zinc-500 mb-8 text-center max-w-md">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Button onClick={() => navigate('/')}>
                Return to Dashboard
            </Button>
        </div>
    );
}

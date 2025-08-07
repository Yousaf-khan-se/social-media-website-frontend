import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ServiceWorkerNavigationHandler = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Listen for navigation messages from service worker
        const handleMessage = (event) => {
            if (event.data && event.data.type === 'NAVIGATE') {
                navigate(event.data.url);
            }
        };

        navigator.serviceWorker?.addEventListener('message', handleMessage);

        return () => {
            navigator.serviceWorker?.removeEventListener('message', handleMessage);
        };
    }, [navigate]);

    return null; // This component doesn't render anything
};

export default ServiceWorkerNavigationHandler;

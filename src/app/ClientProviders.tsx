'use client';

// app/ClientProviders.tsx - Client-side providers wrapper

import { ToastProvider } from '../hooks/useToast';
import ToastNotification from '../components/ToastNotification';
import WelcomeModal from '../components/WelcomeModal';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <ToastProvider>
            {children}
            <ToastNotification />
            <WelcomeModal />
        </ToastProvider>
    );
}

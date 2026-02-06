import type { Metadata } from 'next';
import './globals.css';
import ClientProviders from './ClientProviders';

export const metadata: Metadata = {
    title: 'PALANTIR GOTHAM — Operation Nightfall',
    description: 'Intelligence simulation dashboard with time-based procedural data generation',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className="bg-bg-primary text-white antialiased">
                <ClientProviders>
                    {children}
                </ClientProviders>
            </body>
        </html>
    );
}


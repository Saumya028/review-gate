import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: 'ReviewGate — AI-Powered Review Collection Platform',
    description: 'Collect customer feedback intelligently and generate authentic Google reviews with AI. Help businesses grow their online reputation.',
    keywords: ['review', 'feedback', 'AI', 'Google reviews', 'customer experience', 'SaaS'],
    authors: [{ name: 'ReviewGate' }],
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#6366f1',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body className={`${inter.className} bg-slate-50 antialiased`}>
                {children}
            </body>
        </html>
    );
}
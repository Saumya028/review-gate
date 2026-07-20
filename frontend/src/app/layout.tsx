import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import './globals.css';

// Premium serif display font — editorial, law-firm quality
const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-display',
    weight: ['300', '400', '500', '600', '700'],
    style: ['normal', 'italic'],
});

// Clean, highly legible sans-serif for body/UI text
const montserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-body',
    weight: ['300', '400', '500', '600', '700'],
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
    themeColor: '#0f172a',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`}>
            <body className={`${montserrat.className} bg-[#f5f3ef] antialiased`}>
                {children}
            </body>
        </html>
    );
}
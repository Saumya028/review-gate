'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);

        return () => clearTimeout(timer);
    }, [onClose]);

    // Gold for success (on-brand), red-800 for error (severity signal)
    const bgColor = type === 'success'
        ? 'bg-[#b8943a]'
        : 'bg-red-800';

    const icon = type === 'success' ? (
        <svg className="w-4 h-4 text-[#fefcf8] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ) : (
        <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    return (
        <AnimatePresence>
            <motion.div
                className={`fixed bottom-6 right-6 z-50 ${bgColor} text-[#fefcf8] px-5 py-4 shadow-xl flex items-center gap-3 max-w-sm rounded-sm`}
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                {icon}
                <p
                    className="text-xs font-semibold tracking-wider uppercase leading-snug"
                    style={{ fontFamily: 'var(--font-body, sans-serif)' }}
                >
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className="ml-2 text-[#fefcf8]/70 hover:text-[#fefcf8] transition-colors flex-shrink-0"
                    aria-label="Close notification"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </motion.div>
        </AnimatePresence>
    );
}

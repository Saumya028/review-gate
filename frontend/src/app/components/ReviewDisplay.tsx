'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface ReviewDisplayProps {
    review: string;
    googlePlaceId: string;
    onSuccess: () => void;
}

export default function ReviewDisplay({ review, googlePlaceId, onSuccess }: ReviewDisplayProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(review);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = review;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handleCopyAndOpen = async () => {
        await handleCopy();
        const googleUrl = `https://search.google.com/local/writereview?placeid=${googlePlaceId}`;
        window.open(googleUrl, '_blank', 'noopener,noreferrer');
        onSuccess();
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.15 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
        >
            {/* Review card */}
            <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 rounded-2xl p-6 border border-indigo-100/60"
            >
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        ))}
                    </div>
                    <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">
                        AI Generated
                    </span>
                </div>

                <p className="text-gray-800 text-base leading-relaxed italic">
                    &ldquo;{review}&rdquo;
                </p>
            </motion.div>

            {/* Action buttons */}
            <motion.div variants={itemVariants} className="space-y-3">
                {/* Copy & Open Google - Primary */}
                <button
                    onClick={handleCopyAndOpen}
                    className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2.5"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Copy Review & Open Google
                </button>

                {/* Copy only - Secondary */}
                <button
                    onClick={handleCopy}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2.5"
                >
                    {copied ? (
                        <>
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-emerald-600">Copied!</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Review
                        </>
                    )}
                </button>
            </motion.div>

            {/* Helper message */}
            <motion.div
                variants={itemVariants}
                className="bg-amber-50/80 border border-amber-200/60 rounded-xl px-4 py-3 flex items-start gap-2.5"
            >
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-amber-800 leading-snug">
                    Your review has been copied. Simply <strong>paste</strong> it into Google when the review page opens.
                </p>
            </motion.div>
        </motion.div>
    );
}

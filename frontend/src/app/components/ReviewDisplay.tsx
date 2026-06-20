'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

interface ReviewDisplayProps {
    reviews: string[];
    googlePlaceId: string;
    onSuccess: () => void;
}

const VARIATION_LABELS = [
    { label: 'Short', emoji: '⚡', description: 'Quick & punchy' },
    { label: 'Detailed', emoji: '📝', description: 'Thorough review' },
    { label: 'Casual', emoji: '😊', description: 'Friendly tone' },
    { label: 'Pro', emoji: '💼', description: 'Professional' },
    { label: 'Excited', emoji: '🔥', description: 'Enthusiastic' },
];

export default function ReviewDisplay({ reviews, googlePlaceId, onSuccess }: ReviewDisplayProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [copied, setCopied] = useState(false);
    const [direction, setDirection] = useState(0);

    const currentReview = reviews[activeIndex] || reviews[0];
    const tabs = reviews.map((_, i) => VARIATION_LABELS[i] || { label: `Option ${i + 1}`, emoji: '✨', description: '' });

    const handleTabChange = useCallback((index: number) => {
        setDirection(index > activeIndex ? 1 : -1);
        setActiveIndex(index);
        setCopied(false);
    }, [activeIndex]);

    const handleSwipe = useCallback((offsetX: number) => {
        if (offsetX < -50 && activeIndex < reviews.length - 1) {
            setDirection(1);
            setActiveIndex((prev) => prev + 1);
            setCopied(false);
        } else if (offsetX > 50 && activeIndex > 0) {
            setDirection(-1);
            setActiveIndex((prev) => prev - 1);
            setCopied(false);
        }
    }, [activeIndex, reviews.length]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(currentReview);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = currentReview;
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

    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 80 : -80,
            opacity: 0,
            scale: 0.95,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (dir: number) => ({
            x: dir > 0 ? -80 : 80,
            opacity: 0,
            scale: 0.95,
        }),
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
        >
            {/* Tab Bar */}
            <motion.div variants={itemVariants} className="relative">
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                    {tabs.map((tab, index) => {
                        const isActive = index === activeIndex;
                        return (
                            <motion.button
                                key={index}
                                onClick={() => handleTabChange(index)}
                                className={`relative flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] ${
                                    isActive
                                        ? 'text-indigo-700'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-indigo-50 border border-indigo-200/60 rounded-xl"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 text-base">{tab.emoji}</span>
                                <span className="relative z-10">{tab.label}</span>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Progress dots for mobile */}
                <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
                    {reviews.map((_, i) => (
                        <motion.div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === activeIndex ? 'w-5 bg-indigo-500' : 'w-1.5 bg-gray-200'
                            }`}
                            animate={{
                                width: i === activeIndex ? 20 : 6,
                                backgroundColor: i === activeIndex ? '#6366f1' : '#e5e7eb',
                            }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Swipeable Review Card */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/80 to-blue-50/80 border border-indigo-100/60 min-h-[140px]"
            >
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={activeIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.15}
                        onDragEnd={(_, info) => handleSwipe(info.offset.x)}
                        className="p-5 sm:p-6 cursor-grab active:cursor-grabbing"
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
                                {tabs[activeIndex]?.description || 'AI Generated'}
                            </span>
                        </div>

                        <p className="text-gray-800 text-base leading-relaxed italic select-text">
                            &ldquo;{currentReview}&rdquo;
                        </p>

                        {/* Swipe hint for mobile */}
                        {reviews.length > 1 && (
                            <p className="text-xs text-indigo-300 mt-4 text-center sm:hidden flex items-center justify-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                Swipe to see more options
                            </p>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Action buttons */}
            <motion.div variants={itemVariants} className="space-y-3">
                {/* Copy & Open Google - Primary */}
                <button
                    onClick={handleCopyAndOpen}
                    className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 min-h-[48px]"
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
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2.5 min-h-[48px]"
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

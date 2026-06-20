'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import ReviewDisplay from './ReviewDisplay';

interface Business {
    id: number;
    business_id: string;
    name: string;
    type: string;
    logo: string;
    google_place_id: string;
}

interface PositiveReviewFlowProps {
    business: Business;
    onSuccess: () => void;
    onGenerateReview: (keywords: string[]) => Promise<string[]>;
}

const TAGS = [
    { label: 'Friendly Staff', emoji: '😊' },
    { label: 'Great Service', emoji: '⭐' },
    { label: 'Fast Delivery', emoji: '🚀' },
    { label: 'Clean Environment', emoji: '✨' },
    { label: 'Good Value', emoji: '💰' },
    { label: 'Quality Product', emoji: '🏆' },
    { label: 'Professional Team', emoji: '👔' },
    { label: 'Great Experience', emoji: '🎉' },
];

export default function PositiveReviewFlow({ business, onSuccess, onGenerateReview }: PositiveReviewFlowProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [customText, setCustomText] = useState('');
    const [generatedReviews, setGeneratedReviews] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [phase, setPhase] = useState<'tags' | 'review'>('tags');

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag)
                ? prev.filter((t) => t !== tag)
                : [...prev, tag]
        );
        if (error) setError('');
    };

    const handleGenerate = async () => {
        if (selectedTags.length === 0) {
            setError('Please select at least one thing you loved.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const reviews = await onGenerateReview(selectedTags);
            setGeneratedReviews(reviews);
            setPhase('review');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate review. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06, delayChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header accent */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

            <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                    {phase === 'tags' && (
                        <motion.div
                            key="tags"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                        >
                            {/* Celebration emoji */}
                            <motion.div variants={itemVariants} className="text-center mb-2">
                                <span className="text-4xl">🎉</span>
                            </motion.div>

                            <motion.h2
                                variants={itemVariants}
                                className="text-xl font-bold text-gray-900 text-center mb-2"
                            >
                                Glad you had a great time!
                            </motion.h2>

                            <motion.p
                                variants={itemVariants}
                                className="text-gray-500 text-center text-sm mb-6"
                            >
                                What did you love most?
                            </motion.p>

                            {/* Tags grid */}
                            <motion.div
                                variants={itemVariants}
                                className="flex flex-wrap gap-2.5 justify-center mb-6"
                            >
                                {TAGS.map((tag, index) => {
                                    const isSelected = selectedTags.includes(tag.label);
                                    return (
                                        <motion.button
                                            key={tag.label}
                                            onClick={() => toggleTag(tag.label)}
                                            className={`px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 border-2 flex items-center gap-1.5 min-h-[48px] ${
                                                isSelected
                                                    ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm'
                                                    : 'bg-gray-50/80 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100/80'
                                            }`}
                                            whileTap={{ scale: 0.93 }}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                transition: { delay: 0.2 + index * 0.04 },
                                            }}
                                        >
                                            <span className="text-base">{tag.emoji}</span>
                                            {tag.label}
                                            {isSelected && (
                                                <motion.svg
                                                    className="w-4 h-4 text-indigo-500"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </motion.svg>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </motion.div>

                            {/* Custom text field */}
                            <motion.div variants={itemVariants} className="mb-6">
                                <label htmlFor="custom-text" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Anything else you&apos;d like to mention?
                                </label>
                                <textarea
                                    id="custom-text"
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    placeholder="Optional — share any extra thoughts..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 text-gray-800 text-sm resize-none transition-all duration-200 focus:border-indigo-400 placeholder:text-gray-400 min-h-[48px]"
                                />
                            </motion.div>

                            {/* Error message */}
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-sm text-center mb-4 flex items-center justify-center gap-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                                    </svg>
                                    {error}
                                </motion.p>
                            )}

                            {/* Generate button */}
                            <motion.div variants={itemVariants}>
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 min-h-[48px]"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Generating your reviews...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Generate Reviews
                                        </>
                                    )}
                                </button>
                            </motion.div>

                            {/* Tag count hint */}
                            {selectedTags.length > 0 && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xs text-gray-400 text-center mt-4"
                                >
                                    {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
                                </motion.p>
                            )}
                        </motion.div>
                    )}

                    {phase === 'review' && generatedReviews && (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <div className="text-center mb-2">
                                <span className="text-4xl">✍️</span>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                                Your Reviews are Ready!
                            </h2>

                            <p className="text-gray-500 text-center text-sm mb-6">
                                Choose your favorite style below. Swipe or tap to browse {generatedReviews.length} options.
                            </p>

                            <ReviewDisplay
                                reviews={generatedReviews}
                                googlePlaceId={business.google_place_id}
                                onSuccess={onSuccess}
                            />

                            {/* Back button */}
                            <button
                                onClick={() => setPhase('tags')}
                                className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm font-medium py-2 transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to tags
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

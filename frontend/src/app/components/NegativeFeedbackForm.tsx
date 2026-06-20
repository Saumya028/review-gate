'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface NegativeFeedbackFormProps {
    onSubmit: (feedback: string, email?: string, phone?: string) => void;
    loading: boolean;
    businessName: string;
}

export default function NegativeFeedbackForm({ onSubmit, loading, businessName }: NegativeFeedbackFormProps) {
    const [feedback, setFeedback] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim()) {
            setError('Please share your feedback so we can improve.');
            return;
        }
        setError('');
        onSubmit(feedback, email || undefined, phone || undefined);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: 'easeOut' as const },
        },
    };

    return (
        <motion.div
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header accent */}
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />

            <div className="p-8">
                {/* Sad emoji */}
                <motion.div variants={itemVariants} className="text-center mb-2">
                    <span className="text-4xl">😔</span>
                </motion.div>

                <motion.h2
                    variants={itemVariants}
                    className="text-xl font-bold text-gray-900 text-center mb-2"
                >
                    We&apos;re sorry we didn&apos;t meet your expectations.
                </motion.h2>

                <motion.p
                    variants={itemVariants}
                    className="text-gray-500 text-center text-sm mb-8"
                >
                    Your feedback helps us improve {businessName}.
                </motion.p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Feedback textarea */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="feedback-text" className="block text-sm font-semibold text-gray-700 mb-2">
                            What went wrong? <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            id="feedback-text"
                            value={feedback}
                            onChange={(e) => {
                                setFeedback(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Tell us about your experience..."
                            rows={4}
                            className={`w-full px-4 py-3 rounded-xl border-2 ${
                                error ? 'border-red-300 focus:border-red-400' : 'border-gray-100 focus:border-indigo-400'
                            } bg-gray-50/50 text-gray-800 text-sm resize-none transition-all duration-200 placeholder:text-gray-400`}
                        />
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                                </svg>
                                {error}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Email */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="feedback-email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Email <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                            id="feedback-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 text-gray-800 text-sm transition-all duration-200 focus:border-indigo-400 placeholder:text-gray-400"
                        />
                    </motion.div>

                    {/* Phone */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="feedback-phone" className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                            id="feedback-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 text-gray-800 text-sm transition-all duration-200 focus:border-indigo-400 placeholder:text-gray-400"
                        />
                    </motion.div>

                    {/* Submit */}
                    <motion.div variants={itemVariants}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Submit Feedback
                                </>
                            )}
                        </button>
                    </motion.div>

                    {/* Privacy note */}
                    <motion.p
                        variants={itemVariants}
                        className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Your feedback is private and only shared with the business.
                    </motion.p>
                </form>
            </div>
        </motion.div>
    );
}

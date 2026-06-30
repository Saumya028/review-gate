'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import StarRating from '../components/StarRating';
import NegativeFeedbackForm from '../components/NegativeFeedbackForm';
import PositiveReviewFlow from '../components/PositiveReviewFlow';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

type Step = 'loading' | 'business' | 'feedback' | 'review' | 'success' | 'error';

interface Business {
    id: number;
    business_id: string;
    name: string;
    type: string;
    logo: string;
    google_place_id: string;
}

export default function BusinessPage() {
    const params = useParams();
    const businessId = params.businessId as string;

    const [step, setStep] = useState<Step>('loading');
    const [business, setBusiness] = useState<Business | null>(null);
    const [rating, setRating] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [loading, setLoading] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://review-gate-j5tr.vercel.app';

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const response = await axios.get(`${apiUrl}/business/${businessId}`);
                setBusiness(response.data);
                setStep('business');
            } catch (error) {
                console.error('Error fetching business:', error);
                setStep('error');
            }
        };

        fetchBusiness();
    }, [businessId, apiUrl]);

    const handleRatingSelect = (selectedRating: number) => {
        setRating(selectedRating);
        if (selectedRating <= 3) {
            setStep('feedback');
        } else {
            setStep('review');
        }
    };

    const handleFeedbackSubmit = async (feedback: string, email?: string, phone?: string, mediaUrls?: string[]) => {
        setLoading(true);
        try {
            await axios.post(`${apiUrl}/feedback`, {
                business_id: businessId,
                rating,
                feedback,
                email: email || '',
                phone: phone || '',
                media_urls: mediaUrls || null,
            });
            setToast({ message: 'Thank you for your feedback!', type: 'success' });
            setStep('success');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setToast({ message: 'Failed to submit feedback. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (keywords: string[]): Promise<string[]> => {
        setLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/generate-review`, {
                business_id: businessId,
                keywords,
            });
            return response.data.reviews;
        } catch (error) {
            console.error('Error generating review:', error);
            throw new Error('Failed to generate review. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const showSuccessMessage = () => {
        setToast({ message: 'Thanks for your review! 🎉', type: 'success' });
    };

    // Spring-based step transition config
    const stepTransition = {
        type: 'spring' as const,
        stiffness: 350,
        damping: 30,
        mass: 0.8,
    };

    // Loading state
    if (step === 'loading') {
        return <LoadingSpinner />;
    }

    // Error state - business not found
    if (step === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <motion.div
                    className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Business Not Found</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        The business you&apos;re looking for doesn&apos;t exist or the link may be incorrect.
                    </p>
                    <a
                        href="/"
                        className="inline-block bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg min-h-[48px] leading-[48px]"
                    >
                        Go Home
                    </a>
                </motion.div>
            </div>
        );
    }

    if (!business) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <AnimatePresence mode="wait">
                    {step === 'business' && (
                        <motion.div
                            key="business"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={stepTransition}
                        >
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                {/* Gradient header accent */}
                                <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400" />

                                <div className="p-8 text-center">
                                    {/* Business logo */}
                                    {business.logo && (
                                        <motion.div
                                            className="mb-6 flex justify-center"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.15, duration: 0.4 }}
                                        >
                                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-md ring-4 ring-white">
                                                <Image
                                                    src={business.logo}
                                                    alt={business.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Business info */}
                                    <motion.h1
                                        className="text-2xl font-bold text-gray-900 mb-1"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        {business.name}
                                    </motion.h1>

                                    <motion.div
                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full mb-8"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                                        <span className="text-indigo-600 text-sm font-medium">{business.type}</span>
                                    </motion.div>

                                    {/* Star rating */}
                                    <StarRating onRate={handleRatingSelect} />

                                    <motion.p
                                        className="text-gray-500 text-sm mt-4"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                    >
                                        How was your experience?
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'feedback' && (
                        <motion.div
                            key="feedback"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={stepTransition}
                        >
                            <NegativeFeedbackForm
                                onSubmit={handleFeedbackSubmit}
                                loading={loading}
                                businessName={business.name}
                            />
                        </motion.div>
                    )}

                    {step === 'review' && (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={stepTransition}
                        >
                            <PositiveReviewFlow
                                business={business}
                                onSuccess={showSuccessMessage}
                                onGenerateReview={handleReviewSubmit}
                            />
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={stepTransition}
                        >
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400" />

                                <div className="p-8 text-center">
                                    <motion.div
                                        className="mb-5"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
                                    >
                                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                                            <svg
                                                className="w-8 h-8 text-emerald-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2.5}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </div>
                                    </motion.div>

                                    <motion.h2
                                        className="text-2xl font-bold text-gray-900 mb-2"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        Thank You!
                                    </motion.h2>

                                    <motion.p
                                        className="text-gray-500 text-sm mb-8"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Your feedback helps us improve {business.name}.
                                        <br />
                                        We truly appreciate your time.
                                    </motion.p>

                                    <motion.button
                                        onClick={() => {
                                            setStep('business');
                                            setRating(null);
                                        }}
                                        className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg min-h-[48px]"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        Submit Another Review
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Powered by footer */}
                <motion.p
                    className="text-center text-xs text-slate-400 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    Powered by ReviewGate
                </motion.p>
            </div>

            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
}
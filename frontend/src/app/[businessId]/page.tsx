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

    const handleReviewSubmit = async (keywords: string[], selectedService: string): Promise<string[]> => {
        setLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/generate-review`, {
                business_id: businessId,
                keywords,
                selected_service: selectedService,
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
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
                <motion.div
                    className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center max-w-md w-full"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-medium text-gray-900 mb-2">Business Not Found</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        The business you&apos;re looking for doesn&apos;t exist or the link may be incorrect.
                    </p>
                    <a
                        href="/"
                        className="inline-block bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium py-3 px-8 rounded-full transition-all duration-200 shadow-sm hover:shadow-md text-sm min-h-[44px] leading-[44px]"
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
        <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
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
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-8 text-center">
                                    {/* Google icon */}
                                    <motion.div
                                        className="mb-5 flex justify-center"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.1, duration: 0.4 }}
                                    >
                                        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                    </motion.div>

                                    {/* Firm name */}
                                    <motion.h1
                                        className="text-xl font-medium text-gray-900 mb-1"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        Chirag Shah &amp; Co.
                                    </motion.h1>

                                    {/* Subtitle with location */}
                                    <motion.p
                                        className="text-sm text-gray-500 mb-1"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        Advocates &amp; Solicitors
                                    </motion.p>

                                    <motion.div
                                        className="inline-flex items-center gap-1 text-gray-400 text-xs mb-8"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                        </svg>
                                        Andheri, Mumbai
                                    </motion.div>

                                    {/* Rating prompt */}
                                    <motion.p
                                        className="text-gray-600 text-sm mb-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Rate your experience
                                    </motion.p>

                                    {/* Star rating */}
                                    <StarRating onRate={handleRatingSelect} />

                                    <motion.p
                                        className="text-gray-400 text-xs mt-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                    >
                                        Your review will be posted on Google
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
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-8 text-center">
                                    <motion.div
                                        className="mb-5"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
                                    >
                                        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                            <svg
                                                className="w-7 h-7 text-green-500"
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
                                        className="text-xl font-medium text-gray-900 mb-2"
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
                                        Your feedback helps improve Chirag Shah &amp; Co.
                                        <br />
                                        We truly appreciate your time.
                                    </motion.p>

                                    <motion.button
                                        onClick={() => {
                                            setStep('business');
                                            setRating(null);
                                        }}
                                        className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium py-3 px-6 rounded-full transition-all duration-200 shadow-sm hover:shadow-md text-sm min-h-[44px]"
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
                    className="text-center text-xs text-gray-400 mt-6"
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
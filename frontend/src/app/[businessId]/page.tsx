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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://review-gate-ivory.vercel.app';
    // const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
            <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center p-4">
                <motion.div
                    className="bg-[#fefcf8] border border-[#e8e2d6] shadow-sm p-10 text-center max-w-md w-full rounded-sm"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    {/* Thin gold top rule */}
                    <div className="w-12 h-px bg-[#b8943a] mx-auto mb-7" />

                    <svg
                        className="w-8 h-8 mx-auto mb-4"
                        style={{ color: '#c9a96e' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>

                    <h2
                        className="text-xl mb-2 tracking-wide"
                        style={{
                            fontFamily: 'var(--font-display, Georgia, serif)',
                            color: '#1a1612',
                            fontWeight: 400,
                        }}
                    >
                        Business Not Found
                    </h2>
                    <p
                        className="text-xs tracking-wider uppercase mb-7"
                        style={{ color: '#7a7268', fontFamily: 'var(--font-body, sans-serif)' }}
                    >
                        The business you&apos;re looking for doesn&apos;t exist or the link may be incorrect.
                    </p>

                    <div className="w-full h-px bg-[#e8e2d6] mb-7" />

                    <a
                        href="/"
                        className="inline-block btn-gold min-h-[44px] leading-[44px] px-8"
                    >
                        Return Home
                    </a>
                </motion.div>
            </div>
        );
    }

    if (!business) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-4">
            <div className="w-full max-w-sm sm:max-w-md">
                <AnimatePresence mode="wait">
                    {step === 'business' && (
                        <motion.div
                            key="business"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={stepTransition}
                            className="rounded-[1.75rem] overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.10)] w-full"
                        >
                            {/* ── AUTHORITATIVE LEGAL BANNER (Top Half) ── */}
                            <div className="bg-gradient-to-b from-[#232731] to-[#181B22] px-6 pt-7 pb-6 flex flex-col items-center">
                                {/* Logo Badge */}
                                <motion.div
                                    className="rounded-full bg-white p-2.5 w-24 h-24 flex items-center justify-center mx-auto shadow-md border border-[#D4AF37]/30 overflow-hidden"
                                    initial={{ scale: 0.7, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.08 }}
                                >
                                    <Image
                                        src="/image_94dc06.png"
                                        alt="Chirag Shah & Co. Logo"
                                        width={80}
                                        height={80}
                                        className="object-contain w-full h-full"
                                        priority
                                    />
                                </motion.div>

                                {/* Firm Name */}
                                <motion.h1
                                    className="text-white text-xl font-medium tracking-wide text-center mt-3"
                                    style={{ fontFamily: 'var(--font-display, Georgia, serif)' }}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.18 }}
                                >
                                    Chirag Shah &amp; Co.
                                </motion.h1>

                                {/* Sub-branding */}
                                <motion.p
                                    className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase text-center mt-1"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.26 }}
                                >
                                    Advocates &amp; Solicitors
                                </motion.p>

                                {/* Thin gold rule */}
                                <motion.div
                                    className="h-px w-20 mt-4 mb-3"
                                    style={{ background: 'linear-gradient(to right, transparent, #D4AF37, transparent)' }}
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    animate={{ scaleX: 1, opacity: 1 }}
                                    transition={{ delay: 0.32, duration: 0.5 }}
                                />

                                {/* Location pin */}
                                <motion.p
                                    className="text-gray-400 text-xs text-center font-medium"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.38 }}
                                >
                                    📍 Andheri, Mumbai
                                </motion.p>
                            </div>

                            {/* ── POLISHED CONTENT WORKSPACE (Bottom Half) ── */}
                            <div className="bg-white rounded-b-[1.75rem] px-6 pt-7 pb-8 flex flex-col items-center justify-center space-y-1">
                                {/* Action guide */}
                                <motion.p
                                    className="text-gray-500 text-sm font-light text-center mb-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.44 }}
                                >
                                    Tap a star to rate your experience
                                </motion.p>

                                {/* Star rating */}
                                <StarRating onRate={handleRatingSelect} />

                                {/* Google caption */}
                                <motion.p
                                    className="text-gray-500 text-xs text-center font-medium uppercase tracking-wider pt-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    Your review will be posted on Google
                                </motion.p>
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
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={stepTransition}
                            className="rounded-[1.75rem] overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.10)] w-full"
                        >
                            {/* Banner header — success state */}
                            <div className="bg-gradient-to-b from-[#232731] to-[#181B22] px-6 pt-7 pb-6 flex flex-col items-center">
                                <div className="rounded-full bg-white p-2.5 w-24 h-24 flex items-center justify-center mx-auto shadow-md border border-[#D4AF37]/30 overflow-hidden">
                                    <Image
                                        src="/image_94dc06.png"
                                        alt="Chirag Shah & Co. Logo"
                                        width={80}
                                        height={80}
                                        className="object-contain w-full h-full"
                                    />
                                </div>
                                <h1
                                    className="text-white text-xl font-medium tracking-wide text-center mt-3"
                                    style={{ fontFamily: 'var(--font-display, Georgia, serif)' }}
                                >
                                    Chirag Shah &amp; Co.
                                </h1>
                                <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase text-center mt-1">
                                    Advocates &amp; Solicitors
                                </p>
                                <div
                                    className="h-px w-20 mt-4 mb-3"
                                    style={{ background: 'linear-gradient(to right, transparent, #D4AF37, transparent)' }}
                                />
                                <p className="text-gray-400 text-xs text-center font-medium">📍 Andheri, Mumbai</p>
                            </div>

                            {/* Success content workspace */}
                            <div className="bg-white rounded-b-[1.75rem] px-8 pt-8 pb-9 flex flex-col items-center text-center">
                                <motion.div
                                    className="mb-5"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
                                >
                                    <div
                                        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto border-2"
                                        style={{
                                            borderColor: '#D4AF37',
                                            backgroundColor: 'rgba(212, 175, 55, 0.08)',
                                        }}
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            style={{ color: '#D4AF37' }}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </motion.div>

                                <div className="w-12 h-px bg-[#D4AF37] mx-auto mb-5" />

                                <motion.h2
                                    style={{ fontFamily: 'var(--font-display, Georgia, serif)', color: '#1a1612', fontWeight: 400 }}
                                    className="text-2xl mb-2 tracking-wide"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                >
                                    Thank You
                                </motion.h2>

                                <motion.p
                                    className="text-xs tracking-[0.15em] uppercase mb-7 leading-relaxed"
                                    style={{ color: '#7a7268' }}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Your feedback helps improve Chirag Shah &amp; Co.
                                    <br />
                                    We truly appreciate your time.
                                </motion.p>

                                <div className="w-full h-px bg-[#e8e2d6] mb-6" />

                                <motion.button
                                    onClick={() => {
                                        setStep('business');
                                        setRating(null);
                                    }}
                                    className="w-full px-8 py-3 rounded-full bg-[#1E2229] text-white text-xs font-semibold tracking-widest uppercase transition duration-200 hover:scale-[1.02] active:scale-[0.98] hover:bg-[#2d3340] shadow-sm"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                >
                                    Submit Another Review
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Powered by footer */}
                <motion.p
                    className="text-center text-xs tracking-[0.2em] uppercase mt-6"
                    style={{ color: '#c9a96e', fontFamily: 'var(--font-body, sans-serif)' }}
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
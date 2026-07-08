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
    onGenerateReview: (keywords: string[], selectedService: string) => Promise<string[]>;
}

const SERVICE_MAP: Record<string, string[]> = {
    'General Legal Consultation': [
        'best legal consultation',
        'best Solicitor in Mumbai',
        'expert legal advice',
        'professional legal opinion',
        'patient listener',
        'thorough analysis',
        'quick response',
        'practical solutions',
        'effective legal strategies',
    ],
    'Property & Real Estate': [
        'property lawyer in Mumbai',
        'best real estate litigation attorney',
        'property title search',
        'Title Certificate',
        'real estate documentation',
        'accessible legal team',
    ],
    'Agreement & MOU drafting': [
        'legal agreement drafting',
        'contract vetting',
        'MOU drafting',
        'leave and license agreement',
        'meticulous documentation',
        'comprehensive legal drafting',
    ],
    'Will and POA drafting': [
        'best will drafting and registration',
        'estate planning',
        'succession planning',
        'LOA and Probate',
        'clear legal guidance on wills',
        'attorney for power of attorney drafting and Registration',
        'general power of attorney',
        'special power of attorney',
        'POA registration',
        'legal assistance for POA',
    ],
    'Redevelopment': [
        'best Solicitor in Mumbai',
        'Development Agreement',
        'society redevelopment',
        'redevelopment legal advisor',
        'conveyancing',
        'development agreement drafting',
        'redevelopment documentation',
    ],
    'RERA & Legal Services': [
        'expert RERA lawyer',
        'RERA process knowledge',
        'RERA compliant documentation',
        'RERA complaint filing',
        'RERA dispute resolution',
        'aggrieved homebuyer representation',
        'delay in possession litigation',
    ],
    'Litigation services': [
        'Best attorney for Litigation',
        'honest legal assessment',
        'Best legal consultation',
        'litigation expert',
        'property disputes',
        'court representation',
        'trusted legal advisor',
    ],
    'Bail Matters & Criminal Defense': [
        'best attorney for bail application',
        'anticipatory bail',
        'urgent bail assistance',
        'best criminal defense lawyer in Mumbai',
        'criminal litigation expert',
        'criminal law expert',
    ],
    'Divorce & Domestic Violence (DV)': [
        'best divorce attorney in mumbai',
        'mutual consent divorce',
        'contested divorce',
        'matrimonial dispute',
        'domestic violence protection',
        'protective orders',
        'legal support for DV cases',
    ],
    'Cheque Bounce & Money Recovery': [
        'Best lawyer for cheque bounce case',
        'recovery of dues',
        'filing a cheque bounce complaint',
        'good advocate for money recovery suit',
        'civil recovery litigation',
        'recovery of outstanding payments',
        'summary suit',
        'proactive litigation strategy',
    ],
    'Consumer Disputes': [
        'consumer court lawyer',
        'consumer complaint',
        'consumer forum representation',
        'deficiency of service',
        'unfair trade practice',
        'consumer rights protection',
    ],
};

const SERVICE_NAMES = Object.keys(SERVICE_MAP);

export default function PositiveReviewFlow({ business, onSuccess, onGenerateReview }: PositiveReviewFlowProps) {
    const [selectedService, setSelectedService] = useState<string>('');
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [generatedReviews, setGeneratedReviews] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [phase, setPhase] = useState<'service' | 'keywords' | 'review'>('service');

    const handleServiceSelect = (service: string) => {
        setSelectedService(service);
        setSelectedKeywords([]);
        setError('');
        setPhase('keywords');
    };

    const toggleKeyword = (keyword: string) => {
        setSelectedKeywords((prev) =>
            prev.includes(keyword)
                ? prev.filter((k) => k !== keyword)
                : [...prev, keyword]
        );
        if (error) setError('');
    };

    const handleGenerate = async () => {
        if (selectedKeywords.length === 0) {
            setError('Please select at least one keyword.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const reviews = await onGenerateReview(selectedKeywords, selectedService);
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

    const currentKeywords = selectedService ? SERVICE_MAP[selectedService] || [] : [];

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                    {/* Phase 1: Service Selection */}
                    {phase === 'service' && (
                        <motion.div
                            key="service"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                        >
                            {/* Google-style icon */}
                            <motion.div variants={itemVariants} className="text-center mb-3">
                                <div className="w-10 h-10 mx-auto rounded-full bg-[#e8f0fe] flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[#1a73e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </motion.div>

                            <motion.h2
                                variants={itemVariants}
                                className="text-lg font-medium text-gray-900 text-center mb-1"
                            >
                                Glad you had a great experience!
                            </motion.h2>

                            <motion.p
                                variants={itemVariants}
                                className="text-gray-500 text-center text-sm mb-6"
                            >
                                Which legal service did you use?
                            </motion.p>

                            {/* Service list */}
                            <motion.div
                                variants={itemVariants}
                                className="space-y-2 mb-4 max-h-[320px] overflow-y-auto pr-1"
                            >
                                {SERVICE_NAMES.map((service) => (
                                    <button
                                        key={service}
                                        onClick={() => handleServiceSelect(service)}
                                        className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-[#f8f9fa] hover:border-gray-300 text-sm text-gray-700 font-medium transition-all duration-150 flex items-center justify-between group min-h-[44px]"
                                    >
                                        {service}
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-[#1a73e8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Phase 2: Keyword Chips */}
                    {phase === 'keywords' && (
                        <motion.div
                            key="keywords"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                        >
                            {/* Selected service badge */}
                            <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 mb-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-xs font-medium">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {selectedService}
                                </span>
                            </motion.div>

                            <motion.h2
                                variants={itemVariants}
                                className="text-lg font-medium text-gray-900 text-center mb-1"
                            >
                                What stood out to you?
                            </motion.h2>

                            <motion.p
                                variants={itemVariants}
                                className="text-gray-500 text-center text-sm mb-6"
                            >
                                Select the aspects you appreciated most
                            </motion.p>

                            {/* Keyword chips — Google filter style */}
                            <motion.div
                                variants={itemVariants}
                                className="flex flex-wrap gap-2 justify-center mb-6"
                            >
                                {currentKeywords.map((keyword, index) => {
                                    const isSelected = selectedKeywords.includes(keyword);
                                    return (
                                        <motion.button
                                            key={keyword}
                                            onClick={() => toggleKeyword(keyword)}
                                            className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-150 border flex items-center gap-1.5 min-h-[36px] ${
                                                isSelected
                                                    ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8]'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                            }`}
                                            whileTap={{ scale: 0.95 }}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                transition: { delay: 0.1 + index * 0.04 },
                                            }}
                                        >
                                            {keyword}
                                            {isSelected && (
                                                <motion.svg
                                                    className="w-3.5 h-3.5 text-[#1a73e8]"
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

                            {/* Generate button — Google Blue */}
                            <motion.div variants={itemVariants}>
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium py-3 px-6 rounded-full transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 min-h-[48px] text-sm"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Generating your reviews...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Generate Reviews
                                        </>
                                    )}
                                </button>
                            </motion.div>

                            {/* Chip count + back */}
                            <motion.div variants={itemVariants} className="flex items-center justify-between mt-4">
                                <button
                                    onClick={() => {
                                        setPhase('service');
                                        setSelectedService('');
                                        setSelectedKeywords([]);
                                    }}
                                    className="text-[#1a73e8] hover:text-[#1557b0] text-sm font-medium flex items-center gap-1 transition-colors min-h-[36px]"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Change service
                                </button>
                                {selectedKeywords.length > 0 && (
                                    <span className="text-xs text-gray-400">
                                        {selectedKeywords.length} selected
                                    </span>
                                )}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Phase 3: Review Display */}
                    {phase === 'review' && generatedReviews && (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <div className="text-center mb-2">
                                <div className="w-10 h-10 mx-auto rounded-full bg-[#e8f0fe] flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-[#1a73e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                            </div>

                            <h2 className="text-lg font-medium text-gray-900 text-center mb-1">
                                Your reviews are ready
                            </h2>

                            <p className="text-gray-500 text-center text-sm mb-6">
                                Choose your favorite below — tap to browse {generatedReviews.length} options
                            </p>

                            <ReviewDisplay
                                reviews={generatedReviews}
                                googlePlaceId={business.google_place_id}
                                onSuccess={onSuccess}
                            />

                            {/* Back button */}
                            <button
                                onClick={() => setPhase('keywords')}
                                className="w-full mt-4 text-[#1a73e8] hover:text-[#1557b0] text-sm font-medium py-2 transition-colors flex items-center justify-center gap-1.5 min-h-[36px]"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to keywords
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

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
        <div
            className="border border-[#e8e2d6] shadow-sm overflow-hidden rounded-sm"
            style={{ backgroundColor: 'var(--bg-card)' }}
        >
            {/* Premium gold top accent bar */}
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#b8943a] to-transparent" />

            <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                    {/* ─── Phase 1: Service Selection ─── */}
                    {phase === 'service' && (
                        <motion.div
                            key="service"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                        >
                            {/* Section header */}
                            <motion.div variants={itemVariants} className="mb-6">
                                <div className="w-10 h-px bg-[#b8943a] mb-5" />
                                <h2
                                    className="text-xl mb-1 tracking-wide"
                                    style={{
                                        fontFamily: 'var(--font-display, Georgia, serif)',
                                        color: '#1a1612',
                                        fontWeight: 400,
                                    }}
                                >
                                    Glad you had a great experience!
                                </h2>
                                <p
                                    className="text-xs tracking-[0.15em] uppercase"
                                    style={{ color: '#7a7268', fontFamily: 'var(--font-body, sans-serif)' }}
                                >
                                    Which legal service did you use?
                                </p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="w-full h-px bg-[#e8e2d6] mb-6" />

                            {/* Service list — flat, sharp, legal */}
                            <motion.div
                                variants={itemVariants}
                                className="space-y-2 mb-4 max-h-[340px] overflow-y-auto pr-0.5"
                            >
                                {SERVICE_NAMES.map((service) => (
                                    <button
                                        key={service}
                                        onClick={() => handleServiceSelect(service)}
                                        className="w-full text-left px-4 py-3.5 border border-[#e8e2d6] bg-[#fefcf8] hover:bg-[#f5f3ef] hover:border-[#c9a96e] text-sm flex items-center justify-between group min-h-[48px] transition-all duration-150 rounded-sm"
                                        style={{
                                            color: '#4a4540',
                                            fontFamily: 'var(--font-body, sans-serif)',
                                        }}
                                    >
                                        <span>{service}</span>
                                        <svg
                                            className="w-3.5 h-3.5 flex-shrink-0 transition-colors duration-150 group-hover:text-[#b8943a]"
                                            style={{ color: '#c9a96e' }}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* ─── Phase 2: Keyword Selection ─── */}
                    {phase === 'keywords' && (
                        <motion.div
                            key="keywords"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                        >
                            {/* Selected service badge — flat gold pill */}
                            <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 mb-5">
                                <span
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-[0.1em] uppercase border"
                                    style={{
                                        backgroundColor: 'rgba(184, 148, 58, 0.08)',
                                        borderColor: '#c9a96e',
                                        color: '#8a6c25',
                                        fontFamily: 'var(--font-body, sans-serif)',
                                        borderRadius: '2px',
                                    }}
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {selectedService}
                                </span>
                            </motion.div>

                            {/* Header */}
                            <motion.div variants={itemVariants} className="mb-5">
                                <h2
                                    className="text-xl mb-1 tracking-wide text-center"
                                    style={{
                                        fontFamily: 'var(--font-display, Georgia, serif)',
                                        color: '#1a1612',
                                        fontWeight: 400,
                                    }}
                                >
                                    What stood out to you?
                                </h2>
                                <p
                                    className="text-xs tracking-[0.15em] uppercase text-center"
                                    style={{ color: '#7a7268', fontFamily: 'var(--font-body, sans-serif)' }}
                                >
                                    Select the aspects you appreciated most
                                </p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="w-full h-px bg-[#e8e2d6] mb-5" />

                            {/* Keyword chips — flat, gold-accent selection state */}
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
                                            className={`px-3.5 py-2 text-xs font-medium tracking-wide border flex items-center gap-1.5 min-h-[36px] transition-all duration-150 ${
                                                isSelected
                                                    ? 'border-[#b8943a] text-[#8a6c25]'
                                                    : 'border-[#e8e2d6] hover:border-[#c9a96e] hover:bg-[#f5f3ef]'
                                            }`}
                                            style={{
                                                backgroundColor: isSelected ? 'rgba(184, 148, 58, 0.09)' : '#fefcf8',
                                                color: isSelected ? '#8a6c25' : '#4a4540',
                                                fontFamily: 'var(--font-body, sans-serif)',
                                                borderRadius: '2px',
                                                textTransform: 'none',
                                            }}
                                            whileTap={{ scale: 0.96 }}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                transition: { delay: 0.08 + index * 0.035 },
                                            }}
                                        >
                                            {isSelected && (
                                                <motion.svg
                                                    className="w-3 h-3"
                                                    style={{ color: '#b8943a' }}
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
                                            {keyword}
                                        </motion.button>
                                    );
                                })}
                            </motion.div>

                            {/* Error message */}
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-xs text-center mb-4 flex items-center justify-center gap-1.5 tracking-wide"
                                    style={{ fontFamily: 'var(--font-body, sans-serif)' }}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                                    </svg>
                                    {error}
                                </motion.p>
                            )}

                            <motion.div variants={itemVariants} className="w-full h-px bg-[#e8e2d6] mb-5" />

                            {/* Generate button — gold, flat, tracked */}
                            <motion.div variants={itemVariants}>
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="btn-gold w-full disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
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
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Generate Reviews
                                        </>
                                    )}
                                </button>
                            </motion.div>

                            {/* Back + chip count row */}
                            <motion.div variants={itemVariants} className="flex items-center justify-between mt-4">
                                <button
                                    onClick={() => {
                                        setPhase('service');
                                        setSelectedService('');
                                        setSelectedKeywords([]);
                                    }}
                                    className="btn-ghost-gold flex items-center gap-1.5 px-3 py-2 text-xs min-h-[36px]"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Change service
                                </button>
                                {selectedKeywords.length > 0 && (
                                    <span
                                        className="text-xs tracking-wider uppercase"
                                        style={{ color: '#c9a96e', fontFamily: 'var(--font-body, sans-serif)' }}
                                    >
                                        {selectedKeywords.length} selected
                                    </span>
                                )}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* ─── Phase 3: Review Display ─── */}
                    {phase === 'review' && generatedReviews && (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            {/* Header */}
                            <div className="mb-6">
                                <div className="w-10 h-px bg-[#b8943a] mb-5" />
                                <h2
                                    className="text-xl mb-1 tracking-wide"
                                    style={{
                                        fontFamily: 'var(--font-display, Georgia, serif)',
                                        color: '#1a1612',
                                        fontWeight: 400,
                                    }}
                                >
                                    Your reviews are ready
                                </h2>
                                <p
                                    className="text-xs tracking-[0.15em] uppercase"
                                    style={{ color: '#7a7268', fontFamily: 'var(--font-body, sans-serif)' }}
                                >
                                    Choose your favourite &mdash; browse {generatedReviews.length} options
                                </p>
                            </div>

                            <div className="w-full h-px bg-[#e8e2d6] mb-6" />

                            <ReviewDisplay
                                reviews={generatedReviews}
                                googlePlaceId={business.google_place_id}
                                onSuccess={onSuccess}
                            />

                            {/* Back button */}
                            <button
                                onClick={() => setPhase('keywords')}
                                className="btn-ghost-gold w-full mt-4 flex items-center justify-center gap-1.5 min-h-[40px]"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to keywords
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Gold bottom accent bar */}
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#b8943a] to-transparent" />
        </div>
    );
}

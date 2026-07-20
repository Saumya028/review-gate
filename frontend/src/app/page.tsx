'use client';

import { motion } from 'framer-motion';

export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-page)' }}>
            <div className="w-full max-w-md">
                <motion.div
                    className="border border-[#e8e2d6] shadow-sm overflow-hidden rounded-sm"
                    style={{ backgroundColor: 'var(--bg-card)' }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Premium gold top accent bar */}
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#b8943a] to-transparent" />

                    <div className="px-8 pt-10 pb-10 text-center">
                        {/* Firm name — bold serif, editorial display */}
                        <motion.h1
                            style={{
                                fontFamily: 'var(--font-display, Georgia, serif)',
                                color: '#1a1612',
                                fontWeight: 700,
                                letterSpacing: '0.03em',
                            }}
                            className="text-3xl mb-2"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            Chirag Shah &amp; Co.
                        </motion.h1>

                        {/* Subtitle — heavily tracked uppercase */}
                        <motion.p
                            className="text-xs tracking-[0.2em] uppercase font-medium mt-2"
                            style={{
                                color: '#7a7268',
                                fontFamily: 'var(--font-body, sans-serif)',
                            }}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.18 }}
                        >
                            Advocates &amp; Solicitors
                        </motion.p>

                        {/* Gold separator line */}
                        <motion.div
                            className="h-[2px] w-16 mx-auto my-6"
                            style={{ backgroundColor: '#C5A880' }}
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            transition={{ delay: 0.28, duration: 0.5 }}
                        />

                        {/* Core message */}
                        <motion.p
                            className="text-xs tracking-wide leading-relaxed mb-8 max-w-xs mx-auto uppercase"
                            style={{ color: '#7a7268', fontFamily: 'var(--font-body, sans-serif)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35 }}
                        >
                            Thank you for using our service. Your review helps us serve our clients better.
                        </motion.p>

                        {/* Thin rule before CTA */}
                        <motion.div
                            className="w-full h-px bg-[#e8e2d6] mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.38 }}
                        />

                        {/* CTA Button — flat gold, uppercase, tracked */}
                        <motion.a
                            href="/cafe123"
                            className="btn-gold inline-flex items-center justify-center w-full gap-2 min-h-[44px]"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.42 }}
                        >
                            Write a Review
                        </motion.a>
                    </div>

                    {/* Gold bottom accent bar */}
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#b8943a] to-transparent" />
                </motion.div>

                {/* Footer */}
                <motion.p
                    className="text-center text-xs tracking-[0.2em] uppercase mt-6"
                    style={{ color: '#c9a96e', fontFamily: 'var(--font-body, sans-serif)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    Powered by ReviewGate
                </motion.p>
            </div>
        </div>
    );
}
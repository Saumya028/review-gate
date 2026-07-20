'use client';

import { motion } from 'framer-motion';

export default function LoadingSpinner() {
    return (
        <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center p-4">
            <motion.div
                className="flex flex-col items-center gap-7"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                {/* Animated spinner — gold rings */}
                <div className="relative w-16 h-16">
                    <motion.div
                        className="absolute inset-0 rounded-full border-2"
                        style={{ borderColor: '#e8e2d6' }}
                    />
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-transparent"
                        style={{ borderTopColor: '#b8943a', borderRightColor: '#d4a853' }}
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                    <motion.div
                        className="absolute inset-2 rounded-full border-2 border-transparent"
                        style={{ borderBottomColor: '#c9a96e', borderLeftColor: '#8a6c25' }}
                        animate={{ rotate: -360 }}
                        transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                </div>

                {/* Pulsing label — uppercase tracked, legal style */}
                <motion.p
                    className="text-xs font-semibold tracking-[0.2em] uppercase"
                    style={{ color: '#b8943a', fontFamily: 'var(--font-body, sans-serif)' }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    Loading
                </motion.p>
            </motion.div>
        </div>
    );
}

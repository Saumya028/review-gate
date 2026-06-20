'use client';

import { motion } from 'framer-motion';

export default function LoadingSpinner() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <motion.div
                className="flex flex-col items-center gap-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                {/* Animated spinner */}
                <div className="relative w-16 h-16">
                    <motion.div
                        className="absolute inset-0 rounded-full border-4 border-indigo-100"
                    />
                    <motion.div
                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-indigo-400"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                    <motion.div
                        className="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-400 border-l-blue-300"
                        animate={{ rotate: -360 }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                </div>

                {/* Pulsing text */}
                <motion.p
                    className="text-sm font-medium text-slate-500 tracking-wide"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    Loading...
                </motion.p>
            </motion.div>
        </div>
    );
}

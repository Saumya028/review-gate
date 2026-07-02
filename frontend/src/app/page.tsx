'use client';

import { motion } from 'framer-motion';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <motion.div
                    className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="p-8 text-center">
                        {/* Google logo */}
                        <motion.div
                            className="mb-6 flex justify-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
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

                        <motion.p
                            className="text-sm text-gray-500 mb-1"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Advocates &amp; Solicitors
                        </motion.p>

                        {/* Location */}
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

                        {/* Divider */}
                        <motion.div
                            className="border-t border-gray-100 mb-6"
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                        />

                        {/* Core message */}
                        <motion.p
                            className="text-sm text-gray-600 leading-relaxed mb-8 max-w-xs mx-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35 }}
                        >
                            Thank you for using our Service. Please give us a review. All your reviews will help us be better.
                        </motion.p>

                        {/* CTA Button */}
                        <motion.a
                            href="/cafe123"
                            className="inline-flex items-center justify-center w-full gap-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium py-3 px-6 rounded-full transition-all duration-200 shadow-sm hover:shadow-md text-sm min-h-[44px]"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            Write a Review
                        </motion.a>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.p
                    className="text-center text-xs text-gray-400 mt-6"
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
'use client';

import { motion } from 'framer-motion';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 overflow-hidden relative">
            {/* Decorative background blobs */}
            <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
            <div className="absolute top-[40%] left-[50%] w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl" />

            <div className="relative z-10 text-center max-w-xl w-full">
                {/* Logo / Brand */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-200/50 mb-5">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                        Review<span className="gradient-text">Gate</span>
                    </h1>

                    <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
                        AI-powered review collection and intelligent feedback management for modern businesses.
                    </p>
                </motion.div>

                {/* Feature chips */}
                <motion.div
                    className="flex flex-wrap justify-center gap-2.5 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    {[
                        { icon: '⭐', text: 'Smart Review Gating' },
                        { icon: '🤖', text: 'AI-Generated Reviews' },
                        { icon: '📊', text: 'Private Feedback' },
                    ].map((feature) => (
                        <span
                            key={feature.text}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-white/50 text-sm text-slate-600 font-medium shadow-sm"
                        >
                            <span>{feature.icon}</span>
                            {feature.text}
                        </span>
                    ))}
                </motion.div>

                {/* Demo card */}
                <motion.div
                    className="glass-card rounded-2xl p-8 shadow-xl max-w-sm mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <div className="flex items-center gap-3 mb-5 justify-center">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <span className="text-xl">☕</span>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-gray-900">Brew Haven</p>
                            <p className="text-xs text-slate-500">Demo Coffee Shop</p>
                        </div>
                    </div>

                    <p className="text-slate-500 text-sm mb-5">
                        Try the full customer review experience with our demo business.
                    </p>

                    <a
                        href="/cafe123"
                        className="inline-flex items-center justify-center w-full gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        Try Demo
                    </a>

                    <p className="text-xs text-slate-400 mt-3">
                        Business ID: <code className="bg-slate-100 px-2 py-0.5 rounded text-indigo-500 font-mono">cafe123</code>
                    </p>
                </motion.div>

                {/* How it works */}
                <motion.div
                    className="mt-10 grid grid-cols-3 gap-4 max-w-sm mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    {[
                        { step: '1', title: 'Scan QR', desc: 'Customer scans code' },
                        { step: '2', title: 'Rate', desc: 'Rate the experience' },
                        { step: '3', title: 'Review', desc: 'AI generates review' },
                    ].map((item) => (
                        <div key={item.step} className="text-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center mx-auto mb-2">
                                {item.step}
                            </div>
                            <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                            <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

interface MediaFile {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: 'pending' | 'uploading' | 'done' | 'error';
    publicUrl?: string;
    type: 'image' | 'video';
}

interface NegativeFeedbackFormProps {
    onSubmit: (feedback: string, email?: string, phone?: string, mediaUrls?: string[]) => void;
    loading: boolean;
    businessName: string;
}

const MAX_FILES = 3;
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function NegativeFeedbackForm({ onSubmit, loading, businessName }: NegativeFeedbackFormProps) {
    const [feedback, setFeedback] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://review-gate-j5tr.vercel.app';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim()) {
            setError('Please share your feedback so we can improve.');
            return;
        }
        setError('');

        // Collect all successfully uploaded media URLs
        const mediaUrls = mediaFiles
            .filter((f) => f.status === 'done' && f.publicUrl)
            .map((f) => f.publicUrl!);

        onSubmit(feedback, email || undefined, phone || undefined, mediaUrls.length > 0 ? mediaUrls : undefined);
    };

    const generateId = () => Math.random().toString(36).substring(2, 10);

    const uploadFile = useCallback(async (mediaFile: MediaFile) => {
        try {
            // Update status to uploading
            setMediaFiles((prev) =>
                prev.map((f) => (f.id === mediaFile.id ? { ...f, status: 'uploading' as const, progress: 10 } : f))
            );

            // Step 1: Get pre-signed upload URL from backend
            const urlRes = await axios.post(`${apiUrl}/upload-url`, {
                filename: mediaFile.file.name,
                content_type: mediaFile.file.type,
            });

            const { upload_url, public_url } = urlRes.data;

            setMediaFiles((prev) =>
                prev.map((f) => (f.id === mediaFile.id ? { ...f, progress: 30 } : f))
            );

            // Step 2: Upload directly to Supabase Storage using the signed URL
            await axios.put(upload_url, mediaFile.file, {
                headers: {
                    'Content-Type': mediaFile.file.type,
                },
                onUploadProgress: (progressEvent) => {
                    const percent = progressEvent.total
                        ? Math.round(30 + (progressEvent.loaded / progressEvent.total) * 65)
                        : 60;
                    setMediaFiles((prev) =>
                        prev.map((f) => (f.id === mediaFile.id ? { ...f, progress: percent } : f))
                    );
                },
            });

            // Mark as done
            setMediaFiles((prev) =>
                prev.map((f) =>
                    f.id === mediaFile.id
                        ? { ...f, status: 'done' as const, progress: 100, publicUrl: public_url }
                        : f
                )
            );
        } catch (err) {
            console.error('Upload error:', err);
            setMediaFiles((prev) =>
                prev.map((f) => (f.id === mediaFile.id ? { ...f, status: 'error' as const, progress: 0 } : f))
            );
            setUploadError('Upload failed. File saved locally — feedback can still be submitted.');
            setTimeout(() => setUploadError(''), 4000);
        }
    }, [apiUrl]);

    const addFiles = useCallback((files: FileList | File[]) => {
        const fileArray = Array.from(files);
        setUploadError('');

        const remaining = MAX_FILES - mediaFiles.length;
        if (remaining <= 0) {
            setUploadError(`Maximum ${MAX_FILES} files allowed.`);
            setTimeout(() => setUploadError(''), 3000);
            return;
        }

        const validFiles = fileArray.slice(0, remaining).filter((file) => {
            if (file.size > MAX_SIZE_BYTES) {
                setUploadError(`"${file.name}" exceeds ${MAX_SIZE_MB}MB limit.`);
                setTimeout(() => setUploadError(''), 3000);
                return false;
            }
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                setUploadError(`"${file.name}" is not a supported image or video.`);
                setTimeout(() => setUploadError(''), 3000);
                return false;
            }
            return true;
        });

        const newMediaFiles: MediaFile[] = validFiles.map((file) => ({
            id: generateId(),
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: 'pending' as const,
            type: file.type.startsWith('video/') ? 'video' as const : 'image' as const,
        }));

        setMediaFiles((prev) => [...prev, ...newMediaFiles]);

        // Start uploading each file
        newMediaFiles.forEach((mf) => uploadFile(mf));
    }, [mediaFiles.length, uploadFile]);

    const removeFile = (id: string) => {
        setMediaFiles((prev) => {
            const file = prev.find((f) => f.id === id);
            if (file) URL.revokeObjectURL(file.preview);
            return prev.filter((f) => f.id !== id);
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: 'easeOut' as const },
        },
    };

    return (
        <motion.div
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="p-6 sm:p-8">
                {/* Header — flat, professional, no gradient bar or emoji */}
                <motion.h2
                    variants={itemVariants}
                    className="text-lg font-medium text-gray-900 mb-2"
                >
                    Share your feedback with Chirag Shah &amp; Co. Advocates &amp; Solicitors
                </motion.h2>

                <motion.p
                    variants={itemVariants}
                    className="text-gray-500 text-sm mb-6"
                >
                    Your response is confidential and helps us improve our services.
                </motion.p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Feedback textarea */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="feedback-text" className="block text-sm font-medium text-gray-700 mb-1.5">
                            What went wrong? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="feedback-text"
                            value={feedback}
                            onChange={(e) => {
                                setFeedback(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Tell us about your experience..."
                            rows={4}
                            className={`w-full px-3.5 py-2.5 rounded-md border text-sm text-gray-800 resize-none transition-all duration-150 placeholder:text-gray-400 bg-white min-h-[48px] ${
                                error
                                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                            }`}
                        />
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                                </svg>
                                {error}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* === Media Upload Zone — clean, flat Google-style === */}
                    <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Attachments <span className="text-gray-400 font-normal">(optional)</span>
                        </label>

                        {/* Flat upload area */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative cursor-pointer rounded-md border transition-all duration-150 ${
                                isDragOver
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            } ${mediaFiles.length >= MAX_FILES ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <div className="flex items-center gap-3 py-3.5 px-4">
                                <motion.div
                                    animate={isDragOver ? { scale: 1.05 } : { scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    {/* Paperclip / attachment icon */}
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </motion.div>
                                <div>
                                    <p className="text-sm text-[#1a73e8] font-medium">
                                        {isDragOver ? 'Drop files here' : 'Add files'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Images &amp; videos · Max {MAX_SIZE_MB}MB · Up to {MAX_FILES} files
                                    </p>
                                </div>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files) addFiles(e.target.files);
                                    e.target.value = '';
                                }}
                            />
                        </div>

                        {/* Upload Error */}
                        <AnimatePresence>
                            {uploadError && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="text-red-500 text-xs mt-2 flex items-center gap-1"
                                >
                                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    {uploadError}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* Thumbnail Grid */}
                        <AnimatePresence>
                            {mediaFiles.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="grid grid-cols-3 gap-2.5 mt-3"
                                >
                                    {mediaFiles.map((mf) => (
                                        <motion.div
                                            key={mf.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                            className="relative aspect-square rounded-md overflow-hidden bg-gray-100 group"
                                        >
                                            {/* Preview */}
                                            {mf.type === 'image' ? (
                                                <img
                                                    src={mf.preview}
                                                    alt="Upload preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <video
                                                    src={mf.preview}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                />
                                            )}

                                            {/* Video badge */}
                                            {mf.type === 'video' && mf.status === 'done' && (
                                                <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                    <span className="text-white text-[10px] font-medium">VIDEO</span>
                                                </div>
                                            )}

                                            {/* Progress overlay */}
                                            {(mf.status === 'uploading' || mf.status === 'pending') && (
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                                    <div className="relative w-10 h-10">
                                                        <svg className="upload-progress-ring w-10 h-10" viewBox="0 0 36 36">
                                                            <circle
                                                                className="text-white/20"
                                                                strokeWidth="3"
                                                                stroke="currentColor"
                                                                fill="none"
                                                                cx="18"
                                                                cy="18"
                                                                r="15.5"
                                                            />
                                                            <circle
                                                                className="text-white"
                                                                strokeWidth="3"
                                                                strokeDasharray={`${mf.progress} 100`}
                                                                strokeLinecap="round"
                                                                stroke="currentColor"
                                                                fill="none"
                                                                cx="18"
                                                                cy="18"
                                                                r="15.5"
                                                            />
                                                        </svg>
                                                        <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
                                                            {mf.progress}%
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Error overlay */}
                                            {mf.status === 'error' && (
                                                <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[2px] flex items-center justify-center">
                                                    <div className="w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Success checkmark */}
                                            {mf.status === 'done' && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-sm"
                                                >
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </motion.div>
                                            )}

                                            {/* Delete button */}
                                            <motion.button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFile(mf.id);
                                                }}
                                                className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                                                whileTap={{ scale: 0.85 }}
                                            >
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Email */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="feedback-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                            id="feedback-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full px-3.5 py-2.5 rounded-md border border-gray-300 bg-white text-gray-800 text-sm transition-all duration-150 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 min-h-[44px]"
                        />
                    </motion.div>

                    {/* Phone */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="feedback-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Phone <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                            id="feedback-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full px-3.5 py-2.5 rounded-md border border-gray-300 bg-white text-gray-800 text-sm transition-all duration-150 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 min-h-[44px]"
                        />
                    </motion.div>

                    {/* Submit */}
                    <motion.div variants={itemVariants}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium py-3 px-6 rounded-full transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] text-sm"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Feedback'
                            )}
                        </button>
                    </motion.div>

                    {/* Privacy note */}
                    <motion.p
                        variants={itemVariants}
                        className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Your feedback is private and only shared with the business.
                    </motion.p>
                </form>
            </div>
        </motion.div>
    );
}

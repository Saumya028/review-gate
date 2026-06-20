'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface StarRatingProps {
    onRate: (rating: number) => void;
}

export default function StarRating({ onRate }: StarRatingProps) {
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const starVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 200,
                damping: 20,
            },
        },
    };

    return (
        <motion.div
            className="flex justify-center gap-2 sm:gap-3 my-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {[1, 2, 3, 4, 5].map((rating) => {
                const isFilled = hoveredRating !== null ? rating <= hoveredRating : false;
                return (
                    <motion.button
                        key={rating}
                        variants={starVariants}
                        onClick={() => onRate(rating)}
                        onMouseEnter={() => setHoveredRating(rating)}
                        onMouseLeave={() => setHoveredRating(null)}
                        onTouchStart={() => setHoveredRating(rating)}
                        className="focus:outline-none transform transition-all touch-target flex items-center justify-center p-1"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85, rotate: -8 }}
                        aria-label={`Rate ${rating} star${rating !== 1 ? 's' : ''}`}
                    >
                        <motion.svg
                            className={`w-12 h-12 sm:w-14 sm:h-14 transition-colors duration-200 ${
                                isFilled
                                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_2px_8px_rgba(250,204,21,0.4)]'
                                    : 'fill-gray-200 text-gray-200'
                            }`}
                            viewBox="0 0 24 24"
                            animate={{
                                scale: isFilled ? 1.1 : 1,
                            }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </motion.svg>
                    </motion.button>
                );
            })}
        </motion.div>
    );
}
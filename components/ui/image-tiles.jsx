'use client'
import { motion } from 'framer-motion';
import React from 'react';

export default function ImageReveal({ leftImage, middleImage, rightImage }) {
    const containerVariants = {
        initial: {
            opacity: 0,
        },
        animate: {
            opacity: 1,
            transition: {
                delay: 0.2,
                staggerChildren: 0.2,
            }
        }
    };

    const leftImageVariants = {
        initial: { rotate: 0, x: 0, y: 0 },
        animate: {
            rotate: -8,
            x: -100,
            y: 10,
            transition: {
                type: "spring",
                stiffness: 120,
                damping: 12
            }
        },
        hover: {
            rotate: 1,
            x: -110,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15
            }
        }
    };

    const middleImageVariants = {
        initial: { rotate: 0, x: 0, y: 0 },
        animate: {
            rotate: 6,
            x: 0,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 120,
                damping: 12
            }
        },
        hover: {
            rotate: 0,
            x: 0,
            y: -10,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15
            }
        }
    };

    const rightImageVariants = {
        initial: { rotate: 0, x: 0, y: 0 },
        animate: {
            rotate: -6,
            x: 130,
            y: 20,
            transition: {
                type: "spring",
                stiffness: 120,
                damping: 12
            }
        },
        hover: {
            rotate: 3,
            x: 130,
            y: 10,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15
            }
        }
    };

    return (
        <motion.div
            className="relative flex items-center justify-center w-full h-full my-12"
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            {/* Left Image - Lowest z-index */}
            <motion.div
                className="absolute w-48 h-48 lg:w-64 lg:h-64 origin-bottom-right overflow-hidden rounded-xl shadow-2xl bg-white"
                variants={leftImageVariants}
                whileHover="hover"
                animate="animate"
                style={{ zIndex: 30 }}
            >
                <img
                    src={leftImage}
                    alt="Italian Property"
                    className="object-cover w-full h-full p-2 rounded-xl"
                />
            </motion.div>

            {/* Middle Image - Middle z-index */}
            <motion.div
                className="absolute w-48 h-48 lg:w-64 lg:h-64 origin-bottom-left overflow-hidden rounded-xl shadow-2xl bg-white"
                variants={middleImageVariants}
                whileHover="hover"
                animate="animate"
                style={{ zIndex: 20 }}
            >
                <img
                    src={middleImage}
                    alt="Italian Villa"
                    className="object-cover w-full h-full p-2 rounded-2xl"
                />
            </motion.div>

            {/* Right Image - Highest z-index */}
            <motion.div
                className="absolute w-48 h-48 lg:w-64 lg:h-64 origin-bottom-right overflow-hidden rounded-xl shadow-2xl bg-white"
                variants={rightImageVariants}
                whileHover="hover"
                animate="animate"
                style={{ zIndex: 10 }}
            >
                <img
                    src={rightImage}
                    alt="Italian Landscape"
                    className="object-cover w-full h-full p-2 rounded-2xl"
                />
            </motion.div>
        </motion.div>
    );
}


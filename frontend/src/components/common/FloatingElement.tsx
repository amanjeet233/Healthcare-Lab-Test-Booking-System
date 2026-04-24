import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FloatingElementProps {
    children: ReactNode;
    duration?: number;
    yOffset?: number;
    delay?: number;
    className?: string;
}

const FloatingElement: React.FC<FloatingElementProps> = ({
    children,
    duration = 3,
    yOffset = 10,
    delay = 0,
    className = ""
}) => {
    return (
        <motion.div
            animate={{
                y: [yOffset, -yOffset, yOffset],
                rotate: [0, 2, -2, 0],
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default FloatingElement;

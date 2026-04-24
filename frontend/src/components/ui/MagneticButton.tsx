import React, { useRef, useState, type ReactNode } from 'react';
import { motion, useSpring } from 'framer-motion';

interface MagneticButtonProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    strength?: number;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({
    children,
    onClick,
    className = "",
    strength = 40
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const x = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });
    const y = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        x.set((clientX - centerX) / (width / strength));
        y.set((clientY - centerY) / (height / strength));
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        setIsHovered(false);
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            className="relative"
        >
            <motion.button
                style={{ x, y }}
                onClick={onClick}
                className={`relative z-10 px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 overflow-hidden group shadow-lg ${className}`}
            >
                {/* Internal Glow Animation */}
                <motion.div
                    animate={{
                        scale: isHovered ? [1, 1.2, 1] : 1,
                        opacity: isHovered ? [0.3, 0.5, 0.3] : 0,
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-white/20 blur-xl pointer-events-none"
                />

                {/* Overlap Gradient Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r from-white via-transparent to-white pointer-events-none" />

                <span className="relative z-10">{children}</span>
            </motion.button>
        </div>
    );
};

export default MagneticButton;

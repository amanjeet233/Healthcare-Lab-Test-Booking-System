import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, MeshDistortMaterial, Torus } from '@react-three/drei';
import React, { useRef, Suspense } from 'react';
import * as THREE from 'three';

const MedicineBottle = () => {
    return (
        <group>
            {/* Bottle Body */}
            <mesh>
                <cylinderGeometry args={[0.8, 0.8, 2, 32]} />
                <meshStandardMaterial color="#08555F" />
            </mesh>
            {/* Cap with Cyber Glow */}
            <mesh position={[0, 1.2, 0]}>
                <cylinderGeometry args={[0.9, 0.9, 0.4, 32]} />
                <MeshDistortMaterial color="#00F5FF" speed={2} distort={0.1} />
            </mesh>
            {/* Label */}
            <mesh position={[0, 0, 0.81]}>
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </group>
    );
};

const HeartPulse = () => {
    const mesh = useRef<THREE.Group>(null);
    useFrame((_state) => {
        const s = 1 + Math.sin(_state.clock.getElapsedTime() * 4) * 0.1;
        if (mesh.current) mesh.current.scale.set(s, s, s);
    });

    return (
        <group ref={mesh}>
            <mesh position={[-0.4, 0, 0]}>
                <sphereGeometry args={[0.7, 32, 32]} />
                <MeshDistortMaterial color="#00F5FF" speed={5} distort={0.2} />
            </mesh>
            <mesh position={[0.4, 0, 0]}>
                <sphereGeometry args={[0.7, 32, 32]} />
                <MeshDistortMaterial color="#00F5FF" speed={5} distort={0.2} />
            </mesh>
            <Torus args={[0.5, 0.1, 16, 100]} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
                <meshStandardMaterial color="#08555F" />
            </Torus>
        </group>
    );
};

const FamilyIcon = () => {
    return (
        <group>
            <mesh position={[-0.8, 0.5, 0]}>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="#08555F" />
            </mesh>
            <mesh position={[0, 0.8, 0]}>
                <sphereGeometry args={[0.6, 16, 16]} />
                <MeshDistortMaterial color="#00F5FF" speed={2} distort={0.1} />
            </mesh>
            <mesh position={[0.8, 0.3, 0]}>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial color="#D0E5EE" />
            </mesh>
            <mesh position={[0, -0.5, 0]}>
                <boxGeometry args={[2.5, 1, 0.5]} />
                <meshStandardMaterial color="#08555F" />
            </mesh>
        </group>
    );
};

const MedicalIcons3D: React.FC<{ type: 'bottle' | 'heart' | 'family', className?: string }> = ({ type, className }) => {
    return (
        <div className={`w-full h-full min-h-[150px] ${className}`}>
            <Canvas
                frameloop="demand"
                dpr={[1, 1]}
                performance={{ min: 0.5 }}
            >
                <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-transparent" />}>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                    <ambientLight intensity={0.6} />
                    <pointLight position={[5, 5, 5]} intensity={1.5} />
                    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        {type === 'bottle' && <MedicineBottle />}
                        {type === 'heart' && <HeartPulse />}
                        {type === 'family' && <FamilyIcon />}
                    </Float>
                </Suspense>
            </Canvas>
        </div>
    );
};

export default MedicalIcons3D;

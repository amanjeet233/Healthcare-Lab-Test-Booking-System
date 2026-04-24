import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, Lightformer } from '@react-three/drei';
import React, { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';

const COLORS = {
    strand1: '#8B0000', // Dark Blood Red
    strand2: '#2FA4A9', // Medical Teal
    rung: '#E2E8F0'     // Soft Slate for connectors
};

const Helix = ({ count = 60, radius = 2.8, height = 18 }) => {
    const groupRef = useRef<THREE.Group>(null);
    const strand1Ref = useRef<THREE.InstancedMesh>(null);
    const strand2Ref = useRef<THREE.InstancedMesh>(null);
    const connectorsRef = useRef<THREE.InstancedMesh>(null);

    // Bending math: x = cos(angle) * radius + bendFactor * y
    // We use a quadratic bend for a more organic, weighted feel
    const bendFactor = -0.15;

    const data = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 4; // 2 full rotations
            const y = (i / count) * height - height / 2;

            // Apply gentle leftward curve
            const offset = bendFactor * (y * y * 0.05); // Quadratic shift for organic feel

            const x1 = Math.cos(angle) * radius + offset;
            const z1 = Math.sin(angle) * radius;

            const x2 = Math.cos(angle + Math.PI) * radius + offset;
            const z2 = Math.sin(angle + Math.PI) * radius;

            temp.push({
                p1: new THREE.Vector3(x1, y, z1),
                p2: new THREE.Vector3(x2, y, z2)
            });
        }
        return temp;
    }, [count, radius, height]);

    useFrame((state) => {
        if (!groupRef.current) return;

        const t = state.clock.getElapsedTime();
        groupRef.current.rotation.y = t * 0.15; // Slower professional rotation

        const dummy = new THREE.Object3D();

        data.forEach((d, i) => {
            // Strand 1 Spheres
            dummy.position.copy(d.p1);
            dummy.scale.setScalar(1);
            dummy.quaternion.set(0, 0, 0, 1);
            dummy.updateMatrix();
            strand1Ref.current?.setMatrixAt(i, dummy.matrix);

            // Strand 2 Spheres
            dummy.position.copy(d.p2);
            dummy.updateMatrix();
            strand2Ref.current?.setMatrixAt(i, dummy.matrix);

            // Connectors (Base Pairs)
            const midPoint = new THREE.Vector3().lerpVectors(d.p1, d.p2, 0.5);
            dummy.position.copy(midPoint);

            const dir = new THREE.Vector3().subVectors(d.p2, d.p1).normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
            dummy.quaternion.copy(quaternion);
            dummy.scale.set(1, d.p1.distanceTo(d.p2), 1);
            dummy.updateMatrix();
            connectorsRef.current?.setMatrixAt(i, dummy.matrix);
        });

        if (strand1Ref.current) strand1Ref.current.instanceMatrix.needsUpdate = true;
        if (strand2Ref.current) strand2Ref.current.instanceMatrix.needsUpdate = true;
        if (connectorsRef.current) connectorsRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group ref={groupRef}>
            <instancedMesh ref={strand1Ref} args={[undefined, undefined, count]}>
                <sphereGeometry args={[0.14, 16, 16]} />
                <meshStandardMaterial color={COLORS.strand1} roughness={0.4} metalness={0.2} />
            </instancedMesh>

            <instancedMesh ref={strand2Ref} args={[undefined, undefined, count]}>
                <sphereGeometry args={[0.14, 16, 16]} />
                <meshStandardMaterial color={COLORS.strand2} roughness={0.4} metalness={0.2} />
            </instancedMesh>

            <instancedMesh ref={connectorsRef} args={[undefined, undefined, count]}>
                <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
                <meshStandardMaterial color={COLORS.rung} transparent opacity={0.2} roughness={0.5} />
            </instancedMesh>
        </group>
    );
};

const DNAHelix3D: React.FC<{ className?: string }> = React.memo(({ className }) => {
    return (
        <div className={`w-full h-full min-h-[500px] ${className}`}>
            <Canvas
                dpr={[1, 2]}
                gl={{ antialias: true, powerPreference: 'high-performance' }}
                camera={{ fov: 35, near: 0.1, far: 1000 }}
            >
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 0, 22]} />

                    <ambientLight intensity={0.4} />
                    <directionalLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
                    <pointLight position={[-10, 5, -5]} intensity={0.5} color={COLORS.strand2} />

                    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
                        <Helix count={65} radius={3.2} height={20} />
                    </Float>

                    <Environment frames={Infinity} resolution={256}>
                        {/* Soft studio light background */}
                        <mesh scale={100}>
                            <sphereGeometry args={[1, 64, 64]} />
                            <meshBasicMaterial side={THREE.BackSide} color="#0d1117" />
                        </mesh>
                        
                        {/* Key light */}
                        <Lightformer 
                            intensity={4} 
                            rotation-x={Math.PI / 2} 
                            position={[0, 5, -9]} 
                            scale={[10, 10, 1]} 
                        />
                        
                        {/* Side highlights */}
                        <Lightformer 
                            intensity={2} 
                            rotation-y={Math.PI / 2} 
                            position={[-5, 2, -1]} 
                            scale={[20, 0.5, 1]} 
                        />
                        <Lightformer 
                            intensity={2} 
                            rotation-y={-Math.PI / 2} 
                            position={[10, 1, 0]} 
                            scale={[20, 1, 1]} 
                        />
                    </Environment>
                </Suspense>
            </Canvas>
        </div>
    );
});

export default DNAHelix3D;

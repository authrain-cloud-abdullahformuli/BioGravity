"use client"

import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from 'next-themes'

// Background colors for canvas (must be explicit, not CSS variable)
const LIGHT_BG = '#f8fafc' // slate-50
const DARK_BG = '#030712' // gray-950

// Generate random graph data
const NODE_COUNT = 50
const CONNECTION_DISTANCE = 3

const generateGraph = () => {
    const nodes = new Array(NODE_COUNT).fill(0).map(() => ({
        position: new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        ),
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
        )
    }))
    return nodes
}

function Graph({ triggerImpulse, isDark }: { triggerImpulse: number; isDark: boolean }) {
    const [graphData, setGraphData] = useState<{ nodes: any[], linesGeometry: THREE.BufferGeometry } | null>(null)
    const groupRef = useRef<THREE.Group>(null)
    const linesRef = useRef<THREE.LineSegments>(null)
    const sphereRefs = useRef<(THREE.Mesh | null)[]>([])

    useEffect(() => {
        const nodes = generateGraph()
        const geometry = new THREE.BufferGeometry()
        setGraphData({ nodes, linesGeometry: geometry })
    }, [])

    const nodes = graphData?.nodes || []
    const linesGeometry = graphData?.linesGeometry

    useFrame(() => {
        if (!graphData || !linesGeometry || !groupRef.current || !linesRef.current) return

        // Impulse rotation
        if (triggerImpulse > 0) {
            groupRef.current.rotation.y += 0.02
            groupRef.current.rotation.x += 0.01
        } else {
            groupRef.current.rotation.y += 0.001
        }

        // Update nodes
        nodes.forEach((node, i) => {
            node.position.add(node.velocity)
            if (node.position.length() > 8) {
                node.velocity.negate()
            }

            // Update sphere mesh position directly
            if (sphereRefs.current[i]) {
                sphereRefs.current[i]!.position.copy(node.position)
            }
        })

        // Update connections
        const positions: number[] = []
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (nodes[i].position.distanceTo(nodes[j].position) < CONNECTION_DISTANCE) {
                    positions.push(...nodes[i].position.toArray(), ...nodes[j].position.toArray())
                }
            }
        }

        linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        linesGeometry.computeBoundingSphere()
    })

    if (!graphData || !linesGeometry) return null

    return (
        <group ref={groupRef}>
            {nodes.map((node, i) => (
                <Sphere
                    key={i}
                    args={[0.15, 16, 16]}
                    position={node.position}
                    ref={(el) => { sphereRefs.current[i] = el }}
                >
                    <meshStandardMaterial
                        color={node.color}
                        emissive={node.color}
                        emissiveIntensity={isDark ? 0.5 : 0.2}
                    />
                </Sphere>
            ))}
            <lineSegments ref={linesRef} geometry={linesGeometry}>
                <lineBasicMaterial color={isDark ? "white" : "black"} transparent opacity={0.1} />
            </lineSegments>
        </group>
    )
}
export function ThreeBackground({ triggerImpulse = 0 }: { triggerImpulse?: number }) {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch - only render theme-dependent content after mount
    useEffect(() => {
        setMounted(true)
    }, [])

    const isDark = mounted ? resolvedTheme === 'dark' : true // Default to dark during SSR
    const bgColor = isDark ? DARK_BG : LIGHT_BG

    return (
        <div className="absolute inset-0 -z-10 transition-colors duration-500" style={{ backgroundColor: bgColor }}>
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }} gl={{ alpha: false }} style={{ background: bgColor }}>
                <color attach="background" args={[bgColor]} />
                <ambientLight intensity={isDark ? 0.5 : 0.8} />
                <pointLight position={[10, 10, 10]} intensity={isDark ? 1 : 0.8} />
                <Graph triggerImpulse={triggerImpulse} isDark={isDark} />
                <OrbitControls enableZoom={false} autoRotate={false} enablePan={false} />
            </Canvas>
            <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none" />
        </div>
    )
}

"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { useRef, useEffect, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import * as d3 from "d3-force-3d"

interface GraphElement {
    id: string
    name: string
    type: string
    description: string | null
    x?: number
    y?: number
    z?: number
}

interface GraphRelationship {
    id: string
    source: string | GraphElement
    target: string | GraphElement
    type: string
}

interface PublicGraphViewProps {
    elements: GraphElement[]
    relationships: GraphRelationship[]
    isEmbed?: boolean
}

export function PublicGraphView({ elements, relationships, isEmbed }: PublicGraphViewProps) {
    return (
        <div className={isEmbed ? "w-full h-full" : "w-full h-full rounded-lg border bg-background/50"}>
            <Canvas camera={{ position: [0, 0, 150], fov: 60 }}>
                <PublicGraphScene elements={elements} relationships={relationships} />
            </Canvas>
        </div>
    )
}

function PublicGraphScene({ elements, relationships }: { elements: GraphElement[], relationships: GraphRelationship[] }) {
    // Initialize simulation
    const simulation = useMemo(() => {
        return d3.forceSimulation()
            .numDimensions(3)
            .force("link", d3.forceLink().id((d: any) => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter())
    }, [])

    useEffect(() => {
        const nodes = elements.map(e => ({ ...e }))
        const links = relationships.map(r => ({ ...r }))

        simulation
            .nodes(nodes as any)
            .force("link", d3.forceLink(links as any).id((d: any) => d.id).distance(100))
            .alpha(1)
            .restart()
    }, [elements, relationships, simulation])

    return (
        <>
            <OrbitControls makeDefault />
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00e5ff" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#ff00e5" />

            <PublicNodes simulation={simulation} elements={elements} />
            <PublicLinks simulation={simulation} relationships={relationships} />
        </>
    )
}

function PublicNodes({ simulation, elements }: { simulation: any, elements: GraphElement[] }) {
    const groupRef = useRef<THREE.Group>(null)

    useEffect(() => {
        const nodes = elements.map(e => ({ ...e }))
        simulation.nodes(nodes)
        simulation.alpha(1).restart()
        if (groupRef.current) {
            (groupRef.current as any).simNodes = nodes
        }
    }, [elements, simulation])

    useFrame(() => {
        const group = groupRef.current
        if (!group) return

        const simNodes = (group as any).simNodes || []

        group.children.forEach((mesh, i) => {
            const node = simNodes[i]
            if (node) {
                mesh.position.set(node.x || 0, node.y || 0, node.z || 0)
            }
        })
    })

    return (
        <group ref={groupRef}>
            {elements.map((el) => (
                <mesh key={el.id}>
                    <sphereGeometry args={[2, 32, 32]} />
                    <meshPhysicalMaterial
                        color={getColorForType(el.type)}
                        emissive={getColorForType(el.type)}
                        emissiveIntensity={0.6}
                        roughness={0.2}
                        metalness={0.8}
                        clearcoat={1}
                        clearcoatRoughness={0}
                    />
                </mesh>
            ))}
        </group>
    )
}

function PublicLinks({ simulation, relationships }: { simulation: any, relationships: GraphRelationship[] }) {
    const groupRef = useRef<THREE.Group>(null)

    useEffect(() => {
        const links = relationships.map(r => ({ ...r }))
        simulation.force("link").links(links)
        simulation.alpha(1).restart()
        if (groupRef.current) {
            (groupRef.current as any).simLinks = links
        }
    }, [relationships, simulation])

    useFrame(() => {
        const group = groupRef.current
        if (!group) return

        const simLinks = (group as any).simLinks || []

        group.children.forEach((line: any, i) => {
            const link = simLinks[i]
            if (link && link.source && link.target) {
                const source = link.source as GraphElement
                const target = link.target as GraphElement

                const positions = line.geometry.attributes.position.array as Float32Array
                positions[0] = source.x || 0
                positions[1] = source.y || 0
                positions[2] = source.z || 0
                positions[3] = target.x || 0
                positions[4] = target.y || 0
                positions[5] = target.z || 0
                line.geometry.attributes.position.needsUpdate = true
            }
        })
    })

    return (
        <group ref={groupRef}>
            {relationships.map((rel) => (
                <line key={rel.id}>
                    <bufferGeometry>
                        <float32BufferAttribute attach="attributes-position" count={2} itemSize={3} args={[new Float32Array(6), 3]} />
                    </bufferGeometry>
                    <lineBasicMaterial color="#00e5ff" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
                </line>
            ))}
        </group>
    )
}

function getColorForType(type: string) {
    if (type === 'Person') return '#00e5ff'
    if (type === 'Event') return '#ff00e5'
    if (type === 'Location') return '#bd00ff'
    return '#00ff99'
}

"use client"

import "@/lib/webgpu-polyfill"
import React, { useCallback, useRef, useEffect, useState, useMemo, useDeferredValue, forwardRef, useImperativeHandle } from 'react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import * as THREE from 'three'
import SpriteText from 'three-spritetext'
import { useGraphStore, GraphElement, GraphRelationship } from '@/store/use-graph-store'
import { GraphContextMenu } from './graph-context-menu'
import { LinkDragOverlay } from './link-drag-overlay'
import { LinkCreationIndicator } from './link-creation-indicator'
import { RelationshipTypeModal } from './relationship-type-modal'
import { NodeEditModal } from './node-edit-modal'
import { GraphScene2D } from './graph-scene-2d'
import { useGraphForces } from './use-graph-forces'
import { useGraphInteractions } from './use-graph-interactions'
import { getColorForType, getColorForEdgeType } from '@/lib/graph-utils'
import { HelpCircle } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

// Dynamic import to avoid SSR issues with WebGL
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center"><span className="text-white/50">Loading graph...</span></div>
})

// Helper function to get nodes within N degrees of separation
function getNodesWithinDegrees(
    startNodeId: string,
    relationships: GraphRelationship[],
    degrees: number
): Set<string> {
    const visited = new Set<string>([startNodeId])
    let frontier = new Set<string>([startNodeId])

    for (let d = 0; d < degrees; d++) {
        const nextFrontier = new Set<string>()
        relationships.forEach(rel => {
            const sourceId = typeof rel.source === 'string' ? rel.source : (rel.source as GraphElement).id
            const targetId = typeof rel.target === 'string' ? rel.target : (rel.target as GraphElement).id

            if (frontier.has(sourceId) && !visited.has(targetId)) {
                nextFrontier.add(targetId)
                visited.add(targetId)
            }
            if (frontier.has(targetId) && !visited.has(sourceId)) {
                nextFrontier.add(sourceId)
                visited.add(sourceId)
            }
        })
        frontier = nextFrontier
    }

    return visited
}


interface LegendProps {
    isDarkMode: boolean
    elementTypes: any[]
    relationshipTypes: any[]
    onHelpClick: () => void
}

function GraphLegend({ isDarkMode, elementTypes, relationshipTypes, onHelpClick }: LegendProps) {
    if (elementTypes.length === 0 && relationshipTypes.length === 0) return null

    return (
        <div className={`absolute bottom-4 left-4 p-4 rounded-xl backdrop-blur-md border ${isDarkMode ? 'bg-black/40 border-slate-800' : 'bg-white/60 border-slate-200'
            } z-20 pointer-events-auto max-h-[40vh] overflow-y-auto thin-scrollbar min-w-[200px]`}>
            <button
                onClick={onHelpClick}
                className={`absolute top-3 right-3 p-1.5 rounded-lg transition-colors ${isDarkMode
                    ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                title="Help & Instructions"
            >
                <HelpCircle size={16} />
            </button>
            <div className="space-y-4">
                {elementTypes.length > 0 && (
                    <div>
                        <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nodes</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {elementTypes.map(type => (
                                <div key={type.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color || getColorForType(type.name, isDarkMode, elementTypes) }}></div>
                                    <span className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{type.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {relationshipTypes.length > 0 && (
                    <div>
                        <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Relationships</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {relationshipTypes.map(type => (
                                <div key={type.name} className="flex items-center gap-2">
                                    <div className="w-4 h-0.5" style={{ backgroundColor: type.color || getColorForEdgeType(type.name, isDarkMode, relationshipTypes) }}></div>
                                    <span className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{type.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

interface GraphSceneProps {
    theme?: string
    canEdit?: boolean
}

export interface GraphSceneRef {
    openEditModal: () => void
}

export const GraphScene = forwardRef<GraphSceneRef, GraphSceneProps>(function GraphScene({ theme = 'dark', canEdit = false }, ref) {
    const {
        elements,
        relationships,
        is2D,
        searchQuery,
        selectedTypeFilter,
        physics,
        focusMode,
        focusDegrees,
        selectedNodeId,
        showLabels,
        nodeSize,
        generationalOrdering,
        generationalStrength,
        setSelectedNode,
        setGraphRef,
        elementTypes,
        relationshipTypes,
        linkCreationMode,
        setLinkCreationSource,
        completeLinkCreation,
        cancelLinkCreation,
        addRelationship,
        fetchGraphData,
        updateElement
    } = useGraphStore()

    const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
    const [isReady, setIsReady] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const graphRef = useRef<any>(null)
    const textureCache = useRef<Record<string, THREE.Texture>>({})
    const routeParams = useParams<{ id: string }>()
    const projectId = routeParams?.id ?? ''

    const isDarkMode = theme === 'dark'

    // Initialize forces hook
    useGraphForces({
        graphRef,
        physics,
        generationalOrdering,
        generationalStrength,
        elements,
        relationshipTypes
    })

    // Initialize interactions hook
    const {
        contextMenu, setContextMenu,
        linkDrag, setLinkDrag,
        linkTarget, setLinkTarget,
        relationshipTypeModalOpen,
        pendingRelationship,
        nodeEditModalOpen, setNodeEditModalOpen,
        nodeBeingEdited, setNodeBeingEdited,
        helpModalOpen, setHelpModalOpen,
        handleNodeClick,
        handleNodeRightClick,
        handleBackgroundClick,
        handleBackgroundRightClick,
        handleRelationshipTypeConfirm,
        handleRelationshipTypeCancel,
        handleNodeEditSave,
        handleNodeEditClose
    } = useGraphInteractions({
        graphRef,
        canEdit,
        elements,
        relationships,
        linkCreationMode,
        setSelectedNode,
        setLinkCreationSource,
        completeLinkCreation,
        cancelLinkCreation,
        addRelationship,
        fetchGraphData,
        updateElement,
        is2D
    })

    // Sync ref with store
    useEffect(() => {
        if (isReady) {
            // Need a slight delay to ensure ForceGraph3D has populated the ref
            const timer = setTimeout(() => {
                if (graphRef.current) {
                    setGraphRef(graphRef.current)
                }
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [isReady, setGraphRef])

    // Deferred initialization to prevent browser timeouts on heavy 3D rendering
    useEffect(() => {
        const timer = requestAnimationFrame(() => {
            setIsReady(true)
        })
        return () => cancelAnimationFrame(timer)
    }, [])

    // Handle resize
    useEffect(() => {
        const updateDims = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                })
            }
        }
        window.addEventListener('resize', updateDims)
        updateDims()
        return () => window.removeEventListener('resize', updateDims)
    }, [])

    // Release every cached GPU texture on unmount. Also evict textures whose
    // imageUrl is no longer referenced by any current element — otherwise
    // editing/removing images leaks GPU memory.
    useEffect(() => {
        const live = new Set(elements.map(e => e.imageUrl).filter(Boolean) as string[])
        const cache = textureCache.current
        for (const url of Object.keys(cache)) {
            if (!live.has(url)) {
                cache[url].dispose()
                delete cache[url]
            }
        }
    }, [elements])

    useEffect(() => {
        const cache = textureCache.current
        return () => {
            for (const tex of Object.values(cache)) tex.dispose()
        }
    }, [])

    // Defer searchQuery for downstream filters so typing fast doesn't recompute
    // the filtered graph on every keystroke.
    const deferredSearchQuery = useDeferredValue(searchQuery)


    // Filter elements based on search, type, and focus mode. Uses the deferred
    // search query so fast typing doesn't block on full-graph recomputation.
    const filteredElements = useMemo(() => {
        let filtered = elements

        if (deferredSearchQuery || selectedTypeFilter) {
            const q = deferredSearchQuery.toLowerCase()
            filtered = elements.filter(el => {
                const matchesSearch = !deferredSearchQuery ||
                    el.name.toLowerCase().includes(q) ||
                    el.type.toLowerCase().includes(q) ||
                    (el.description && el.description.toLowerCase().includes(q))

                const matchesType = !selectedTypeFilter || el.type === selectedTypeFilter

                return matchesSearch && matchesType
            })
        }

        if (focusMode && selectedNodeId) {
            const visibleNodes = getNodesWithinDegrees(selectedNodeId, relationships, focusDegrees)
            filtered = filtered.filter(el => visibleNodes.has(el.id))
        }

        return filtered
    }, [elements, deferredSearchQuery, selectedTypeFilter, focusMode, selectedNodeId, focusDegrees, relationships])

    // Filter relationships
    const filteredRelationships = useMemo(() => {
        if (!deferredSearchQuery && !selectedTypeFilter && !focusMode) return relationships

        const elementIds = new Set(filteredElements.map(e => e.id))
        return relationships.filter(rel => {
            const sourceId = typeof rel.source === 'string' ? rel.source : (rel.source as GraphElement).id
            const targetId = typeof rel.target === 'string' ? rel.target : (rel.target as GraphElement).id
            return elementIds.has(sourceId) && elementIds.has(targetId)
        })
    }, [relationships, filteredElements, deferredSearchQuery, selectedTypeFilter, focusMode])

    // Graph data
    const graphData = useMemo(() => ({
        nodes: filteredElements.map(e => ({ ...e })),
        links: filteredRelationships
            .filter(r => {
                // Filter out malformed relationships
                const sourceId = typeof r.source === 'string' ? r.source : (r.source as GraphElement)?.id
                const targetId = typeof r.target === 'string' ? r.target : (r.target as GraphElement)?.id
                return sourceId && targetId
            })
            .map(r => ({
                ...r,
                source: typeof r.source === 'string' ? r.source : (r.source as GraphElement)?.id,
                target: typeof r.target === 'string' ? r.target : (r.target as GraphElement)?.id
            }))
    }), [filteredElements, filteredRelationships])

    // Node rendering
    const nodeThreeObject = useCallback((node: any) => {
        const group = new THREE.Group()

        // Ensure we have valid node data
        if (!node || !node.id) return group

        const color = getColorForType(node.type || 'Person', isDarkMode, elementTypes) || '#00ff99'
        const isSourceNode = linkCreationMode.isActive && linkCreationMode.sourceNodeId === node.id
        const isSelected = selectedNodeId === node.id
        const radius = (isSelected || isSourceNode ? 5 : 3) * nodeSize

        // Main sphere
        const geometry = new THREE.SphereGeometry(radius, 32, 32)

        let material: THREE.Material
        if (node.imageUrl) {
            let texture = textureCache.current[node.imageUrl]
            if (!texture) {
                texture = new THREE.TextureLoader().load(node.imageUrl)
                texture.colorSpace = THREE.SRGBColorSpace
                textureCache.current[node.imageUrl] = texture
            }
            material = new THREE.MeshBasicMaterial({
                map: texture,
                color: isSelected ? '#ffffff' : '#cccccc'
            })
        } else {
            const finalColor = isSelected ? '#ffffff' : (isSourceNode ? '#3b82f6' : color)
            material = new THREE.MeshPhysicalMaterial({
                color: finalColor,
                emissive: finalColor,
                emissiveIntensity: isSelected ? 1 : (isSourceNode ? 0.8 : (isDarkMode ? 0.6 : 0.4)),
                roughness: 0.2,
                metalness: 0.8,
                clearcoat: 1,
                clearcoatRoughness: 0
            })
        }

        const sphere = new THREE.Mesh(geometry, material)

        // Ensure texture faces forward correctly
        if (node.imageUrl) {
            sphere.rotation.y = -Math.PI / 2
        }

        group.add(sphere)

        // Selection highlight ring or source node indicator
        if (isSelected || isSourceNode) {
            const highlightColor = isSourceNode ? '#0ea5e9' : '#22d3ee'
            const highlightGeo = new THREE.TorusGeometry(radius * 1.5, 0.3, 16, 32)
            const highlightMat = new THREE.MeshBasicMaterial({
                color: highlightColor,
                transparent: true,
                opacity: isSourceNode ? 1 : 0.7
            })
            const highlight = new THREE.Mesh(highlightGeo, highlightMat)
            highlight.rotation.x = Math.PI / 2
            group.add(highlight)

            // Add pulsing animation for source node
            if (isSourceNode) {
                const pulseGeo = new THREE.TorusGeometry(radius * 2, 0.2, 16, 32)
                const pulseMat = new THREE.MeshBasicMaterial({
                    color: '#0ea5e9',
                    transparent: true,
                    opacity: 0.4
                })
                const pulse = new THREE.Mesh(pulseGeo, pulseMat)
                pulse.rotation.x = Math.PI / 2
                group.add(pulse)
            }
        }

        // Label
        if (showLabels) {
            const sprite = new SpriteText(node.name)
            sprite.color = selectedNodeId === node.id ? '#22d3ee' : (isDarkMode ? '#e2e8f0' : '#334155')
            sprite.textHeight = 3

            // Enhance text quality significantly
            // @ts-expect-error three-spritetext exposes resolution at runtime.
            sprite.resolution = 4
            sprite.material.depthWrite = false

            sprite.position.set(0, -(radius + 3 * nodeSize), 0)
            group.add(sprite)
        }

        // Pinned Indicator
        if (node.pinned) {
            const pinGeo = new THREE.SphereGeometry(radius * 0.3, 16, 16)
            const pinMat = new THREE.MeshBasicMaterial({ color: '#facc15' }) // Yellow
            const pin = new THREE.Mesh(pinGeo, pinMat)
            pin.position.set(radius, radius, 0)
            group.add(pin)
        }

        return group
    }, [selectedNodeId, isDarkMode, showLabels, nodeSize, elementTypes, linkCreationMode])



    // Handle opening edit modal for selected node from details panel
    const handleOpenEditModal = useCallback(() => {
        const selectedNode = elements.find(el => el.id === selectedNodeId)
        if (selectedNode) {
            setNodeBeingEdited(selectedNode)
            setNodeEditModalOpen(true)
        }
    }, [selectedNodeId, elements, setNodeBeingEdited, setNodeEditModalOpen])

    // Expose the edit modal handler through ref
    useImperativeHandle(ref, () => ({
        openEditModal: handleOpenEditModal,
    }), [handleOpenEditModal])

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden graph-container"
            onContextMenu={(e) => canEdit && e.preventDefault()}
        >
            <ScreenshotHandler />
            {elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <div className="text-center opacity-30">
                        <h3 className={`text-4xl font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`}>BioGravity</h3>
                        <p className="text-slate-400 mt-2">Add elements to visualize your graph</p>
                    </div>
                </div>
            )}
            {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Initializing graph...</p>
                    </div>
                </div>
            )}
            {isReady && (
                is2D ? (
                    <GraphScene2D
                        isDarkMode={isDarkMode}
                        canEdit={canEdit}
                        dimensions={dimensions}
                    />
                ) : (
                    <ForceGraph3D
                        ref={graphRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        graphData={graphData}
                        nodeThreeObject={nodeThreeObject}
                        onNodeClick={handleNodeClick}
                        onNodeRightClick={handleNodeRightClick}
                        onBackgroundClick={handleBackgroundClick}
                        onBackgroundRightClick={handleBackgroundRightClick}
                        backgroundColor={isDarkMode ? "#030712" : "#f8fafc"}
                        linkColor={(link: any) => getColorForEdgeType(link.type, isDarkMode, relationshipTypes)}
                        linkOpacity={0.3}
                        linkWidth={(link: any) => {
                            const t = relationshipTypes.find((config: any) => config.name === link.type)
                            const mult = t && t.strength ? t.strength : 1
                            return 1.5 * mult
                        }}
                        controlType="orbit"
                        enableNodeDrag={true}
                        numDimensions={3} // Always 3 for ForceGraph3D now
                        cooldownTicks={100}
                        warmupTicks={50}
                        d3VelocityDecay={0.4}
                        rendererConfig={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
                    />
                )
            )}
            <GraphLegend
                isDarkMode={isDarkMode}
                elementTypes={elementTypes}
                relationshipTypes={relationshipTypes}
                onHelpClick={() => setHelpModalOpen(true)}
            />

            {/* Help Instructions Modal */}
            <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
                <DialogContent className={`${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-slate-900'} sm:max-w-[450px]`}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-primary" />
                            Graph Instructions
                        </DialogTitle>
                        <DialogDescription className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                            Learn how to navigate and edit the BioGravity graph.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <section className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px]">1</span>
                                Creating Nodes
                            </h4>
                            <ul className="text-sm space-y-1 list-disc list-inside pl-7 text-muted-foreground">
                                <li><strong>Right-click</strong> on the graph background.</li>
                                <li>Or press the <strong>&apos;N&apos;</strong> key on your keyboard.</li>
                                <li>Fill in the details in the popup to place a new node.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px]">2</span>
                                Linking Nodes
                            </h4>
                            <p className="text-sm pl-7 text-muted-foreground">There are two ways to create relationships:</p>
                            <ul className="text-sm space-y-1 list-disc list-inside pl-7 text-muted-foreground">
                                <li><strong>Right-click Method:</strong> Right-click the source node, then right-click the target node.</li>
                                <li><strong>Shift-Click Method:</strong> Hold <strong>Shift</strong> and click a node, then drag to another node.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px]">3</span>
                                Navigation
                            </h4>
                            <ul className="text-sm space-y-1 list-disc list-inside pl-7 text-muted-foreground">
                                <li><strong>Left-click</strong> a node to select and view details.</li>
                                <li><strong>Left-click & Drag</strong> the background to rotate (3D) or pan (2D).</li>
                                <li><strong>Scroll</strong> to zoom in and out.</li>
                            </ul>
                        </section>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Link Creation Indicator */}
            <LinkCreationIndicator />

            {/* Context Menu for creating nodes */}
            {contextMenu && (
                <GraphContextMenu
                    visible={contextMenu.visible}
                    position={contextMenu.position}
                    worldPosition={contextMenu.worldPosition}
                    projectId={projectId}
                    onClose={() => setContextMenu(null)}
                />
            )}

            {/* Node Edit Modal */}
            <NodeEditModal
                open={nodeEditModalOpen}
                node={nodeBeingEdited}
                elementTypes={elementTypes}
                onSave={handleNodeEditSave}
                onClose={handleNodeEditClose}
            />

            {/* Relationship Type Modal */}
            {pendingRelationship && (
                <RelationshipTypeModal
                    open={relationshipTypeModalOpen}
                    sourceNodeName={pendingRelationship.sourceNodeName}
                    targetNodeName={pendingRelationship.targetNodeName}
                    relationshipTypes={relationshipTypes}
                    onConfirm={handleRelationshipTypeConfirm}
                    onCancel={handleRelationshipTypeCancel}
                />
            )}

            {/* Link Drag Overlay for creating relationships */}
            {linkTarget && (
                <LinkDragOverlay
                    active={true}
                    sourceNode={linkDrag?.sourceNode || null}
                    targetNode={linkTarget}
                    projectId={projectId}
                    onComplete={() => {
                        setLinkDrag(null)
                        setLinkTarget(null)
                    }}
                />
            )}
        </div>
    )
})

// Effect for screenshot
import { useTheme } from "next-themes"

export function ScreenshotHandler() {
    const { triggerScreenshot, setTriggerScreenshot, graphRef } = useGraphStore()
    const { resolvedTheme } = useTheme()
    const isDarkMode = resolvedTheme === 'dark'

    useEffect(() => {
        if (triggerScreenshot) {
            console.log('Screenshot trigger detected')
            const capture = async () => {
                const element = document.querySelector('.graph-container') as HTMLElement
                console.log('Container element:', element)

                if (!element) {
                    console.error('graph-container element not found')
                    setTriggerScreenshot(false)
                    return
                }

                // Temporary increase WebGL resolution for ultra-sharp screenshots
                let originalPixelRatio = window.devicePixelRatio || 1;
                const highResPixelRatio = 4; // High resolution captures

                try {
                    if (graphRef && typeof graphRef.renderer === 'function') {
                        const renderer = graphRef.renderer()
                        const scene = graphRef.scene()
                        const camera = graphRef.camera()

                        if (renderer && scene && camera) {
                            originalPixelRatio = renderer.getPixelRatio()
                            renderer.setPixelRatio(highResPixelRatio)
                            renderer.render(scene, camera)
                        } else {
                            console.warn('WebGL components not ready for high-res render')
                        }
                    }
                } catch (e) {
                    console.error('Error scaling up WebGL renderer:', e)
                }

                try {
                    console.log('Importing html-to-image...')
                    const { toPng } = await import('html-to-image')

                    console.log('Capturing canvas with html-to-image...')
                    // html-to-image uses the browser's native SVG <foreignObject> rendering,
                    // which flawlessly handles modern CSS like oklch or lab without parsing errors.
                    const dataUrl = await toPng(element, {
                        backgroundColor: isDarkMode ? '#030712' : '#f8fafc',
                        pixelRatio: highResPixelRatio, // Match the graph resolution
                        style: {
                            // Ensure the element doesn't shift during capture
                            transform: 'scale(1)',
                            transformOrigin: 'top left'
                        }
                    })
                    console.log('Canvas captured successfully')

                    const link = document.createElement('a')
                    const date = new Date().toISOString().split('T')[0]
                    const time = new Date().toLocaleTimeString().replace(/:/g, '-')
                    link.download = `biogravity-graph-${date}-${time}.png`
                    link.href = dataUrl
                    console.log('Downloading image...')
                    link.click()
                } catch (err) {
                    console.error('Screenshot failed:', err)
                } finally {
                    try {
                        // Restore original resolution
                        if (graphRef && typeof graphRef.renderer === 'function') {
                            const renderer = graphRef.renderer()
                            const scene = graphRef.scene()
                            const camera = graphRef.camera()

                            if (renderer && scene && camera) {
                                renderer.setPixelRatio(originalPixelRatio)
                                renderer.render(scene, camera)
                            }
                        }
                    } catch (e) {
                        console.error('Error restoring WebGL renderer:', e)
                    }

                    setTriggerScreenshot(false)
                }
            }
            capture()
        }
    }, [triggerScreenshot, setTriggerScreenshot, isDarkMode, graphRef])

    return null
}

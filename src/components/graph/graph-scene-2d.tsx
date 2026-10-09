"use client"

import React, { useCallback, useRef, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useGraphStore } from '@/store/use-graph-store'
import { useGraphForces } from './use-graph-forces'
import { useGraphInteractions } from './use-graph-interactions'
import { getColorForType, getColorForEdgeType } from '@/lib/graph-utils'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center"><span className="text-white/50">Loading 2D graph...</span></div>
})

interface GraphScene2DProps {
    isDarkMode: boolean
    canEdit: boolean
    dimensions: { width: number; height: number }
}

export function GraphScene2D({ isDarkMode, canEdit, dimensions }: GraphScene2DProps) {
    const {
        elements,
        relationships,
        searchQuery,
        selectedTypeFilter,
        physics,
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

    const graphRef = useRef<any>(null)
    const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())

    // Filter elements logic (shared with 3D, but redefined here for simplicity in this component)
    // In a real refactor, this could also be a hook if it gets complex.
    const filteredElements = useMemo(() => {
        let filtered = elements
        if (searchQuery || selectedTypeFilter) {
            filtered = elements.filter(el => {
                const matchesSearch = !searchQuery ||
                    el.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    el.type.toLowerCase().includes(searchQuery.toLowerCase())
                const matchesType = !selectedTypeFilter || el.type === selectedTypeFilter
                return matchesSearch && matchesType
            })
        }
        return filtered
    }, [elements, searchQuery, selectedTypeFilter])

    const filteredRelationships = useMemo(() => {
        const elementIds = new Set(filteredElements.map(e => e.id))
        return relationships.filter(rel => {
            const sourceId = typeof rel.source === 'string' ? rel.source : (rel.source as any).id
            const targetId = typeof rel.target === 'string' ? rel.target : (rel.target as any).id
            return elementIds.has(sourceId) && elementIds.has(targetId)
        })
    }, [relationships, filteredElements])

    const graphData = useMemo(() => ({
        nodes: filteredElements.map(e => ({ ...e })),
        links: filteredRelationships.map(r => ({
            ...r,
            source: typeof r.source === 'string' ? r.source : (r.source as any).id,
            target: typeof r.target === 'string' ? r.target : (r.target as any).id
        }))
    }), [filteredElements, filteredRelationships])

    // Use shared hooks
    useGraphForces({
        graphRef,
        physics,
        generationalOrdering,
        generationalStrength,
        elements,
        relationshipTypes
    })

    const {
        handleNodeClick,
        handleNodeRightClick,
        handleBackgroundClick,
        handleBackgroundRightClick
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
        is2D: true
    })

    // Sync ref with store
    useEffect(() => {
        if (graphRef.current) {
            setGraphRef(graphRef.current)
        }
    }, [setGraphRef])

    // Node rendering
    const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const isSelected = selectedNodeId === node.id
        const isSourceNode = linkCreationMode.isActive && linkCreationMode.sourceNodeId === node.id
        const baseSize = (isSelected || isSourceNode ? 8 : 5) * nodeSize
        const radius = baseSize / 2

        // 1. Draw main circle
        const color = getColorForType(node.type || 'Person', isDarkMode, elementTypes)
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false)

        // Handle image if available
        if (node.imageUrl) {
            let img = imageCache.current.get(node.imageUrl)
            if (!img) {
                img = new Image()
                img.src = node.imageUrl
                img.onload = () => {
                    imageCache.current.set(node.imageUrl!, img!)
                }
            }

            if (img.complete && img.naturalWidth !== 0) {
                ctx.save()
                ctx.clip()
                ctx.drawImage(img, node.x - radius, node.y - radius, radius * 2, radius * 2)
                ctx.restore()
            } else {
                ctx.fillStyle = color
                ctx.fill()
            }
        } else {
            ctx.fillStyle = color
            ctx.fill()
        }

        // 2. Clearer border
        ctx.strokeStyle = isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
        ctx.lineWidth = 1 / globalScale
        ctx.stroke()

        // 3. Selection highlight
        if (isSelected || isSourceNode) {
            ctx.beginPath()
            ctx.arc(node.x, node.y, radius + 2 / globalScale, 0, 2 * Math.PI, false)
            ctx.strokeStyle = isSourceNode ? '#3b82f6' : '#22d3ee'
            ctx.lineWidth = 2 / globalScale
            ctx.stroke()

            if (isSourceNode) {
                // Pulse effect (simplified for now)
                ctx.beginPath()
                ctx.arc(node.x, node.y, radius + 4 / globalScale, 0, 2 * Math.PI, false)
                ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'
                ctx.stroke()
            }
        }

        // 4. Pinned badge
        if (node.pinned) {
            ctx.beginPath()
            ctx.arc(node.x + radius * 0.7, node.y - radius * 0.7, radius * 0.3, 0, 2 * Math.PI, false)
            ctx.fillStyle = '#facc15'
            ctx.fill()
        }

        // 5. Labels
        if (showLabels) {
            const label = node.name
            const fontSize = 12 / globalScale
            ctx.font = `${fontSize}px Inter, system-ui, sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillStyle = isSelected ? '#22d3ee' : (isDarkMode ? '#e2e8f0' : '#334155')
            ctx.fillText(label, node.x, node.y + radius + 2 / globalScale)
        }
    }, [selectedNodeId, isDarkMode, showLabels, nodeSize, elementTypes, linkCreationMode])

    const nodePointerAreaPaint = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
        const isSelected = selectedNodeId === node.id
        const isSourceNode = linkCreationMode.isActive && linkCreationMode.sourceNodeId === node.id
        const radius = ((isSelected || isSourceNode ? 8 : 5) * nodeSize) / 2
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false)
        ctx.fill()
    }, [selectedNodeId, nodeSize, linkCreationMode])

    return (
        <ForceGraph2D
            ref={graphRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeCanvasObject={nodeCanvasObject}
            nodePointerAreaPaint={nodePointerAreaPaint}
            onNodeClick={handleNodeClick}
            onNodeRightClick={handleNodeRightClick}
            onBackgroundClick={handleBackgroundClick}
            onBackgroundRightClick={handleBackgroundRightClick}
            backgroundColor={isDarkMode ? "#030712" : "#f8fafc"}
            linkColor={(link: any) => {
                const color = getColorForEdgeType(link.type, isDarkMode, relationshipTypes)
                // Convert hex to rgba for opacity
                if (color.startsWith('#')) {
                    const r = parseInt(color.slice(1, 3), 16)
                    const g = parseInt(color.slice(3, 5), 16)
                    const b = parseInt(color.slice(5, 7), 16)
                    return `rgba(${r}, ${g}, ${b}, 0.4)`
                }
                return color
            }}
            linkWidth={(link: any) => {
                const t = relationshipTypes.find((config: any) => config.name === link.type)
                const mult = t && t.strength ? t.strength : 1
                return 2 * mult
            }}
            enableNodeDrag={true}
            cooldownTicks={100}
            warmupTicks={50}
            d3VelocityDecay={0.4}
        />
    )
}

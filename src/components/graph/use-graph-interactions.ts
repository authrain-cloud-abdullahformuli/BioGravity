import { useState, useCallback, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { GraphElement, GraphRelationship } from '@/store/use-graph-store'
import { validateLinkCreation, isLinkCreationTimedOut } from '@/lib/linkCreationManager'

interface UseGraphInteractionsProps {
    graphRef: React.MutableRefObject<any>
    canEdit: boolean
    elements: GraphElement[]
    relationships: GraphRelationship[]
    linkCreationMode: { isActive: boolean; sourceNodeId: string | null; timestamp: number }
    setSelectedNode: (id: string | null) => void
    setLinkCreationSource: (id: string) => void
    completeLinkCreation: () => void
    cancelLinkCreation: () => void
    addRelationship: (projectId: string, rel: any) => Promise<any>
    fetchGraphData: (projectId: string) => Promise<any>
    updateElement: (id: string, projectId: string, updates: Partial<GraphElement>) => Promise<any>
    is2D: boolean
}

export function useGraphInteractions({
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
}: UseGraphInteractionsProps) {
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; position: { x: number; y: number }; worldPosition: { x: number; y: number; z: number } } | null>(null)
    const [linkDrag, setLinkDrag] = useState<{ sourceNode: GraphElement } | null>(null)
    const [linkTarget, setLinkTarget] = useState<GraphElement | null>(null)
    const [relationshipTypeModalOpen, setRelationshipTypeModalOpen] = useState(false)
    const [pendingRelationship, setPendingRelationship] = useState<{ sourceNodeId: string; targetNodeId: string; sourceNodeName: string; targetNodeName: string } | null>(null)
    const [nodeEditModalOpen, setNodeEditModalOpen] = useState(false)
    const [nodeBeingEdited, setNodeBeingEdited] = useState<GraphElement | null>(null)
    const [helpModalOpen, setHelpModalOpen] = useState(false)
    const params = useParams<{ id: string }>()
    const projectId = params?.id ?? ''

    const zoomToNode = useCallback((node: any) => {
        if (!graphRef.current) return

        if (is2D) {
            graphRef.current.centerAt(node.x, node.y, 1000)
            graphRef.current.zoom(2, 1000)
        } else {
            const distance = 100
            const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0)
            graphRef.current.cameraPosition(
                { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
                node,
                1000
            )
        }
    }, [graphRef, is2D])

    const handleNodeClick = useCallback((node: any, event: MouseEvent) => {
        if (!node || !node.id) return

        // Handle shift+click for linking
        if (canEdit && event.shiftKey) {
            if (!linkDrag) {
                setLinkDrag({ sourceNode: node })
                return
            } else if (linkDrag) {
                setLinkTarget(node)
                return
            }
        }

        setSelectedNode(node.id as string)
        zoomToNode(node)
    }, [setSelectedNode, canEdit, linkDrag, zoomToNode])

    const handleNodeRightClick = useCallback(async (node: any, event: MouseEvent) => {
        if (!node || !node.id || !canEdit) return

        event.preventDefault?.()

        if (linkCreationMode.isActive && isLinkCreationTimedOut(linkCreationMode.timestamp)) {
            cancelLinkCreation()
            return
        }

        if (!linkCreationMode.isActive) {
            setLinkCreationSource(node.id)
            return
        }

        if (linkCreationMode.sourceNodeId && linkCreationMode.sourceNodeId !== node.id) {
            const validation = validateLinkCreation(linkCreationMode.sourceNodeId, node.id, {
                elements,
                relationships
            })

            if (!validation.valid) {
                console.warn('Link creation validation failed:', validation.error)
                cancelLinkCreation()
                return
            }

            const sourceNode = elements.find(el => el.id === linkCreationMode.sourceNodeId)
            const targetNode = elements.find(el => el.id === node.id)

            if (sourceNode && targetNode) {
                setPendingRelationship({
                    sourceNodeId: linkCreationMode.sourceNodeId,
                    targetNodeId: node.id,
                    sourceNodeName: sourceNode.name,
                    targetNodeName: targetNode.name
                })
                setRelationshipTypeModalOpen(true)
            } else {
                cancelLinkCreation()
            }
            return
        }

        cancelLinkCreation()
    }, [canEdit, linkCreationMode, elements, relationships, setLinkCreationSource, cancelLinkCreation])

    const handleBackgroundClick = useCallback(() => {
        setSelectedNode(null)
    }, [setSelectedNode])

    const handleBackgroundRightClick = useCallback((event: MouseEvent) => {
        if (!canEdit) return
        event.preventDefault?.()
        if (linkCreationMode.isActive) {
            cancelLinkCreation()
        }

        let worldPos = { x: 0, y: 0, z: 0 }
        if (graphRef.current) {
            if (is2D && typeof graphRef.current.screen2GraphCoords === 'function') {
                const { x, y } = graphRef.current.screen2GraphCoords(event.clientX, event.clientY)
                worldPos = { x, y, z: 0 }
            } else if (!is2D) {
                // In 3D, the graphInstance is passed as contextMenu.worldPosition placeholder for now
                // but the Menu handles it via graphRef usually.
                // However, let's keep it consistent.
            }
        }

        setContextMenu({
            visible: true,
            position: { x: event.clientX || 0, y: event.clientY || 0 },
            worldPosition: worldPos
        })
    }, [canEdit, linkCreationMode, cancelLinkCreation, graphRef, is2D])

    const handleRelationshipTypeConfirm = useCallback(async (relationshipType: string) => {
        if (!pendingRelationship) return

        try {
            const result = await addRelationship(projectId, {
                fromId: pendingRelationship.sourceNodeId,
                toId: pendingRelationship.targetNodeId,
                type: relationshipType
            })

            if (result) {
                await fetchGraphData(projectId)
                completeLinkCreation()
            } else {
                cancelLinkCreation()
            }
        } catch (error) {
            console.error('Failed to create relationship:', error)
            cancelLinkCreation()
        } finally {
            setRelationshipTypeModalOpen(false)
            setPendingRelationship(null)
        }
    }, [pendingRelationship, addRelationship, completeLinkCreation, cancelLinkCreation, fetchGraphData, projectId])

    const handleRelationshipTypeCancel = useCallback(() => {
        setRelationshipTypeModalOpen(false)
        setPendingRelationship(null)
        cancelLinkCreation()
    }, [cancelLinkCreation])

    const handleNodeEditSave = useCallback(async (nodeId: string, updates: Partial<GraphElement>) => {
        try {
            await updateElement(nodeId, projectId, updates)
            await fetchGraphData(projectId)
            setNodeEditModalOpen(false)
            setNodeBeingEdited(null)
        } catch (error) {
            console.error('Error updating node:', error)
        }
    }, [updateElement, fetchGraphData, projectId])

    const handleNodeEditClose = useCallback(() => {
        setNodeEditModalOpen(false)
        setNodeBeingEdited(null)
    }, [])

    const openEditModal = useCallback(() => {
        // This needs to know which node is selected if its generic
        // But usually it's used for the current selected node
    }, [])

    // Keyboard shortcuts
    useEffect(() => {
        if (!canEdit) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

            if (e.key === 'n' || e.key === 'N') {
                setContextMenu({
                    visible: true,
                    position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
                    worldPosition: { x: 0, y: 0, z: 0 }
                })
            }
            if (e.key === 'Escape') {
                setContextMenu(null)
                setLinkDrag(null)
                setLinkTarget(null)
                if (linkCreationMode.isActive) {
                    cancelLinkCreation()
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [canEdit, linkCreationMode, cancelLinkCreation])

    return {
        contextMenu, setContextMenu,
        linkDrag, setLinkDrag,
        linkTarget, setLinkTarget,
        relationshipTypeModalOpen, setRelationshipTypeModalOpen,
        pendingRelationship, setPendingRelationship,
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
        handleNodeEditClose,
        openEditModal
    }
}

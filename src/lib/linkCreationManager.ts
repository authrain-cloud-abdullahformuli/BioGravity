/**
 * Link Creation Manager
 * Handles the business logic for creating links between graph nodes
 */

import { GraphElement, GraphRelationship } from '@/store/use-graph-store'

export interface LinkCreationContext {
    elements: GraphElement[]
    relationships: GraphRelationship[]
}

/**
 * Validate if a link can be created between two nodes
 * @param sourceId - Source node ID
 * @param targetId - Target node ID
 * @param context - Graph context with elements and relationships
 * @returns { valid: boolean, error?: string }
 */
export function validateLinkCreation(
    sourceId: string,
    targetId: string,
    context: LinkCreationContext
): { valid: boolean; error?: string } {
    // Prevent self-links
    if (sourceId === targetId) {
        return { valid: false, error: 'Cannot create a link from a node to itself' }
    }

    // Check if both nodes exist
    const sourceExists = context.elements.some(el => el.id === sourceId)
    const targetExists = context.elements.some(el => el.id === targetId)

    if (!sourceExists || !targetExists) {
        return { valid: false, error: 'One or both nodes do not exist' }
    }

    // Check for duplicate links (in either direction)
    const linkExists = context.relationships.some(
        rel => {
            const relSource = typeof rel.source === 'string' ? rel.source : rel.source?.id
            const relTarget = typeof rel.target === 'string' ? rel.target : rel.target?.id
            return (relSource === sourceId && relTarget === targetId) ||
                   (relSource === targetId && relTarget === sourceId)
        }
    )

    if (linkExists) {
        return { valid: false, error: 'A link between these nodes already exists' }
    }

    return { valid: true }
}

/**
 * Check if link creation session has timed out
 * @param timestamp - Timestamp when link creation was initiated
 * @param timeoutMs - Timeout duration in milliseconds (default: 30000ms = 30 seconds)
 * @returns true if timed out, false otherwise
 */
export function isLinkCreationTimedOut(
    timestamp: number,
    timeoutMs: number = 30000
): boolean {
    if (timestamp === 0) return false
    return Date.now() - timestamp > timeoutMs
}

/**
 * Get the source node from the graph
 * @param sourceId - Source node ID
 * @param elements - Array of graph elements
 * @returns The source node or null
 */
export function getSourceNode(
    sourceId: string | null,
    elements: GraphElement[]
): GraphElement | null {
    if (!sourceId) return null
    return elements.find(el => el.id === sourceId) || null
}

/**
 * Get the target node from the graph
 * @param targetId - Target node ID
 * @param elements - Array of graph elements
 * @returns The target node or null
 */
export function getTargetNode(
    targetId: string,
    elements: GraphElement[]
): GraphElement | null {
    return elements.find(el => el.id === targetId) || null
}

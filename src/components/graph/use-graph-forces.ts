import { useEffect, useCallback } from 'react'
import { GraphElement } from '@/store/use-graph-store'

interface UseGraphForcesProps {
    graphRef: React.MutableRefObject<any>
    physics: {
        repulsion: number
        linkDistance: number
        linkStrength: number
        clusterAttraction: number
    }
    generationalOrdering: boolean
    generationalStrength: number
    elements: GraphElement[]
    relationshipTypes: any[]
}

export function useGraphForces({
    graphRef,
    physics,
    generationalOrdering,
    generationalStrength,
    elements,
    relationshipTypes
}: UseGraphForcesProps) {
    const configureForces = useCallback(() => {
        if (!graphRef.current) return

        try {
            // Apply charge (repulsion)
            graphRef.current.d3Force('charge').strength(physics.repulsion)

            const relTypesMap = new Map(relationshipTypes.map(t => [t.name, t]))

            // Apply link forces
            graphRef.current.d3Force('link')
                .distance((link: any) => {
                    const t = relTypesMap.get(link.type)
                    const mult = t && t.strength ? t.strength : 1
                    return physics.linkDistance / mult
                })
                .strength((link: any) => {
                    const t = relTypesMap.get(link.type)
                    const mult = t && t.strength ? t.strength : 1
                    return physics.linkStrength * mult
                })

            // Apply center (gravity) force
            const gravityStrength = physics.clusterAttraction / 1000
            const centerForce = graphRef.current.d3Force('center')
            if (centerForce && centerForce.strength) {
                centerForce.strength(gravityStrength)
            }

            // Apply generational ordering (Y-axis sorting)
            if (generationalOrdering) {
                const withDOB = elements.filter(e => e.dateOfBirth)
                if (withDOB.length >= 2) {
                    const dates = withDOB.map(e => new Date(e.dateOfBirth!).getTime())
                    const minDate = Math.min(...dates)
                    const maxDate = Math.max(...dates)
                    const range = maxDate - minDate

                    if (range > 0) {
                        const genForce: any = function (alpha: number) {
                            if (!genForce.nodes) return
                            const graphHeight = 800 // base units for scaling
                            const nodesById = new Map(genForce.nodes.map((n: any) => [n.id, n]))

                            withDOB.forEach(node => {
                                const nodeRef = nodesById.get(node.id) as any
                                if (!nodeRef) return
                                const t = (new Date(node.dateOfBirth!).getTime() - minDate) / range
                                // Map time to Y position (older nodes higher up)
                                const targetY = (0.5 - t) * graphHeight
                                nodeRef.vy += (targetY - (nodeRef.y || 0)) * 0.3 * generationalStrength * alpha

                                // Clamp velocity to prevent oscillation
                                const maxVelocity = 50
                                nodeRef.vy = Math.max(-maxVelocity, Math.min(maxVelocity, nodeRef.vy))
                            })
                        }
                        genForce.initialize = function (nodes: any[]) {
                            genForce.nodes = nodes
                        }
                        graphRef.current.d3Force('generational', genForce)
                    } else {
                        graphRef.current.d3Force('generational', null)
                    }
                } else {
                    graphRef.current.d3Force('generational', null)
                }
            } else {
                graphRef.current.d3Force('generational', null)
            }

            // Reheat simulation if available
            if (graphRef.current.d3ReheatSimulation) {
                graphRef.current.d3ReheatSimulation()
            }
        } catch (err) {
            console.error("Error applying graph forces:", err)
        }
    }, [graphRef, physics, generationalOrdering, generationalStrength, elements, relationshipTypes])

    // Automatically re-configure forces when dependencies change
    useEffect(() => {
        configureForces()
    }, [configureForces])

    return { configureForces }
}

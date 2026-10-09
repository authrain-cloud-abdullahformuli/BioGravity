"use client"

import { memo, useMemo } from "react"
import { useGraphStore, GraphElement } from "@/store/use-graph-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Network, Users, TrendingUp, Crown } from "lucide-react"

function InsightsPanelImpl() {
    const elements = useGraphStore(s => s.elements)
    const relationships = useGraphStore(s => s.relationships)
    const selectedNodeId = useGraphStore(s => s.selectedNodeId)

    // Calculate degree centrality (most connected nodes)
    const nodeStats = useMemo(() => {
        const stats: Map<string, number> = new Map()

        // Initialize all nodes with 0 connections
        elements.forEach(el => stats.set(el.id, 0))

        // Count connections
        relationships.forEach(rel => {
            const sourceId = typeof rel.source === 'string' ? rel.source : (rel.source as GraphElement).id
            const targetId = typeof rel.target === 'string' ? rel.target : (rel.target as GraphElement).id

            stats.set(sourceId, (stats.get(sourceId) || 0) + 1)
            stats.set(targetId, (stats.get(targetId) || 0) + 1)
        })

        // Convert to array with node info
        return elements
            .map(el => ({
                id: el.id,
                name: el.name,
                type: el.type,
                degree: stats.get(el.id) || 0
            }))
            .sort((a, b) => b.degree - a.degree)
    }, [elements, relationships])

    // Get top connected nodes
    const topConnected = nodeStats.slice(0, 5)

    // Calculate type distribution
    const typeDistribution = useMemo(() => {
        const dist: Map<string, number> = new Map()
        elements.forEach(el => {
            dist.set(el.type, (dist.get(el.type) || 0) + 1)
        })
        return Array.from(dist.entries()).sort((a, b) => b[1] - a[1])
    }, [elements])

    // Get stats for selected node
    const selectedStats = useMemo(() => {
        if (!selectedNodeId) return null
        return nodeStats.find(n => n.id === selectedNodeId)
    }, [selectedNodeId, nodeStats])

    // Calculate network stats
    const networkStats = useMemo(() => {
        const totalNodes = elements.length
        const totalEdges = relationships.length
        const avgDegree = totalNodes > 0
            ? (totalEdges * 2 / totalNodes).toFixed(1)
            : '0'
        const density = totalNodes > 1
            ? (totalEdges / (totalNodes * (totalNodes - 1) / 2) * 100).toFixed(1)
            : '0'

        return { totalNodes, totalEdges, avgDegree, density }
    }, [elements, relationships])

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Insights
                </CardTitle>
                <CardDescription>
                    Network analytics and statistics
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                    <div className="space-y-6">
                        {/* Network Overview */}
                        <div>
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <Network className="h-4 w-4" />
                                Network Overview
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {networkStats.totalNodes}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Nodes</div>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {networkStats.totalEdges}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Edges</div>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {networkStats.avgDegree}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Avg Degree</div>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {networkStats.density}%
                                    </div>
                                    <div className="text-xs text-muted-foreground">Density</div>
                                </div>
                            </div>
                        </div>

                        {/* Selected Node Stats */}
                        {selectedStats && (
                            <div>
                                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Selected: {selectedStats.name}
                                </h4>
                                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Connections</span>
                                        <Badge variant="secondary">{selectedStats.degree}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-sm">Type</span>
                                        <Badge>{selectedStats.type}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-sm">Rank</span>
                                        <Badge variant="outline">
                                            #{nodeStats.findIndex(n => n.id === selectedStats.id) + 1}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Most Connected */}
                        <div>
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <Crown className="h-4 w-4" />
                                Most Connected
                            </h4>
                            <div className="space-y-2">
                                {topConnected.map((node, i) => (
                                    <div
                                        key={node.id}
                                        className={`flex items-center justify-between p-2 rounded-lg ${node.id === selectedNodeId
                                                ? 'bg-primary/20 border border-primary/40'
                                                : 'bg-muted/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-muted-foreground w-4">
                                                {i + 1}
                                            </span>
                                            <span className="text-sm truncate max-w-[100px]">
                                                {node.name}
                                            </span>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            {node.degree}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Type Distribution */}
                        <div>
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Type Distribution
                            </h4>
                            <div className="space-y-2">
                                {typeDistribution.map(([type, count]) => (
                                    <div key={type} className="flex items-center gap-2">
                                        <Badge variant="outline" className="flex-1">
                                            {type}
                                        </Badge>
                                        <span className="text-sm font-medium">{count}</span>
                                        <div className="flex-1 bg-muted/30 rounded-full h-2">
                                            <div
                                                className="bg-primary rounded-full h-2 transition-all"
                                                style={{
                                                    width: `${(count / elements.length) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

export const InsightsPanel = memo(InsightsPanelImpl)

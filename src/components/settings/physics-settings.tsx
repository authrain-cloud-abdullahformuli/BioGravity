"use client"

import { useGraphStore } from "@/store/use-graph-store"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

const DEFAULT_PHYSICS = {
    clusterAttraction: 100,
    linkStrength: 0.5,
    repulsion: -200,
    linkDistance: 100,
}

export function PhysicsSettings() {
    const { physics, setPhysics, generationalStrength, setGenerationalStrength } = useGraphStore()

    const handleReset = () => {
        setPhysics(DEFAULT_PHYSICS)
        setGenerationalStrength(1.0)
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Physics Controls</CardTitle>
                        <CardDescription>
                            Adjust how nodes interact in the graph simulation
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Cluster Attraction */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Cluster Attraction</Label>
                        <span className="text-sm text-muted-foreground">{physics.clusterAttraction}</span>
                    </div>
                    <Slider
                        value={[physics.clusterAttraction]}
                        min={0}
                        max={300}
                        step={10}
                        onValueChange={(val: number[]) => setPhysics({ clusterAttraction: val[0] })}
                    />
                    <p className="text-xs text-muted-foreground">
                        How strongly nodes move toward the center
                    </p>
                </div>

                {/* Link Strength */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Link Strength</Label>
                        <span className="text-sm text-muted-foreground">{physics.linkStrength.toFixed(2)}</span>
                    </div>
                    <Slider
                        value={[physics.linkStrength * 100]}
                        min={0}
                        max={100}
                        step={5}
                        onValueChange={(val: number[]) => setPhysics({ linkStrength: val[0] / 100 })}
                    />
                    <p className="text-xs text-muted-foreground">
                        How strongly connected nodes pull together
                    </p>
                </div>

                {/* Repulsion */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Repulsion</Label>
                        <span className="text-sm text-muted-foreground">{Math.abs(physics.repulsion)}</span>
                    </div>
                    <Slider
                        value={[Math.abs(physics.repulsion)]}
                        min={0}
                        max={500}
                        step={25}
                        onValueChange={(val: number[]) => setPhysics({ repulsion: -val[0] })}
                    />
                    <p className="text-xs text-muted-foreground">
                        How strongly unconnected nodes push apart
                    </p>
                </div>

                {/* Link Distance */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Link Distance</Label>
                        <span className="text-sm text-muted-foreground">{physics.linkDistance}</span>
                    </div>
                    <Slider
                        value={[physics.linkDistance]}
                        min={30}
                        max={300}
                        step={10}
                        onValueChange={(val: number[]) => setPhysics({ linkDistance: val[0] })}
                    />
                    <p className="text-xs text-muted-foreground">
                        Default distance between connected nodes
                    </p>
                </div>

                {/* Generational Strength */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Generational Strength</Label>
                        <span className="text-sm text-muted-foreground">{generationalStrength.toFixed(1)}x</span>
                    </div>
                    <Slider
                        value={[generationalStrength * 100]}
                        min={10}
                        max={300}
                        step={10}
                        onValueChange={(val: number[]) => setGenerationalStrength(val[0] / 100)}
                    />
                    <p className="text-xs text-muted-foreground">
                        How strongly generations separate vertically (requires Generational Ordering enabled)
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

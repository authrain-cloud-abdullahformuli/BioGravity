import { create } from 'zustand'
import { createGraphSlice, GraphSlice } from './graph-slice'
import { createUISlice, UISlice } from './ui-slice'
import { createHistorySlice, HistorySlice } from './history-slice'

export interface GraphElement {
    id: string
    name: string
    type: string
    description: string | null
    dateOfBirth?: string | null
    imageUrl?: string | null
    pinned?: boolean
    // Physics properties
    x?: number
    y?: number
    z?: number
    fx?: number
    fy?: number
    fz?: number
    vx?: number
    vy?: number
    vz?: number
}

export interface GraphRelationship {
    id: string
    source: string | GraphElement
    target: string | GraphElement
    type: string
}

export interface PhysicsConfig {
    clusterAttraction: number
    linkStrength: number
    repulsion: number
    linkDistance: number
}

export type GraphState = GraphSlice & UISlice & HistorySlice

export const useGraphStore = create<GraphState>()((...a) => ({
    ...createGraphSlice(...a),
    ...createUISlice(...a),
    ...createHistorySlice(...a),
}))


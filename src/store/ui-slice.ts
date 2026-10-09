import { StateCreator } from 'zustand'
import { GraphState, PhysicsConfig } from './use-graph-store'

export interface LinkCreationMode {
    isActive: boolean
    sourceNodeId: string | null
    timestamp: number
}

export interface UISlice {
    selectedNodeId: string | null
    is2D: boolean
    showLabels: boolean
    searchQuery: string
    selectedTypeFilter: string | null
    physics: PhysicsConfig
    focusMode: boolean
    focusDegrees: number
    triggerScreenshot: boolean
    nodeSize: number
    generationalOrdering: boolean
    generationalStrength: number
    linkCreationMode: LinkCreationMode
    showInsights: boolean
    showPhysics: boolean

    setSelectedNode: (id: string | null) => void
    setIs2D: (is2D: boolean) => void
    setSearchQuery: (query: string) => void
    setSelectedTypeFilter: (type: string | null) => void
    setPhysics: (config: Partial<PhysicsConfig>) => void
    setShowLabels: (showLabels: boolean) => void
    setFocusMode: (focusMode: boolean) => void
    setFocusDegrees: (degrees: number) => void
    setTriggerScreenshot: (trigger: boolean) => void
    setNodeSize: (size: number) => void
    setGenerationalOrdering: (enabled: boolean) => void
    setGenerationalStrength: (strength: number) => void
    setLinkCreationSource: (nodeId: string) => void
    completeLinkCreation: () => void
    cancelLinkCreation: () => void
    setShowInsights: (open: boolean) => void
    setShowPhysics: (open: boolean) => void
}

export const createUISlice: StateCreator<GraphState, [], [], UISlice> = (set) => ({
    selectedNodeId: null,
    is2D: false,
    showLabels: true,
    searchQuery: "",
    selectedTypeFilter: null,
    physics: {
        clusterAttraction: 100,
        linkStrength: 0.5,
        repulsion: -200,
        linkDistance: 100,
    },
    focusMode: false,
    focusDegrees: 1,
    triggerScreenshot: false,
    nodeSize: 1,
    generationalOrdering: false,
    generationalStrength: 1.0,
    linkCreationMode: {
        isActive: false,
        sourceNodeId: null,
        timestamp: 0,
    },
    showInsights: false,
    showPhysics: false,

    setSelectedNode: (id) => set({ selectedNodeId: id }),
    setIs2D: (is2D) => set({ is2D }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setSelectedTypeFilter: (selectedTypeFilter) => set({ selectedTypeFilter }),
    setPhysics: (config) => set(state => ({ physics: { ...state.physics, ...config } })),
    setShowLabels: (showLabels) => set({ showLabels }),
    setFocusMode: (focusMode) => set({ focusMode }),
    setFocusDegrees: (focusDegrees) => set({ focusDegrees }),
    setTriggerScreenshot: (triggerScreenshot) => set({ triggerScreenshot }),
    setNodeSize: (nodeSize) => set({ nodeSize }),
    setGenerationalOrdering: (enabled) => set({ generationalOrdering: enabled }),
    setGenerationalStrength: (strength) => set({ generationalStrength: strength }),
    setLinkCreationSource: (nodeId) => set({
        linkCreationMode: {
            isActive: true,
            sourceNodeId: nodeId,
            timestamp: Date.now(),
        },
    }),
    completeLinkCreation: () => set({
        linkCreationMode: {
            isActive: false,
            sourceNodeId: null,
            timestamp: 0,
        },
    }),
    cancelLinkCreation: () => set({
        linkCreationMode: {
            isActive: false,
            sourceNodeId: null,
            timestamp: 0,
        },
    }),
    setShowInsights: (open) => set({ showInsights: open }),
    setShowPhysics: (open) => set({ showPhysics: open }),
})

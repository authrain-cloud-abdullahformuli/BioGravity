import { StateCreator } from 'zustand'
import { GraphState, GraphElement, GraphRelationship } from './use-graph-store'
import { toast } from 'sonner'

const showMutationError = (message: string, error: unknown) => {
    console.error(message, error)
    toast.error(message)
}

export interface GraphSlice {
    elements: GraphElement[]
    relationships: GraphRelationship[]
    loading: boolean
    error: string | null
    elementTypes: any[]
    relationshipTypes: any[]
    graphRef: any | null

    fetchGraphData: (projectId: string) => Promise<void>
    setElements: (elements: GraphElement[]) => void
    setRelationships: (relationships: GraphRelationship[]) => void
    setGraphRef: (ref: any) => void
    togglePin: (id: string, pin: boolean, projectId: string) => Promise<void>
    deleteElement: (id: string, projectId: string) => Promise<void>
    deleteRelationship: (id: string, projectId: string) => Promise<void>
    updateElement: (id: string, projectId: string, data: Partial<GraphElement>) => Promise<void>
    updateRelationship: (id: string, projectId: string, data: Partial<GraphRelationship>) => Promise<void>
    addElement: (projectId: string, data: Partial<GraphElement>) => Promise<GraphElement | null>
    addRelationship: (projectId: string, data: { fromId: string; toId: string; type: string }) => Promise<GraphRelationship | null>
}

export const createGraphSlice: StateCreator<GraphState, [], [], GraphSlice> = (set, get) => ({
    elements: [],
    relationships: [],
    loading: false,
    error: null,
    elementTypes: [],
    relationshipTypes: [],
    graphRef: null,

    fetchGraphData: async (projectId: string) => {
        set({ loading: true, error: null, selectedNodeId: null, history: { past: [], future: [] } })
        try {
            const res = await fetch(`/api/projects/${projectId}/graph`)
            if (!res.ok) throw new Error(`Failed to fetch graph data: ${res.statusText}`)
            const data = await res.json()
            set({
                elements: data.elements.map((el: any) => ({
                    ...el,
                    fx: el.pinned ? el.positionX : undefined,
                    fy: el.pinned ? el.positionY : undefined,
                    fz: el.pinned ? el.positionZ : undefined
                })),
                relationships: data.relationships,
                elementTypes: data.elementTypes || [],
                relationshipTypes: data.relationshipTypes || [],
                loading: false
            })
        } catch (error: any) {
            console.error("Error fetching graph:", error)
            set({ error: error.message, loading: false })
        }
    },

    setGraphRef: (ref) => set({ graphRef: ref }),
    setElements: (elements) => set({ elements }),
    setRelationships: (relationships) => set({ relationships }),

    togglePin: async (id, pin, projectId) => {
        const state = get()
        const node = state.elements.find(e => e.id === id)
        if (!node || !projectId) return

        const previousElements = state.elements
        let updateData: any = { pinned: pin }
        let liveX = node.x, liveY = node.y, liveZ = node.z

        if (state.graphRef && typeof state.graphRef.graphData === 'function') {
            const { nodes } = state.graphRef.graphData()
            const liveNode = nodes.find((n: any) => n.id === id)
            if (liveNode) {
                liveX = liveNode.x
                liveY = liveNode.y
                liveZ = liveNode.z
            }
        }

        set(state => ({
            elements: state.elements.map(el => {
                if (el.id === id) {
                    if (pin) {
                        updateData = { ...updateData, positionX: liveX, positionY: liveY, positionZ: liveZ }
                        return { ...el, pinned: true, fx: liveX, fy: liveY, fz: liveZ }
                    } else {
                        const rest = { ...el, pinned: false } as any
                        delete rest.fx
                        delete rest.fy
                        delete rest.fz
                        return rest
                    }
                }
                return el
            })
        }))

        try {
            const res = await fetch(`/api/projects/${projectId}/elements/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            })
            if (!res.ok) throw new Error('Failed to sync pin state')
        } catch (error) {
            set({ elements: previousElements })
            showMutationError("Failed to sync pin state", error)
        }
    },

    deleteElement: async (id, projectId) => {
        const { elements, relationships, saveToHistory } = get()
        const previousElements = elements
        const previousRelationships = relationships
        saveToHistory()

        set({
            elements: elements.filter(e => e.id !== id),
            relationships: relationships.filter(r => {
                const sourceId = typeof r.source === 'string' ? r.source : (r.source as GraphElement).id
                const targetId = typeof r.target === 'string' ? r.target : (r.target as GraphElement).id
                return sourceId !== id && targetId !== id
            })
        })

        try {
            const res = await fetch(`/api/projects/${projectId}/elements/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete element')
        } catch (error) {
            set({ elements: previousElements, relationships: previousRelationships })
            showMutationError("Failed to delete element", error)
        }
    },

    deleteRelationship: async (id, projectId) => {
        const { relationships, saveToHistory } = get()
        const previousRelationships = relationships
        saveToHistory()
        set({ relationships: relationships.filter(r => r.id !== id) })
        try {
            const res = await fetch(`/api/projects/${projectId}/relationships/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete relationship')
        } catch (error) {
            set({ relationships: previousRelationships })
            showMutationError("Failed to delete relationship", error)
        }
    },

    updateElement: async (id, projectId, data) => {
        const { elements, saveToHistory } = get()
        const previousElements = elements
        saveToHistory()
        set({ elements: elements.map(e => e.id === id ? { ...e, ...data } : e) })
        try {
            const res = await fetch(`/api/projects/${projectId}/elements/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!res.ok) throw new Error('Failed to update element')
        } catch (error) {
            set({ elements: previousElements })
            showMutationError("Failed to update element", error)
        }
    },

    updateRelationship: async (id, projectId, data) => {
        const { relationships, saveToHistory } = get()
        const previousRelationships = relationships
        saveToHistory()
        set({ relationships: relationships.map(r => r.id === id ? { ...r, ...data } : r) })
        try {
            const res = await fetch(`/api/projects/${projectId}/relationships/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!res.ok) throw new Error('Failed to update relationship')
        } catch (error) {
            set({ relationships: previousRelationships })
            showMutationError("Failed to update relationship", error)
        }
    },

    addElement: async (projectId, data) => {
        const { elements, saveToHistory } = get()
        const tempId = crypto.randomUUID()
        const tempElement: GraphElement = {
            id: tempId,
            name: data.name || 'New Element',
            type: data.type || '',
            description: data.description || '',
            dateOfBirth: data.dateOfBirth || null,
            imageUrl: data.imageUrl || null,
            x: data.x || 0,
            y: data.y || 0,
            z: data.z || 0,
            pinned: false
        }

        saveToHistory()
        set({ elements: [...elements, tempElement] })

        try {
            // Convert x/y/z to positionX/Y/Z for API
            const apiData = {
                name: data.name,
                type: data.type,
                description: data.description || '',
                dateOfBirth: data.dateOfBirth || null,
                positionX: data.x || 0,
                positionY: data.y || 0,
                positionZ: data.z || 0
            }
            const res = await fetch(`/api/projects/${projectId}/elements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiData)
            })
            if (!res.ok) throw new Error('Failed to create element')
            const created = await res.json()
            set(state => ({
                elements: state.elements.map(el => el.id === tempId ? { ...created } : el)
            }))
            return created
        } catch (error) {
            console.error('Error creating element:', error)
            set(state => ({
                elements: state.elements.filter(el => el.id !== tempId)
            }))
            return null
        }
    },

    addRelationship: async (projectId, data) => {
        const { relationships, saveToHistory } = get()
        const tempId = crypto.randomUUID()
        const tempRelationship: GraphRelationship = {
            id: tempId,
            source: data.fromId,
            target: data.toId,
            type: data.type,
            fromId: data.fromId,
            toId: data.toId
        } as GraphRelationship

        saveToHistory()
        set({ relationships: [...relationships, tempRelationship] })

        try {
            const res = await fetch(`/api/projects/${projectId}/relationships`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceId: data.fromId,
                    targetId: data.toId,
                    type: data.type
                })
            })
            if (!res.ok) throw new Error('Failed to create relationship')
            const created = await res.json()
            set(state => ({
                relationships: state.relationships.map(rel => rel.id === tempId ? { ...created } : rel)
            }))
            return created
        } catch (error) {
            console.error('Error creating relationship:', error)
            set(state => ({
                relationships: state.relationships.filter(rel => rel.id !== tempId)
            }))
            return null
        }
    }
})

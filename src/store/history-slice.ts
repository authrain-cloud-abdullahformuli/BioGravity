import { StateCreator } from 'zustand'
import { GraphState, GraphElement, GraphRelationship } from './use-graph-store'

interface HistoryState {
    past: Array<{ elements: GraphElement[], relationships: GraphRelationship[] }>
    future: Array<{ elements: GraphElement[], relationships: GraphRelationship[] }>
}

export interface HistorySlice {
    history: HistoryState
    saveToHistory: () => void
    undo: () => void
    redo: () => void
}

export const createHistorySlice: StateCreator<GraphState, [], [], HistorySlice> = (set, get) => ({
    history: { past: [], future: [] },

    saveToHistory: () => {
        const { elements, relationships, history } = get()
        set({
            history: {
                past: [...history.past, { elements, relationships }],
                future: []
            }
        })
    },

    undo: () => {
        const { past, future } = get().history
        if (past.length === 0) return

        const previous = past[past.length - 1]
        const newPast = past.slice(0, past.length - 1)
        const { elements, relationships } = get()

        set({
            elements: previous.elements,
            relationships: previous.relationships,
            history: {
                past: newPast,
                future: [{ elements, relationships }, ...future]
            }
        })
    },

    redo: () => {
        const { past, future } = get().history
        if (future.length === 0) return

        const next = future[0]
        const newFuture = future.slice(1)
        const { elements, relationships } = get()

        set({
            elements: next.elements,
            relationships: next.relationships,
            history: {
                past: [...past, { elements, relationships }],
                future: newFuture
            }
        })
    }
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useGraphStore, type GraphElement, type GraphRelationship } from '@/store/use-graph-store'
import { toast } from 'sonner'

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}))

const sampleElement = (id: string): GraphElement => ({
    id,
    name: `Element ${id}`,
    type: 'Person',
    description: null,
})

const sampleRelationship = (id: string, fromId: string, toId: string): GraphRelationship => ({
    id,
    source: fromId,
    target: toId,
    type: 'Partner',
} as GraphRelationship)

function resetStore(elements: GraphElement[], relationships: GraphRelationship[]) {
    useGraphStore.setState({ elements, relationships })
}

describe('graph-slice optimistic rollback', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        global.fetch = vi.fn()
    })

    describe('deleteElement', () => {
        it('keeps local state and toasts an error when the server returns 500', async () => {
            const e1 = sampleElement('e1')
            const e2 = sampleElement('e2')
            const r1 = sampleRelationship('r1', 'e1', 'e2')
            resetStore([e1, e2], [r1])

            ; (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, statusText: 'Server Error' })

            await useGraphStore.getState().deleteElement('e1', 'p1')

            // Rolled back to previous state
            expect(useGraphStore.getState().elements).toEqual([e1, e2])
            expect(useGraphStore.getState().relationships).toEqual([r1])
            expect(toast.error).toHaveBeenCalledWith('Failed to delete element')
        })

        it('removes element + edges on success', async () => {
            const e1 = sampleElement('e1')
            const e2 = sampleElement('e2')
            const r1 = sampleRelationship('r1', 'e1', 'e2')
            resetStore([e1, e2], [r1])

            ; (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true })

            await useGraphStore.getState().deleteElement('e1', 'p1')

            expect(useGraphStore.getState().elements).toEqual([e2])
            expect(useGraphStore.getState().relationships).toEqual([])
            expect(toast.error).not.toHaveBeenCalled()
        })
    })

    describe('deleteRelationship', () => {
        it('restores the relationship and toasts when the server fails', async () => {
            const r1 = sampleRelationship('r1', 'a', 'b')
            const r2 = sampleRelationship('r2', 'b', 'c')
            resetStore([], [r1, r2])

            ; (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, statusText: 'Server Error' })

            await useGraphStore.getState().deleteRelationship('r1', 'p1')

            expect(useGraphStore.getState().relationships).toEqual([r1, r2])
            expect(toast.error).toHaveBeenCalledWith('Failed to delete relationship')
        })

        it('removes the relationship on success', async () => {
            const r1 = sampleRelationship('r1', 'a', 'b')
            const r2 = sampleRelationship('r2', 'b', 'c')
            resetStore([], [r1, r2])

            ; (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true })

            await useGraphStore.getState().deleteRelationship('r1', 'p1')

            expect(useGraphStore.getState().relationships).toEqual([r2])
            expect(toast.error).not.toHaveBeenCalled()
        })
    })
})

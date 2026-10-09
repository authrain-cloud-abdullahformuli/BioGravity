import { describe, it, expect, beforeEach } from 'vitest'
import { useGraphStore } from '@/store/use-graph-store'

describe('STORY-GRP-024 — Insights panel toggle (CC-11)', () => {
    beforeEach(() => {
        useGraphStore.setState({ showInsights: false })
    })

    it('defaults to closed', () => {
        expect(useGraphStore.getState().showInsights).toBe(false)
    })

    it('setShowInsights(true) opens the panel', () => {
        useGraphStore.getState().setShowInsights(true)
        expect(useGraphStore.getState().showInsights).toBe(true)
    })

    it('setShowInsights(false) closes the panel after being open', () => {
        useGraphStore.getState().setShowInsights(true)
        useGraphStore.getState().setShowInsights(false)
        expect(useGraphStore.getState().showInsights).toBe(false)
    })

    it('is idempotent — setting the same value twice leaves state stable', () => {
        useGraphStore.getState().setShowInsights(true)
        useGraphStore.getState().setShowInsights(true)
        expect(useGraphStore.getState().showInsights).toBe(true)
    })
})

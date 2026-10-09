import { describe, it, expect, beforeEach } from 'vitest'
import { useGraphStore } from '@/store/use-graph-store'

const DEFAULT_PHYSICS = {
    clusterAttraction: 100,
    linkStrength: 0.5,
    repulsion: -200,
    linkDistance: 100,
}

describe('STORY-GRP-025 — Physics controls drawer toggle (CC-12)', () => {
    beforeEach(() => {
        useGraphStore.setState({
            showPhysics: false,
            physics: { ...DEFAULT_PHYSICS },
            generationalStrength: 1.0,
        })
    })

    it('defaults to closed', () => {
        expect(useGraphStore.getState().showPhysics).toBe(false)
    })

    it('setShowPhysics(true) opens the drawer', () => {
        useGraphStore.getState().setShowPhysics(true)
        expect(useGraphStore.getState().showPhysics).toBe(true)
    })

    it('setShowPhysics(false) closes the drawer after being open', () => {
        useGraphStore.getState().setShowPhysics(true)
        useGraphStore.getState().setShowPhysics(false)
        expect(useGraphStore.getState().showPhysics).toBe(false)
    })

    it('setPhysics applies a partial update without disturbing other fields', () => {
        useGraphStore.getState().setPhysics({ linkDistance: 200 })
        const { physics } = useGraphStore.getState()
        expect(physics.linkDistance).toBe(200)
        expect(physics.clusterAttraction).toBe(DEFAULT_PHYSICS.clusterAttraction)
        expect(physics.linkStrength).toBe(DEFAULT_PHYSICS.linkStrength)
        expect(physics.repulsion).toBe(DEFAULT_PHYSICS.repulsion)
    })

    it('resetting via setPhysics(DEFAULT_PHYSICS) restores all four fields', () => {
        useGraphStore.getState().setPhysics({ linkDistance: 250, repulsion: -10, linkStrength: 0.9, clusterAttraction: 5 })
        useGraphStore.getState().setPhysics(DEFAULT_PHYSICS)
        expect(useGraphStore.getState().physics).toEqual(DEFAULT_PHYSICS)
    })
})

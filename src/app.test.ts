/**
 * @vitest-environment jsdom
 */
import { useGraphStore } from './store/use-graph-store'
import type { GraphElement, GraphRelationship } from './store/use-graph-store'
import { formatDate } from './lib/utils'
import { isValidDateString, parseFromInput, formatToDisplay, getDateErrorMessage } from './lib/dateFormatting'
import { validateLinkCreation, isLinkCreationTimedOut } from './lib/linkCreationManager'
import { act, renderHook } from '@testing-library/react'
import { getColorForType, getColorForEdgeType } from './lib/graph-utils'
import { vi } from 'vitest'

type TestRelationship = GraphRelationship & {
    description?: string
    strength?: number
    fromId?: string
    toId?: string
}

describe('Bug Fix Regression test suite', () => {

    // Test for Bug 2: Pinned Elements not staying in place
    it('togglePin should use live coordinates from graphRef if available', async () => {
        const { result } = renderHook(() => useGraphStore())

        // Setup initial store state with an element 1
        act(() => {
            result.current.setElements([{
                id: '1',
                name: 'Test',
                type: 'Person',
                description: '',
                x: 0,
                y: 0,
                z: 0
            }])

            // Mock graphRef
            result.current.setGraphRef({
                graphData: () => ({
                    nodes: [{ id: '1', x: 100, y: 150, z: 200 }]
                })
            })
        })

        // Call togglePin
        await act(async () => {
            // we mock the fetch call globally if needed, or ignore the error
            global.fetch = vi.fn().mockResolvedValue({ ok: true })
            await result.current.togglePin('1', true, 'p1')
        })

        // Verify the element has the LIVE coordinates assigned
        const element = result.current.elements.find(e => e.id === '1')
        expect(element?.pinned).toBe(true)
        expect(element?.fx).toBe(100)
        expect(element?.fy).toBe(150)
        expect(element?.fz).toBe(200)
    })

    // Regression test for type editing/renaming logic
    it('should reflect renamed type for elements in the store', () => {
        const { result } = renderHook(() => useGraphStore())

        // Initial state
        act(() => {
            result.current.setElements([
                { id: '1', name: 'Node 1', type: 'OldType', description: '' },
                { id: '2', name: 'Node 2', type: 'StayType', description: '' }
            ])
        })

        // Simulate renaming logic (usually happens via API and then re-fetch/update)
        // Here we test that if we update the store with new element data (after type rename), it works.
        act(() => {
            const updatedElements = result.current.elements.map(e =>
                e.type === 'OldType' ? { ...e, type: 'NewType' } : e
            )
            result.current.setElements(updatedElements)
        })

        expect(result.current.elements.find(e => e.id === '1')?.type).toBe('NewType')
        expect(result.current.elements.find(e => e.id === '2')?.type).toBe('StayType')
    })
    // Regression test for new features: Date of Birth, Image URL, and Relationship Strength
    it('should correctly store and update new properties on elements and relationships', () => {
        const { result } = renderHook(() => useGraphStore())

        // Initial state
        act(() => {
            result.current.setElements([{
                id: '1',
                name: 'Person 1',
                type: 'Person',
                description: '',
                dateOfBirth: '1990-01-01T00:00:00.000Z',
                imageUrl: 'data:image/png;base64,iVBORw0KGgo'
            }])

            result.current.setRelationships([{
                id: 'r1',
                source: '1',
                target: '2',
                type: 'Father',
                description: '',
                strength: 2.5
            }] as TestRelationship[])
        })

        // Verify elements have the new properties
        const element = result.current.elements.find(e => e.id === '1')
        expect(element?.dateOfBirth).toBe('1990-01-01T00:00:00.000Z')
        expect(element?.imageUrl).toContain('data:image/png')

        // Verify relationships have strength
        const relationship = result.current.relationships.find(r => r.id === 'r1') as TestRelationship | undefined
        expect(relationship?.strength).toBe(2.5)
    })

    // Test for formatDate utility
    it('formatDate returns dd/mm/yyyy for valid ISO date', () => {
        expect(formatDate('1990-06-15T00:00:00.000Z')).toBe('15/06/1990')
    })

    it('formatDate returns "-" for invalid date', () => {
        expect(formatDate('not-a-date')).toBe('-')
    })

    it('formatDate handles Date object input', () => {
        expect(formatDate(new Date('2000-12-25'))).toBe('25/12/2000')
    })

    // Test for generationalStrength state
    it('generationalStrength defaults to 1.0 and is settable', () => {
        const { result } = renderHook(() => useGraphStore())
        expect(result.current.generationalStrength).toBe(1.0)
        act(() => {
            result.current.setGenerationalStrength(2.5)
        })
        expect(result.current.generationalStrength).toBe(2.5)
    })

    // Test for nodeSize state
    it('nodeSize defaults to 1.0 and is settable', () => {
        const { result } = renderHook(() => useGraphStore())
        expect(result.current.nodeSize).toBe(1.0)
        act(() => {
            result.current.setNodeSize(2.0)
        })
        expect(result.current.nodeSize).toBe(2.0)
    })

    // Test for addElement optimistic insert and confirmation
    it('addElement optimistically inserts then confirms on success', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ id: 'server-id', name: 'New', type: 'Person', description: '', dateOfBirth: null, imageUrl: null })
        })
        const { result } = renderHook(() => useGraphStore())
        const captured: { current: GraphElement | null } = { current: null }
        await act(async () => {
            captured.current = await result.current.addElement('proj-1', { name: 'New', type: 'Person' })
        })
        expect(result.current.elements.some(e => e.name === 'New')).toBe(true)
        expect(captured.current?.id).toBe('server-id')
    })

    it('addElement rolls back on API failure', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false })
        const { result } = renderHook(() => useGraphStore())
        act(() => {
            result.current.setElements([])
        })
        await act(async () => {
            await result.current.addElement('proj-1', { name: 'Fail', type: 'Person' })
        })
        expect(result.current.elements.some(e => e.name === 'Fail')).toBe(false)
    })

    it('deleteElement rolls back elements and relationships on API failure', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false })
        const { result } = renderHook(() => useGraphStore())

        act(() => {
            result.current.setElements([
                { id: '1', name: 'A', type: 'Person', description: '' },
                { id: '2', name: 'B', type: 'Person', description: '' }
            ])
            result.current.setRelationships([
                { id: 'r1', source: '1', target: '2', type: 'Knows' }
            ])
        })

        await act(async () => {
            await result.current.deleteElement('1', 'proj-1')
        })

        expect(result.current.elements.map(e => e.id)).toEqual(['1', '2'])
        expect(result.current.relationships.map(r => r.id)).toEqual(['r1'])
    })

    it('deleteRelationship rolls back on API failure', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false })
        const { result } = renderHook(() => useGraphStore())

        act(() => {
            result.current.setRelationships([
                { id: 'r1', source: '1', target: '2', type: 'Knows' }
            ])
        })

        await act(async () => {
            await result.current.deleteRelationship('r1', 'proj-1')
        })

        expect(result.current.relationships.map(r => r.id)).toEqual(['r1'])
    })

    it('updateElement rolls back on API failure', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false })
        const { result } = renderHook(() => useGraphStore())

        act(() => {
            result.current.setElements([
                { id: '1', name: 'Original', type: 'Person', description: '' }
            ])
        })

        await act(async () => {
            await result.current.updateElement('1', 'proj-1', { name: 'Changed' })
        })

        expect(result.current.elements[0].name).toBe('Original')
    })

    it('updateRelationship rolls back on API failure', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false })
        const { result } = renderHook(() => useGraphStore())

        act(() => {
            result.current.setRelationships([
                { id: 'r1', source: '1', target: '2', type: 'Original' }
            ])
        })

        await act(async () => {
            await result.current.updateRelationship('r1', 'proj-1', { type: 'Changed' })
        })

        expect(result.current.relationships[0].type).toBe('Original')
    })

    it('togglePin rolls back on API failure', async () => {
        window.history.pushState({}, '', '/projects/proj-1')
        global.fetch = vi.fn().mockResolvedValue({ ok: false })
        const { result } = renderHook(() => useGraphStore())

        act(() => {
            result.current.setElements([
                { id: '1', name: 'A', type: 'Person', description: '', pinned: false }
            ])
        })

        await act(async () => {
            await result.current.togglePin('1', true, 'p1')
        })

        expect(result.current.elements[0].pinned).toBe(false)
        expect(result.current.elements[0].fx).toBeUndefined()
    })

    // Test for addRelationship optimistic insert
    it('addRelationship creates relationship with optimistic update', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ id: 'rel-server', fromId: '1', toId: '2', source: '1', target: '2', type: 'Father' })
        })
        const { result } = renderHook(() => useGraphStore())
        act(() => {
            result.current.setRelationships([])
            result.current.setElements([
                { id: '1', name: 'Parent', type: 'Person', description: '', dateOfBirth: null, imageUrl: null },
                { id: '2', name: 'Child', type: 'Person', description: '', dateOfBirth: null, imageUrl: null }
            ])
        })
        await act(async () => {
            await result.current.addRelationship('proj-1', { fromId: '1', toId: '2', type: 'Father' })
        })
        expect(result.current.relationships.length).toBe(1)
    })

    // Test for Elements table attribute visibility
    it('GraphElement with dateOfBirth and imageUrl retains all fields in store', () => {
        const { result } = renderHook(() => useGraphStore())
        act(() => {
            result.current.setElements([{
                id: '1',
                name: 'A',
                type: 'Person',
                description: '',
                dateOfBirth: '1990-01-15T00:00:00.000Z',
                imageUrl: 'data:image/png;base64,abc123'
            }])
        })
        const el = result.current.elements[0]
        expect(el.dateOfBirth).toBe('1990-01-15T00:00:00.000Z')
        expect(el.imageUrl).toBe('data:image/png;base64,abc123')
    })

    // Tests for dateFormatting utilities
    describe('Date Formatting Utilities', () => {
        // Tests for isValidDateString
        it('isValidDateString accepts valid dates in dd/mm/yyyy format', () => {
            expect(isValidDateString('25/12/2000')).toBe(true)
            expect(isValidDateString('01/01/2024')).toBe(true)
            expect(isValidDateString('31/12/1999')).toBe(true)
        })

        it('isValidDateString rejects invalid day values', () => {
            expect(isValidDateString('32/12/2000')).toBe(false)
            expect(isValidDateString('00/12/2000')).toBe(false)
            expect(isValidDateString('31/02/2000')).toBe(false)
        })

        it('isValidDateString rejects invalid month values', () => {
            expect(isValidDateString('15/13/2000')).toBe(false)
            expect(isValidDateString('15/00/2000')).toBe(false)
        })

        it('isValidDateString handles leap year correctly', () => {
            expect(isValidDateString('29/02/2000')).toBe(true) // 2000 is leap year
            expect(isValidDateString('29/02/2001')).toBe(false) // 2001 is not leap year
            expect(isValidDateString('29/02/2004')).toBe(true) // 2004 is leap year
        })

        it('isValidDateString rejects invalid format', () => {
            expect(isValidDateString('2000-12-25')).toBe(false)
            expect(isValidDateString('12/25/2000')).toBe(false)
            expect(isValidDateString('not-a-date')).toBe(false)
            expect(isValidDateString('')).toBe(false)
        })

        // Tests for parseFromInput
        it('parseFromInput converts dd/mm/yyyy to ISO 8601 (YYYY-MM-DD)', () => {
            expect(parseFromInput('25/12/2000')).toBe('2000-12-25')
            expect(parseFromInput('01/01/2024')).toBe('2024-01-01')
            expect(parseFromInput('15/06/1990')).toBe('1990-06-15')
        })

        it('parseFromInput returns null for invalid dates', () => {
            expect(parseFromInput('32/12/2000')).toBe(null)
            expect(parseFromInput('15/13/2000')).toBe(null)
            expect(parseFromInput('invalid')).toBe(null)
        })

        it('parseFromInput handles single digit days and months', () => {
            expect(parseFromInput('1/1/2024')).toBe('2024-01-01')
            expect(parseFromInput('5/3/2020')).toBe('2020-03-05')
        })

        // Tests for formatToDisplay
        it('formatToDisplay converts ISO 8601 to dd/mm/yyyy', () => {
            expect(formatToDisplay('2000-12-25')).toBe('25/12/2000')
            expect(formatToDisplay('2024-01-01')).toBe('01/01/2024')
            expect(formatToDisplay('1990-06-15')).toBe('15/06/1990')
        })

        it('formatToDisplay handles ISO 8601 with time component', () => {
            expect(formatToDisplay('2000-12-25T00:00:00.000Z')).toBe('25/12/2000')
            expect(formatToDisplay('1990-06-15T14:30:45Z')).toBe('15/06/1990')
        })

        it('formatToDisplay returns empty string for invalid input', () => {
            expect(formatToDisplay('invalid')).toBe('')
            expect(formatToDisplay('')).toBe('')
            expect(formatToDisplay('not-a-date')).toBe('')
        })

        // Tests for getDateErrorMessage
        it('getDateErrorMessage returns empty string for valid dates', () => {
            expect(getDateErrorMessage('25/12/2000')).toBe('')
            expect(getDateErrorMessage('01/01/2024')).toBe('')
        })

        it('getDateErrorMessage returns format error for invalid format', () => {
            const error = getDateErrorMessage('2000-12-25')
            expect(error).toContain('format')
            expect(error).toContain('dd/mm/yyyy')
        })

        it('getDateErrorMessage returns month error for invalid month', () => {
            const error = getDateErrorMessage('15/13/2000')
            expect(error).toContain('Month')
        })

        it('getDateErrorMessage returns day error for invalid day', () => {
            const error = getDateErrorMessage('31/02/2000')
            expect(error).toContain('day')
        })

        it('getDateErrorMessage returns empty string for empty input', () => {
            expect(getDateErrorMessage('')).toBe('')
        })

        // Integration tests
        it('parseFromInput and formatToDisplay are reversible', () => {
            const original = '15/06/1990'
            const iso = parseFromInput(original)
            expect(iso).not.toBeNull()
            const formatted = formatToDisplay(iso!)
            expect(formatted).toBe(original)
        })

        it('handles edge case dates correctly', () => {
            const leap = parseFromInput('29/02/2000')
            expect(leap).toBe('2000-02-29')

            const nonLeap = parseFromInput('29/02/2001')
            expect(nonLeap).toBe(null)
        })
    })

    // Tests for Link Creation Manager
    describe('Link Creation Manager', () => {
        const mockElements = [
            { id: '1', name: 'Node 1', type: 'Person', description: '' },
            { id: '2', name: 'Node 2', type: 'Person', description: '' },
            { id: '3', name: 'Node 3', type: 'Person', description: '' }
        ]

        const mockRelationships = [
            { id: 'r1', source: '1', target: '2', type: 'Father', description: '' }
        ]

        const mockContext = {
            elements: mockElements,
            relationships: mockRelationships
        }

        // Tests for validateLinkCreation
        it('validateLinkCreation allows valid links between different nodes', () => {
            const result = validateLinkCreation('1', '3', mockContext)
            expect(result.valid).toBe(true)
            expect(result.error).toBeUndefined()
        })

        it('validateLinkCreation rejects self-links', () => {
            const result = validateLinkCreation('1', '1', mockContext)
            expect(result.valid).toBe(false)
            expect(result.error).toContain('self')
        })

        it('validateLinkCreation rejects links when source node does not exist', () => {
            const result = validateLinkCreation('nonexistent', '2', mockContext)
            expect(result.valid).toBe(false)
            expect(result.error).toContain('not exist')
        })

        it('validateLinkCreation rejects links when target node does not exist', () => {
            const result = validateLinkCreation('1', 'nonexistent', mockContext)
            expect(result.valid).toBe(false)
            expect(result.error).toContain('not exist')
        })

        it('validateLinkCreation rejects duplicate links', () => {
            const result = validateLinkCreation('1', '2', mockContext)
            expect(result.valid).toBe(false)
            expect(result.error).toContain('already exists')
        })

        it('validateLinkCreation detects bidirectional duplicate links', () => {
            const contextWithBiLink = {
                elements: mockElements,
                relationships: [
                    { id: 'r1', source: '1', target: '2', type: 'Father', description: '' },
                    { id: 'r2', source: '2', target: '1', type: 'Child', description: '' }
                ]
            }
            // Even though direction is different, we still detect the relationship
            const result = validateLinkCreation('2', '1', contextWithBiLink)
            expect(result.valid).toBe(false)
        })

        // Tests for isLinkCreationTimedOut
        it('isLinkCreationTimedOut returns false for zero timestamp', () => {
            expect(isLinkCreationTimedOut(0)).toBe(false)
        })

        it('isLinkCreationTimedOut returns false for recent timestamp', () => {
            const now = Date.now()
            expect(isLinkCreationTimedOut(now)).toBe(false)
        })

        it('isLinkCreationTimedOut returns true for old timestamp', () => {
            const oldTime = Date.now() - 40000 // 40 seconds ago
            expect(isLinkCreationTimedOut(oldTime)).toBe(true)
        })

        it('isLinkCreationTimedOut respects custom timeout duration', () => {
            const time = Date.now() - 5000 // 5 seconds ago
            expect(isLinkCreationTimedOut(time, 3000)).toBe(true) // timeout is 3 seconds
            expect(isLinkCreationTimedOut(time, 10000)).toBe(false) // timeout is 10 seconds
        })
    })

    // Tests for Link Creation State Management
    describe('Link Creation State Management', () => {
        it('setLinkCreationSource activates link creation mode', async () => {
            const { result } = renderHook(() => useGraphStore())

            act(() => {
                result.current.setElements([
                    { id: '1', name: 'Node 1', type: 'Person', description: '' }
                ])
            })

            await act(async () => {
                result.current.setLinkCreationSource('1')
            })

            expect(result.current.linkCreationMode.isActive).toBe(true)
            expect(result.current.linkCreationMode.sourceNodeId).toBe('1')
            expect(result.current.linkCreationMode.timestamp).toBeGreaterThan(0)
        })

        it('completeLinkCreation deactivates link creation mode', async () => {
            const { result } = renderHook(() => useGraphStore())

            act(() => {
                result.current.setLinkCreationSource('1')
            })

            expect(result.current.linkCreationMode.isActive).toBe(true)

            act(() => {
                result.current.completeLinkCreation()
            })

            expect(result.current.linkCreationMode.isActive).toBe(false)
            expect(result.current.linkCreationMode.sourceNodeId).toBe(null)
        })

        it('cancelLinkCreation deactivates link creation mode', async () => {
            const { result } = renderHook(() => useGraphStore())

            act(() => {
                result.current.setLinkCreationSource('1')
            })

            expect(result.current.linkCreationMode.isActive).toBe(true)

            act(() => {
                result.current.cancelLinkCreation()
            })

            expect(result.current.linkCreationMode.isActive).toBe(false)
            expect(result.current.linkCreationMode.sourceNodeId).toBe(null)
        })

        it('link creation mode persists timestamp', async () => {
            const { result } = renderHook(() => useGraphStore())

            act(() => {
                result.current.setLinkCreationSource('1')
            })

            const timestamp1 = result.current.linkCreationMode.timestamp
            expect(timestamp1).toBeGreaterThan(0)

            act(() => {
                result.current.completeLinkCreation()
            })

            expect(result.current.linkCreationMode.timestamp).toBe(0)
        })
    })

    // Tests for 2D/3D Toggle and Utilities
    describe('2D/3D Toggle and Utilities', () => {
        it('is2D state should be togglable in the store', () => {
            const { result } = renderHook(() => useGraphStore())
            // Initial state might be false or true depending on setup, let's just check toggle
            const initial = result.current.is2D
            act(() => {
                result.current.setIs2D(!initial)
            })
            expect(result.current.is2D).toBe(!initial)
        })

        it('getColorForType should return correct colors from elementTypes config', () => {
            const mockElementTypes = [
                { id: '1', name: 'Person', color: '#ff0000' },
                { id: '2', name: 'Location', color: '#00ff00' }
            ]

            // Dark mode
            expect(getColorForType('Person', true, mockElementTypes)).toBe('#ff0000')
            // Light mode
            expect(getColorForType('Location', false, mockElementTypes)).toBe('#00ff00')
            // Default
            expect(getColorForType('Unknown', true, mockElementTypes)).toBe('#00ff99')
        })

        it('getColorForEdgeType should return correct colors from relationshipTypes config', () => {
            const mockRelTypes = [
                { id: '1', name: 'Father', color: '#0000ff' }
            ]

            expect(getColorForEdgeType('Father', true, mockRelTypes)).toBe('#0000ff')
            // Default dark
            expect(getColorForEdgeType('Unknown', true, mockRelTypes)).toBe('#00e5ff')
            // Default light
            expect(getColorForEdgeType('Unknown', false, mockRelTypes)).toBe('#64748b')
        })
    })
})

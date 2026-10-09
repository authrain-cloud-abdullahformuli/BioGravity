import { describe, expect, it } from 'vitest'
import { canEdit, isAdmin } from '@/lib/roles'

describe('project role helpers', () => {
    it('allows Admin to manage admin-only areas', () => {
        expect(isAdmin('Admin')).toBe(true)
        expect(isAdmin('Editor')).toBe(false)
        expect(isAdmin('Viewer')).toBe(false)
        expect(isAdmin(null)).toBe(false)
    })

    it('allows Editor and Admin to edit project data', () => {
        expect(canEdit('Admin')).toBe(true)
        expect(canEdit('Editor')).toBe(true)
        expect(canEdit('Viewer')).toBe(false)
        expect(canEdit(null)).toBe(false)
    })
})

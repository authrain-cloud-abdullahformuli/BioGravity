import { describe, it, expect, afterEach } from 'vitest'
import { isReadOnlyDemoAccount } from '@/lib/demo-mode'

const setDemoEmail = (value?: string) => {
    if (value === undefined) delete process.env.DEMO_READONLY_EMAIL
    else process.env.DEMO_READONLY_EMAIL = value
}

describe('isReadOnlyDemoAccount', () => {
    afterEach(() => setDemoEmail(undefined))

    it('is inert when DEMO_READONLY_EMAIL is unset', () => {
        setDemoEmail(undefined)
        expect(isReadOnlyDemoAccount('demo@example.com')).toBe(false)
    })

    it('is inert when DEMO_READONLY_EMAIL is blank', () => {
        setDemoEmail('   ')
        expect(isReadOnlyDemoAccount('demo@example.com')).toBe(false)
    })

    it('matches the configured account', () => {
        setDemoEmail('demo@example.com')
        expect(isReadOnlyDemoAccount('demo@example.com')).toBe(true)
    })

    it('matches case-insensitively and ignores surrounding whitespace', () => {
        setDemoEmail('Demo@Example.com')
        expect(isReadOnlyDemoAccount('  demo@example.com  ')).toBe(true)
    })

    it('does not match other accounts', () => {
        setDemoEmail('demo@example.com')
        expect(isReadOnlyDemoAccount('curator@example.com')).toBe(false)
    })

    it('does not match a missing email', () => {
        setDemoEmail('demo@example.com')
        expect(isReadOnlyDemoAccount(null)).toBe(false)
        expect(isReadOnlyDemoAccount(undefined)).toBe(false)
    })
})

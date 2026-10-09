import { vi } from 'vitest'

/**
 * Shared mock for `Resend#emails.send` so the same `vi.fn()` instance is
 * visible to both `src/tests/setup.ts` (which wires it into the mocked SDK)
 * and individual test files (which need to assert on its calls).
 */
export const resendSendMock = vi.fn()

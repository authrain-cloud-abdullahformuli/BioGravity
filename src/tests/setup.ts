import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next-auth
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}))

// Mock Resend SDK so no test ever talks to the network.
// The mock fn lives in src/tests/mocks/resend-send.ts so test files can import
// it without coupling to setup.ts internals.
vi.mock('resend', async () => {
    const { resendSendMock } = await import('./mocks/resend-send')
    return {
        Resend: class {
            emails = { send: resendSendMock }
        },
    }
})

// Create mock object
const mockPrismaInstance = {
    user: {
        findUnique: vi.fn(),
        update: vi.fn(),
    },
    projectMember: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
    },
    project: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
    },
    projectInvite: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
    },
    element: {
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        createMany: vi.fn(),
    },
    relationship: {
        createMany: vi.fn(),
    },
    changeLog: {
        create: vi.fn(),
    },
    rateLimitBucket: {
        // Default: every check returns no existing bucket, i.e. the request is allowed.
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn(async (arg: unknown) => {
        if (typeof arg === 'function') {
            return await (arg as (tx: typeof mockPrismaInstance) => unknown)(mockPrismaInstance)
        }
        // Array form: $transaction([op1, op2]) — just await each in order
        if (Array.isArray(arg)) {
            return Promise.all(arg)
        }
        return arg
    }),
}

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: mockPrismaInstance,
}))

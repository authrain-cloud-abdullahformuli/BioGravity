import { Prisma } from "@prisma/client"
import type { PrismaClient } from "@prisma/client"
import prisma from "@/lib/prisma"

export type ChangeAction = "CREATE" | "UPDATE" | "DELETE"
export type ChangeEntityType = "Element" | "Relationship" | "Import"

interface RecordChangeArgs {
    projectId: string
    userId: string
    action: ChangeAction
    entityType: ChangeEntityType
    entityId: string
    entityName?: string | null
    previousState?: unknown
    newState?: unknown
}

type PrismaTransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">

/**
 * Persists a ChangeLog row for an audited mutation. Centralised here so callers
 * don't have to remember the (action, entityType, previousState, newState)
 * conventions or repeat the as-any Prisma.JsonValue cast.
 *
 * Accepts an optional Prisma transaction client so callers that already opened
 * a transaction can write the changelog atomically with the mutation itself.
 */
export async function recordChange(
    args: RecordChangeArgs,
    tx?: PrismaTransactionClient
): Promise<void> {
    const client = tx ?? prisma
    await client.changeLog.create({
        data: {
            projectId: args.projectId,
            userId: args.userId,
            action: args.action,
            entityType: args.entityType,
            entityId: args.entityId,
            entityName: args.entityName ?? undefined,
            previousState: args.previousState === undefined
                ? Prisma.DbNull
                : (args.previousState as Prisma.InputJsonValue),
            newState: args.newState === undefined
                ? Prisma.DbNull
                : (args.newState as Prisma.InputJsonValue),
        },
    })
}

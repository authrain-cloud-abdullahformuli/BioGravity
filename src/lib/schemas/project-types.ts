import { z } from "zod"

// Element / Relationship type entries are persisted as JSON columns on Project.
// Until those columns are migrated to proper relations, these schemas are the
// single source of truth for shape — used on read AND write so untyped any[]
// casts can disappear.

export const ElementTypeSchema = z.object({
    name: z.string().min(1).max(200),
    color: z.string().min(1).max(40),
})

export const RelationshipTypeSchema = z.object({
    name: z.string().min(1).max(200),
    color: z.string().min(1).max(40),
    strength: z.number().optional(),
})

export type ElementType = z.infer<typeof ElementTypeSchema>
export type RelationshipType = z.infer<typeof RelationshipTypeSchema>

export const ElementTypeArraySchema = z.array(ElementTypeSchema)
export const RelationshipTypeArraySchema = z.array(RelationshipTypeSchema)

/**
 * Read an `elementTypes` JSON column with a safety net: on shape mismatch
 * return [] rather than throw, so a corrupt row doesn't take down a route.
 */
export function parseElementTypes(value: unknown): ElementType[] {
    const parsed = ElementTypeArraySchema.safeParse(value)
    return parsed.success ? parsed.data : []
}

export function parseRelationshipTypes(value: unknown): RelationshipType[] {
    const parsed = RelationshipTypeArraySchema.safeParse(value)
    return parsed.success ? parsed.data : []
}

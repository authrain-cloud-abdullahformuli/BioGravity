export const PROJECT_TYPES = ["Family", "Organization"] as const

export type ProjectType = typeof PROJECT_TYPES[number]

export const PROJECT_TYPE_DEFAULTS: Record<ProjectType, {
    elementTypes: Array<{ name: string; color: string }>
    relationshipTypes: Array<{ name: string; color: string; directional: boolean }>
}> = {
    Family: {
        elementTypes: [
            { name: "Person", color: "#3b82f6" },
            { name: "Pet", color: "#f59e0b" },
        ],
        relationshipTypes: [
            { name: "Parent/Child", color: "#64748b", directional: true },
            { name: "Partner", color: "#ec4899", directional: false },
            { name: "Sibling", color: "#8b5cf6", directional: false },
            { name: "Owner/Pet", color: "#22c55e", directional: true },
        ],
    },
    Organization: {
        elementTypes: [
            { name: "Person", color: "#3b82f6" },
            { name: "Company", color: "#14b8a6" },
            { name: "Department", color: "#f59e0b" },
            { name: "Team", color: "#8b5cf6" },
        ],
        relationshipTypes: [
            { name: "Direct Report", color: "#64748b", directional: true },
            { name: "Indirect Report", color: "#94a3b8", directional: true },
        ],
    },
}

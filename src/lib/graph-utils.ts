export function getColorForType(type: string, isDark: boolean, configuredTypes: any[] = []): string {
    const config = configuredTypes.find(t => t.name === type)
    if (config?.color) return config.color

    if (isDark) {
        if (type === 'Person') return '#00e5ff'
        if (type === 'Event') return '#ff00e5'
        if (type === 'Location') return '#bd00ff'
        if (type === 'Pet') return '#00ff99'
        return '#00ff99'
    }
    if (type === 'Person') return '#0ea5e9'
    if (type === 'Event') return '#d946ef'
    if (type === 'Location') return '#a855f7'
    if (type === 'Pet') return '#14b8a6'
    return '#14b8a6'
}

export function getColorForEdgeType(type: string, isDark: boolean, configuredTypes: any[] = []): string {
    const config = configuredTypes.find(t => t.name === type)
    if (config?.color) return config.color

    if (isDark) {
        if (type === 'Father' || type === 'Parent') return '#60a5fa' // Blue
        if (type === 'Mother') return '#f472b6' // Pink
        if (type === 'Spouse' || type === 'Partner') return '#34d399' // Green
        if (type === 'Child') return '#fbbf24' // Yellow
        if (type === 'Sibling') return '#a78bfa' // Purple
        return '#00e5ff'
    }
    if (type === 'Father' || type === 'Parent') return '#2563eb'
    if (type === 'Mother') return '#db2777'
    if (type === 'Spouse' || type === 'Partner') return '#059669'
    if (type === 'Child') return '#d97706'
    if (type === 'Sibling') return '#7c3aed'
    return '#64748b'
}

"use client"

import { useGraphStore } from '@/store/use-graph-store'
import { useEffect, useState } from 'react'

export function LinkCreationIndicator() {
    const { linkCreationMode, cancelLinkCreation, elements } = useGraphStore()
    const [showTimeout, setShowTimeout] = useState(false)

    // Monitor for timeout (30 seconds of inactivity)
    useEffect(() => {
        if (!linkCreationMode.isActive || linkCreationMode.timestamp === 0) {
            setShowTimeout(false)
            return
        }

        const timeoutId = setInterval(() => {
            const elapsed = Date.now() - linkCreationMode.timestamp
            if (elapsed > 30000) {
                setShowTimeout(true)
                cancelLinkCreation()
            }
        }, 1000)

        return () => clearInterval(timeoutId)
    }, [linkCreationMode, cancelLinkCreation])

    if (!linkCreationMode.isActive) return null

    const sourceNode = elements.find(el => el.id === linkCreationMode.sourceNodeId)

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto">
            <div className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 backdrop-blur-md border border-blue-400">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="font-semibold text-sm">
                        {showTimeout ? (
                            'Link creation timed out'
                        ) : (
                            <>
                                Linking from <em className="not-italic font-bold">{sourceNode?.name || 'node'}</em>
                                <span className="mx-1">•</span>
                                Click another node to complete
                            </>
                        )}
                    </span>
                </div>
                <button
                    onClick={() => cancelLinkCreation()}
                    className="ml-2 text-white hover:bg-blue-600 rounded px-2 py-1 text-xs font-medium transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}

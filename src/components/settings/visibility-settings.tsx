"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Copy, Globe, Lock, Link2, RefreshCw } from "lucide-react"

interface VisibilitySettingsProps {
    projectId: string
    initialVisibility: string
    initialShareToken: string | null
}

export function VisibilitySettings({
    projectId,
    initialVisibility,
    initialShareToken
}: VisibilitySettingsProps) {
    const [visibility, setVisibility] = useState(initialVisibility)
    const [shareToken, setShareToken] = useState(initialShareToken)
    const [saving, setSaving] = useState(false)
    const [copied, setCopied] = useState(false)

    const isPublic = visibility === "Public"

    const getShareUrl = () => {
        if (typeof window === 'undefined') return ''
        return `${window.location.origin}/public/${shareToken || projectId}`
    }

    const handleToggleVisibility = async () => {
        const newVisibility = isPublic ? "Private" : "Public"
        setSaving(true)

        try {
            const res = await fetch(`/api/projects/${projectId}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visibility: newVisibility })
            })

            if (res.ok) {
                const data = await res.json()
                setVisibility(newVisibility)
                if (data.shareToken) {
                    setShareToken(data.shareToken)
                }
            }
        } catch (error) {
            console.error('Failed to update visibility:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleRegenerateToken = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/projects/${projectId}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ regenerateToken: true })
            })

            if (res.ok) {
                const data = await res.json()
                setShareToken(data.shareToken)
            }
        } catch (error) {
            console.error('Failed to regenerate token:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(getShareUrl())
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const getEmbedCode = () => {
        const url = getShareUrl()
        return `<iframe src="${url}?embed=true" width="100%" height="600" frameborder="0"></iframe>`
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                    Visibility & Sharing
                </CardTitle>
                <CardDescription>
                    Control who can view your project
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Visibility Toggle */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="visibility">Public Access</Label>
                        <p className="text-sm text-muted-foreground">
                            {isPublic
                                ? "Anyone with the link can view this project"
                                : "Only team members can access this project"}
                        </p>
                    </div>
                    <Switch
                        id="visibility"
                        checked={isPublic}
                        onCheckedChange={handleToggleVisibility}
                        disabled={saving}
                    />
                </div>

                {/* Share Link (only when public) */}
                {isPublic && shareToken && (
                    <>
                        <div className="space-y-2">
                            <Label>Share Link</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={getShareUrl()}
                                    readOnly
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopy}
                                >
                                    {copied ? <Link2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleRegenerateToken}
                                    disabled={saving}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Regenerating the link will invalidate the previous one
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Embed Code</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={getEmbedCode()}
                                    readOnly
                                    className="flex-1 font-mono text-xs"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        navigator.clipboard.writeText(getEmbedCode())
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Paste this code into your website to embed the graph
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

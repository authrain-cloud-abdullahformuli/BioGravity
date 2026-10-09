"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, UserPlus, Shield, Copy, Check, Mail, Send, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Member {
    id: string
    userId: string
    role: string
    user: {
        name: string | null
        email: string | null
        image: string | null
    }
}

interface PendingInvite {
    id: string
    email: string
    role: string
    expiresAt: string
    url?: string
    lastSentAt?: string | null
    sendFailureCount?: number
    lastSendError?: string | null
    send?: { ok: boolean; messageId?: string; error?: string }
}

type DeliveryStatus = "sent" | "failed" | "not-sent"

function deliveryStatus(invite: PendingInvite): DeliveryStatus {
    if (invite.send) {
        return invite.send.ok ? "sent" : "failed"
    }
    if (invite.sendFailureCount && invite.sendFailureCount > 0) return "failed"
    if (invite.lastSentAt) return "sent"
    return "not-sent"
}

function DeliveryChip({ status }: { status: DeliveryStatus }) {
    if (status === "sent") {
        return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Sent</span>
    }
    if (status === "failed") {
        return (
            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/15 text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Failed
            </span>
        )
    }
    return <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Not sent</span>
}

interface MemberListProps {
    projectId: string
    initialMembers: Member[]
    initialInvites: PendingInvite[]
    currentUserId: string
    isOwner: boolean
}

export function MemberList({ projectId, initialMembers, initialInvites, currentUserId, isOwner }: MemberListProps) {
    const [members, setMembers] = useState<Member[]>(initialMembers)
    const [invites, setInvites] = useState<PendingInvite[]>(initialInvites)
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null)
    const [resendingInviteId, setResendingInviteId] = useState<string | null>(null)
    const router = useRouter()

    const handleAddMember = async () => {
        if (!email.trim()) return

        setLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/projects/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    email,
                    role: "Editor",
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to add member")
            }

            if (data.status === "added") {
                setMembers([...members, data.member])
            } else if (data.status === "invited") {
                setInvites([...invites, data.invite])
            }
            setEmail("")
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add member")
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveMember = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this member?")) return

        try {
            const res = await fetch("/api/projects/members", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId, userId })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to remove member")
            }

            setMembers(members.filter(m => m.userId !== userId))
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to remove member")
        }
    }

    const handleRevokeInvite = async (inviteId: string) => {
        if (!confirm("Revoke this invitation? The link will stop working immediately.")) return

        try {
            const res = await fetch(`/api/projects/${projectId}/invites/${inviteId}`, { method: "DELETE" })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to revoke invite")
            }
            setInvites(invites.filter(i => i.id !== inviteId))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to revoke invite")
        }
    }

    const handleCopyInvite = async (invite: PendingInvite) => {
        if (!invite.url) return
        try {
            await navigator.clipboard.writeText(invite.url)
            setCopiedInviteId(invite.id)
            setTimeout(() => setCopiedInviteId(null), 2000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to copy link")
        }
    }

    const handleResendInvite = async (invite: PendingInvite) => {
        setResendingInviteId(invite.id)
        setError(null)
        try {
            const res = await fetch(`/api/projects/${projectId}/invites/${invite.id}/resend`, { method: "POST" })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || "Failed to resend invitation")
            }
            setInvites(invites.map(i =>
                i.id === invite.id ? { ...i, send: data.send, sendFailureCount: data.send.ok ? 0 : (i.sendFailureCount ?? 0) + 1 } : i
            ))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to resend invitation")
        } finally {
            setResendingInviteId(null)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                    Manage who has access to this project.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex gap-2 items-end">
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="email">Add Member by Email</Label>
                        <Input
                            id="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAddMember} disabled={loading}>
                        {loading ? "Adding..." : <UserPlus className="h-4 w-4" />}
                    </Button>
                </div>

                <div className="space-y-4">
                    {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={member.user.image || ""} />
                                    <AvatarFallback>{member.user.name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">{member.user.name || "Unknown User"}</p>
                                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                                    {member.role}
                                </span>
                                {(isOwner && member.userId !== currentUserId) && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                                        onClick={() => handleRemoveMember(member.userId)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                                {member.userId === currentUserId && isOwner && (
                                    <Shield className="h-4 w-4 text-primary" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {invites.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Pending invitations
                        </h4>
                        <div className="space-y-2">
                            {invites.map((invite) => {
                                const status = deliveryStatus(invite)
                                return (
                                    <div key={invite.id} className="flex items-center justify-between p-3 border border-dashed rounded-md">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm">{invite.email}</p>
                                                <DeliveryChip status={status} />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Expires {new Date(invite.expiresAt).toLocaleDateString()} · {invite.role}
                                            </p>
                                            {status === "failed" && invite.lastSendError && (
                                                <p className="text-xs text-destructive">{invite.lastSendError}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleResendInvite(invite)}
                                                disabled={resendingInviteId === invite.id}
                                                title="Resend email"
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                            {invite.url && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleCopyInvite(invite)}
                                                    title="Copy invite link"
                                                >
                                                    {copiedInviteId === invite.id
                                                        ? <Check className="h-4 w-4 text-primary" />
                                                        : <Copy className="h-4 w-4" />}
                                                </Button>
                                            )}
                                            {isOwner && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                                                    onClick={() => handleRevokeInvite(invite.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

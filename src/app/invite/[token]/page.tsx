import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { inviteStatus, normalizeEmail } from "@/lib/invites"
import { AcceptInviteForm } from "./accept-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface InvitePageProps {
    params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
    const { token } = await params

    const invite = await prisma.projectInvite.findUnique({
        where: { token },
        include: { project: { select: { id: true, name: true } } },
    })

    if (!invite) {
        return (
            <Shell title="Invitation not found">
                <Alert variant="destructive">
                    <AlertDescription>This invitation link is invalid.</AlertDescription>
                </Alert>
            </Shell>
        )
    }

    const status = inviteStatus(invite)
    if (status !== "pending") {
        return (
            <Shell title="Invitation unavailable">
                <Alert variant="destructive">
                    <AlertDescription>
                        This invitation is {status}. Ask the project owner to send a fresh one.
                    </AlertDescription>
                </Alert>
            </Shell>
        )
    }

    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
        const next = `/invite/${token}`
        const params = new URLSearchParams({ next, email: invite.email })
        const signupUrl = `/signup?${params.toString()}`
        const loginUrl = `/login?${params.toString()}`

        return (
            <Shell title={`Join ${invite.project.name}`}>
                <p className="text-sm text-muted-foreground">
                    You&apos;ve been invited to join <strong>{invite.project.name}</strong> as <strong>{invite.role}</strong>.
                </p>
                <p className="text-sm">
                    Sign in or create an account using <strong>{invite.email}</strong> to accept.
                </p>
                <div className="flex gap-2">
                    <Button asChild className="flex-1">
                        <Link href={signupUrl}>Create account</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                        <Link href={loginUrl}>Sign in</Link>
                    </Button>
                </div>
            </Shell>
        )
    }

    const sessionEmail = normalizeEmail(session.user.email)
    if (sessionEmail !== invite.email) {
        return (
            <Shell title="Wrong account">
                <Alert variant="destructive">
                    <AlertDescription>
                        This invitation is for <strong>{invite.email}</strong>, but you are signed in as <strong>{sessionEmail}</strong>. Sign out and back in with the invited email.
                    </AlertDescription>
                </Alert>
            </Shell>
        )
    }

    const existingMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: invite.projectId, userId: session.user.id } },
    })
    if (existingMember) {
        redirect(`/projects/${invite.projectId}`)
    }

    return (
        <Shell title={`Join ${invite.project.name}`}>
            <p className="text-sm text-muted-foreground">
                You&apos;ve been invited to join <strong>{invite.project.name}</strong> as <strong>{invite.role}</strong>.
            </p>
            <AcceptInviteForm token={token} projectId={invite.projectId} />
        </Shell>
    )
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
            <Card className="z-10 w-full max-w-md">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>Project invitation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">{children}</CardContent>
            </Card>
        </main>
    )
}

import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Briefcase } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { SchemaEditor } from "@/components/projects/schema-editor"
import { MemberList } from "@/components/projects/member-list"
import { DangerZone } from "@/components/settings/danger-zone"
import { VisibilitySettings } from "@/components/settings/visibility-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { inviteStatus } from "@/lib/invites"

interface SettingsPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/login")
    }

    const { id } = await params

    const project = await prisma.project.findUnique({
        where: {
            id,
        },
        include: {
            members: {
                include: {
                    user: true
                }
            },
            invites: { orderBy: { createdAt: "desc" } },
        },
    })

    if (!project) {
        notFound()
    }

    const pendingInvites = project.invites
        .filter(i => inviteStatus(i) === "pending")
        .map(i => ({
            id: i.id,
            email: i.email,
            role: i.role,
            expiresAt: i.expiresAt.toISOString(),
            lastSentAt: i.lastSentAt ? i.lastSentAt.toISOString() : null,
            sendFailureCount: i.sendFailureCount,
            lastSendError: i.lastSendError,
        }))

    const isOwner = project.ownerId === session.user.id
    const isProjectAdmin = project.members.some(
        member => member.userId === session.user.id && member.role === "Admin"
    )
    const canManageSettings = isOwner || isProjectAdmin

    if (!canManageSettings) {
        redirect(`/projects/${project.id}`)
    }

    return (
        <div className="container max-w-4xl py-10 px-4 md:px-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/projects/${project.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground">
                            Manage your project preferences.
                        </p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="project" className="space-y-6">
                <TabsList className="grid w-full grid-cols-1 max-w-sm">
                    <TabsTrigger value="project" className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Project
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="project" className="space-y-8 animate-in fade-in duration-300">
                    <div>
                        <h3 className="text-lg font-medium">Schema Configuration</h3>
                        <p className="text-sm text-muted-foreground">
                            Define the types of elements and relationships allowed in this project.
                        </p>
                        <Separator className="my-4" />

                        <div className="grid gap-6 md:grid-cols-2">
                            <SchemaEditor
                                projectId={project.id}
                                initialTypes={Array.isArray(project.elementTypes) ? (project.elementTypes as any[]) : []}
                                schemaType="element"
                                title="Element Types"
                                description="Nodes in your graph (e.g. Person, Event)."
                            />
                            <SchemaEditor
                                projectId={project.id}
                                initialTypes={Array.isArray(project.relationshipTypes) ? (project.relationshipTypes as any[]) : []}
                                schemaType="relationship"
                                title="Relationship Types"
                                description="Connections between nodes (e.g. Friend, Parent)."
                            />
                        </div>
                    </div>

                    <VisibilitySettings
                        projectId={project.id}
                        initialVisibility={project.visibility}
                        initialShareToken={project.shareToken}
                    />

                    <div>
                        <h3 className="text-lg font-medium">Team Members</h3>
                        <p className="text-sm text-muted-foreground">
                            Manage who has access to this project.
                        </p>
                        <Separator className="my-4" />
                        <MemberList
                            projectId={project.id}
                            initialMembers={project.members}
                            initialInvites={pendingInvites}
                            currentUserId={session.user.id}
                            isOwner={canManageSettings}
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                        <Separator className="my-4" />
                        <DangerZone projectId={project.id} projectName={project.name} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

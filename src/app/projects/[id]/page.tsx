import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Settings, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { GraphCanvas } from "@/components/graph/graph-canvas"
import { SeedButton } from "@/components/projects/seed-button"
import { PrintscreenButton } from "@/components/projects/printscreen-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataView } from "@/components/projects/data-view"
import { HistoryTab } from "@/components/projects/history-tab"

interface ProjectPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
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
            owner: true,
            members: true,
            _count: {
                select: { elements: true, relationships: true },
            },
        },
    })

    if (!project) {
        notFound()
    }

    // Check if user is a member or owner
    const membership = project.members.find((m) => m.userId === session.user.id)
    const isMember = !!membership
    const isOwner = project.ownerId === session.user.id

    if (!isMember && !isOwner) {
        redirect("/dashboard")
    }

    // Determine user's role and permissions
    const userRole = isOwner ? "Admin" : (membership?.role || "Viewer")
    const canEdit = userRole === "Admin" || userRole === "Editor"
    const isAdmin = userRole === "Admin" || isOwner

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)]">
            <header className="flex items-center justify-between border-b px-6 py-3 bg-background z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold">{project.name}</h1>
                        <p className="text-xs text-muted-foreground">{project.type}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {canEdit && project._count.elements === 0 && (
                        <SeedButton projectId={project.id} />
                    )}
                    <PrintscreenButton />
                    {isAdmin && (
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/projects/${project.id}/settings`}>
                                <Settings className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </div>
            </header>

            <main className="flex-1 relative overflow-hidden flex flex-col min-h-0">
                <Tabs defaultValue="graph" className="flex-1 flex flex-col min-h-0">
                    <div className="border-b px-6">
                        <TabsList className="bg-transparent h-12 w-full justify-start gap-6 p-0">
                            <TabsTrigger
                                value="graph"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2"
                            >
                                Graph View
                            </TabsTrigger>
                            <TabsTrigger
                                value="data"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2"
                            >
                                Data View
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2"
                            >
                                History
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="graph" className="flex-1 relative m-0 data-[state=inactive]:hidden h-full">
                        <GraphCanvas projectId={project.id} canEdit={canEdit} />
                    </TabsContent>

                    <TabsContent value="data" className="flex-1 relative m-0 data-[state=inactive]:hidden overflow-hidden bg-muted/10 min-h-0 h-full">
                        <DataView canEdit={canEdit} projectId={project.id} />
                    </TabsContent>

                    <TabsContent value="history" className="flex-1 relative m-0 data-[state=inactive]:hidden overflow-hidden bg-muted/10 min-h-0 h-full">
                        <HistoryTab projectId={project.id} canEdit={canEdit} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}

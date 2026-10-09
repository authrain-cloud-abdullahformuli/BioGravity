import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Users, Share2 } from "lucide-react"
import { NewProjectDialog } from "@/components/dashboard/new-project-dialog"
import { isReadOnlyDemoAccount } from "@/lib/demo-mode"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default async function Dashboard() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/login")
    }

    // Matches the server-side guard on POST /api/projects — don't offer an
    // action the API will refuse.
    const readOnlyDemo = isReadOnlyDemoAccount(session.user.email)

    const projects = await prisma.project.findMany({
        where: {
            OR: [
                { ownerId: session.user.id },
                { members: { some: { userId: session.user.id } } },
            ],
        },
        include: {
            _count: { select: { elements: true, members: true } },
        },
        orderBy: { updatedAt: 'desc' },
    })

    return (
        <main className="container py-10 px-4 md:px-8">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Welcome back, {session.user.name || "User"}! Manage your relationship mapping projects.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    {!readOnlyDemo && <NewProjectDialog />}
                </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.length === 0 ? (
                    <div className="col-span-full rounded-lg border bg-card text-card-foreground shadow-sm p-12 flex flex-col items-center justify-center border-dashed">
                        <h3 className="text-lg font-semibold">No projects yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-sm mt-2">
                            Create your first project to start mapping relationships.
                        </p>
                        {!readOnlyDemo && (
                            <div className="mt-6">
                                <NewProjectDialog />
                            </div>
                        )}
                    </div>
                ) : (
                    projects.map((project) => (
                        <Card key={project.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{project.name}</CardTitle>
                                <CardDescription>{project.description || "No description"}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <Share2 className="mr-1 h-3 w-3" />
                                        {project._count.elements} Elements
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="mr-1 h-3 w-3" />
                                        {project._count.members} Members
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                                    {project.type}
                                </span>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/projects/${project.id}`}>Open</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </main>
    )
}

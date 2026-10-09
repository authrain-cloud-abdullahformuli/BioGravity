import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { PublicGraphView } from "@/components/graph/public-graph-view"

interface PublicProjectPageProps {
    params: Promise<{
        token: string
    }>
    searchParams: Promise<{
        embed?: string
    }>
}

export default async function PublicProjectPage({ params, searchParams }: PublicProjectPageProps) {
    const { token } = await params
    const { embed } = await searchParams

    const isEmbed = embed === 'true'

    // Find project by share token
    const project = await prisma.project.findFirst({
        where: {
            shareToken: token,
            visibility: "Public"
        },
        include: {
            elements: true,
            relationships: true
        }
    })

    if (!project) {
        notFound()
    }

    // Transform elements and relationships for the graph
    const elements = project.elements.map(e => ({
        id: e.id,
        name: e.name,
        type: e.type,
        description: e.description,
    }))

    const relationships = project.relationships.map(r => ({
        id: r.id,
        source: r.fromId,
        target: r.toId,
        type: r.type,
    }))

    return (
        <div className={isEmbed ? "w-full h-full" : "min-h-screen bg-background"}>
            {!isEmbed && (
                <div className="container py-4">
                    <h1 className="text-2xl font-bold">{project.name}</h1>
                    {project.description && (
                        <p className="text-muted-foreground">{project.description}</p>
                    )}
                </div>
            )}
            <div className={isEmbed ? "w-full h-full" : "container h-[calc(100vh-120px)]"}>
                <PublicGraphView
                    elements={elements}
                    relationships={relationships}
                    isEmbed={isEmbed}
                />
            </div>
        </div>
    )
}

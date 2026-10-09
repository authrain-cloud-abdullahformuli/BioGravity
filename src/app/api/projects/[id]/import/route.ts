import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { authorizeProjectAccess } from "@/lib/roles"
import { logError } from "@/lib/logger"
import { jsonError } from "@/lib/api-errors"

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

export async function POST(req: Request, { params }: RouteParams) {
    const { id: projectId } = await params

    try {
        const access = await authorizeProjectAccess(projectId, "Editor")
        if (!access.ok) return access.response

        const formData = await req.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        }

        // Gate on extension + size before parsing. Don't trust the browser-supplied MIME alone;
        // legitimate XLSX clients sometimes send octet-stream.
        const MAX_SIZE = 5 * 1024 * 1024
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "File too large (5MB max)" }, { status: 400 })
        }
        if (!file.name.toLowerCase().endsWith(".xlsx")) {
            return NextResponse.json({ error: "Only .xlsx files are accepted" }, { status: 400 })
        }

        // Lazy-load the XLSX parser — keeps it out of the shared route bundle.
        const XLSX = await import("xlsx")

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const wb = XLSX.read(buffer, { type: "buffer" })

        const elementsSheet = wb.Sheets["Elements"]
        let createdElementsCount = 0
        if (elementsSheet) {
            const elementsData = XLSX.utils.sheet_to_json(elementsSheet) as any[]

            const validElements = elementsData.filter(e => e.name && e.type)

            if (validElements.length > 0) {
                await prisma.$transaction(
                    validElements.map(e => {
                        const { id, name, type, description, dateOfBirth } = e

                        const data = {
                            projectId,
                            name: String(name),
                            type: String(type),
                            description: description ? String(description) : null,
                            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                        }

                        if (id) {
                            return prisma.element.upsert({
                                where: { id: String(id) },
                                update: {
                                    name: String(name),
                                    type: String(type),
                                    description: description ? String(description) : null,
                                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                                },
                                create: {
                                    id: String(id),
                                    projectId,
                                    name: String(name),
                                    type: String(type),
                                    description: description ? String(description) : null,
                                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                                }
                            })
                        } else {
                            return prisma.element.create({ data })
                        }
                    })
                )
                createdElementsCount = validElements.length
            }
        }

        const relationshipsSheet = wb.Sheets["Relationships"]
        let createdRelationshipsCount = 0
        if (relationshipsSheet) {
            const relationshipsData = XLSX.utils.sheet_to_json(relationshipsSheet) as any[]

            const validRelationships = relationshipsData.filter(r => r.source && r.target && r.type)

            if (validRelationships.length > 0) {
                await prisma.$transaction(
                    validRelationships.map(r => {
                        const { id, source, target, type } = r

                        const data = {
                            projectId,
                            fromId: String(source),
                            toId: String(target),
                            type: String(type),
                        }

                        if (id) {
                            return prisma.relationship.upsert({
                                where: { id: String(id) },
                                update: {
                                    fromId: String(source),
                                    toId: String(target),
                                    type: String(type),
                                },
                                create: {
                                    id: String(id),
                                    projectId,
                                    fromId: String(source),
                                    toId: String(target),
                                    type: String(type),
                                }
                            })
                        } else {
                            return prisma.relationship.create({ data })
                        }
                    })
                )
                createdRelationshipsCount = validRelationships.length
            }
        }

        return NextResponse.json({
            message: "Import processing complete",
            stats: { elements: createdElementsCount, relationships: createdRelationshipsCount }
        }, { status: 200 })
    } catch (error) {
        logError({ action: "project.import.xlsx", projectId }, error)
        return jsonError(500, "Internal Server Error")
    }
}

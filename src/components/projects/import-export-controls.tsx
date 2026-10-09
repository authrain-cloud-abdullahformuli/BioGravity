"use client"

import { Button } from "@/components/ui/button"
import { useGraphStore } from "@/store/use-graph-store"
import { formatDate } from "@/lib/utils"
import { Download, Upload } from "lucide-react"
import { useRef } from "react"
import { useParams } from "next/navigation"
import * as XLSX from "xlsx"

export function ImportExportControls() {
    const { elements, relationships, fetchGraphData } = useGraphStore()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const params = useParams<{ id: string }>()
    const projectId = params?.id ?? ''

    const handleExport = () => {
        const wb = XLSX.utils.book_new()

        // Elements Sheet
        const elementsData = elements.map(e => ({
            id: e.id,
            name: e.name,
            type: e.type,
            description: e.description,
            dateOfBirth: e.dateOfBirth ? formatDate(e.dateOfBirth) : null,
        }))
        const wsElements = XLSX.utils.json_to_sheet(elementsData)
        XLSX.utils.book_append_sheet(wb, wsElements, "Elements")

        // Relationships Sheet
        const relationshipsData = relationships.map(r => ({
            id: r.id,
            source: typeof r.source === 'string' ? r.source : r.source.id,
            target: typeof r.target === 'string' ? r.target : r.target.id,
            type: r.type,
        }))
        const wsRelationships = XLSX.utils.json_to_sheet(relationshipsData)
        XLSX.utils.book_append_sheet(wb, wsRelationships, "Relationships")

        XLSX.writeFile(wb, "graph_data.xlsx")
    }

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.name.endsWith('.ged')) {
            // Handle GEDCOM Import
            const formData = new FormData()
            formData.append("file", file)

            fetch(`/api/projects/${projectId}/import/gedcom`, {
                method: "POST",
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert(`Imported ${data.imported.individuals} individuals and ${data.imported.families} families!`)
                        fetchGraphData(projectId)
                    } else {
                        alert("Import failed: " + (data.error || "Unknown error"))
                    }
                })
                .catch(err => {
                    console.error(err)
                    alert("Error importing GEDCOM file")
                })
            return
        }

        // XLSX path: stream the file straight to the server importer.
        const formData = new FormData()
        formData.append("file", file)

        fetch(`/api/projects/${projectId}/import`, {
            method: "POST",
            body: formData,
        })
            .then(res => {
                if (res.ok) {
                    alert("Excel Import successful!")
                    fetchGraphData(projectId)
                } else {
                    alert("Excel Import failed.")
                }
            })
            .catch(error => {
                console.error(error)
                alert("Error importing Excel file.")
            })
    }

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <div className="relative">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx, .xls, .csv, .ged"
                    onChange={handleImport}
                />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Import
                </Button>
            </div>
        </div>
    )
}

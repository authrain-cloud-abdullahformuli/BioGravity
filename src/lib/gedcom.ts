export interface GedcomIndividual {
    id: string
    name: string
    sex?: string
    birthDate?: string
    deathDate?: string
    notes?: string
    famc?: string // Family ID where this person is a child
    fams?: string[] // Family IDs where this person is a spouse
}

export interface GedcomFamily {
    id: string
    husbandId?: string
    wifeId?: string
    childrenIds: string[]
}

export interface GedcomData {
    individuals: GedcomIndividual[]
    families: GedcomFamily[]
}

export function parseGedcom(content: string): GedcomData {
    const lines = content.split(/\r?\n/)
    const individuals: GedcomIndividual[] = []
    const families: GedcomFamily[] = []

    let currentIndi: Partial<GedcomIndividual> | null = null
    let currentFam: Partial<GedcomFamily> | null = null
    let currentTag: string | null = null

    for (const line of lines) {
        const match = line.match(/^\s*(\d+)\s+(@\w+@|\w+)(?:\s+(.*))?$/)
        if (!match) continue

        const level = parseInt(match[1], 10)
        let tag = match[2]
        let value = match[3] || ""

        // Handle pointer-as-tag case (e.g. 0 @I1@ INDI)
        if (tag.startsWith("@") && value) {
            const temp = tag
            tag = value
            value = temp
        }

        if (level === 0) {
            // Push previous records
            if (currentIndi && currentIndi.id) individuals.push(currentIndi as GedcomIndividual)
            if (currentFam && currentFam.id) families.push(currentFam as GedcomFamily)

            currentIndi = null
            currentFam = null

            if (tag === "INDI") {
                currentIndi = { id: value.replace(/@/g, ""), fams: [] }
            } else if (tag === "FAM") {
                currentFam = { id: value.replace(/@/g, ""), childrenIds: [] }
            }
        } else if (currentIndi) {
            switch (tag) {
                case "NAME":
                    currentIndi.name = value.replace(/\//g, "").trim()
                    break
                case "SEX":
                    currentIndi.sex = value
                    break
                case "BIRT":
                case "DEAT":
                    currentTag = tag
                    break
                case "DATE":
                    if (currentTag === "BIRT") currentIndi.birthDate = value
                    if (currentTag === "DEAT") currentIndi.deathDate = value
                    break
                case "NOTE":
                    currentIndi.notes = (currentIndi.notes ? currentIndi.notes + "\n" : "") + value
                    break
                case "FAMC":
                    currentIndi.famc = value.replace(/@/g, "")
                    break
                case "FAMS":
                    currentIndi.fams = currentIndi.fams || []
                    currentIndi.fams.push(value.replace(/@/g, ""))
                    break
            }
            if (tag !== "BIRT" && tag !== "DEAT") currentTag = null
        } else if (currentFam) {
            switch (tag) {
                case "HUSB":
                    currentFam.husbandId = value.replace(/@/g, "")
                    break
                case "WIFE":
                    currentFam.wifeId = value.replace(/@/g, "")
                    break
                case "CHIL":
                    currentFam.childrenIds = currentFam.childrenIds || []
                    currentFam.childrenIds.push(value.replace(/@/g, ""))
                    break
            }
        }
    }

    // Push last records
    if (currentIndi && currentIndi.id) individuals.push(currentIndi as GedcomIndividual)
    if (currentFam && currentFam.id) families.push(currentFam as GedcomFamily)

    return { individuals, families }
}

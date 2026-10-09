"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { GraphElement } from "@/store/use-graph-store"

interface ElementComboboxProps {
    elements: GraphElement[]
    value: string | null
    onChange: (value: string | null) => void
    placeholder?: string
    disabled?: boolean
    excludeIds?: string[]
}

export function ElementCombobox({
    elements,
    value,
    onChange,
    placeholder = "Select element...",
    disabled = false,
    excludeIds = []
}: ElementComboboxProps) {
    const [open, setOpen] = React.useState(false)

    const availableElements = elements.filter(el => !excludeIds.includes(el.id))
    const selectedElement = elements.find(el => el.id === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className="w-full justify-between"
                >
                    {selectedElement ? (
                        <span className="truncate">
                            {selectedElement.name}
                            <span className="text-muted-foreground ml-2 text-xs">
                                ({selectedElement.type})
                            </span>
                        </span>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Search elements..." />
                    <CommandList>
                        <CommandEmpty>No element found.</CommandEmpty>
                        <CommandGroup>
                            {availableElements.map((element) => (
                                <CommandItem
                                    key={element.id}
                                    value={`${element.name} ${element.type}`}
                                    onSelect={() => {
                                        onChange(element.id === value ? null : element.id)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === element.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="flex-1 truncate">{element.name}</span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                        {element.type}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

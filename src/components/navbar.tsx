"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { ModeToggle } from "@/components/mode-toggle"
import { UserMenu } from "@/components/user-menu"

export function Navbar() {
    const { status } = useSession()
    const logoHref = status === "authenticated" ? "/dashboard" : "/"

    return (
        <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-4 md:px-8">
                <div className="mr-4 hidden md:flex">
                    <Link href={logoHref} className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-bold sm:inline-block">
                            BioGravity
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/dashboard"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Dashboard
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search or other items can go here */}
                    </div>
                    <nav className="flex items-center gap-2">
                        <ModeToggle />
                        <UserMenu />
                    </nav>
                </div>
            </div>
        </header>
    )
}


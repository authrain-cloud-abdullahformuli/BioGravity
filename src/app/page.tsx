"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { ThreeBackground } from "@/components/landing/ThreeBackground"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { status } = useSession()
  const [impulse, setImpulse] = useState(0)

  // Redirect if logged in
  useEffect(() => {
    if (status === "authenticated") {
      redirect("/dashboard")
    }
  }, [status])

  // Demo impulse on click for now
  const handleImpulse = () => {
    setImpulse(prev => prev + 1)
    setTimeout(() => setImpulse(prev => Math.max(0, prev - 1)), 500)
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-24 overflow-hidden">
      <ThreeBackground triggerImpulse={impulse} />

      <div className="z-10 flex flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tighter sm:text-7xl xl:text-8xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            BioGravity
          </h1>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            Interactive 3D Relationship Mapping. Visualize connections like never before.
          </p>
        </div>

        <div className="flex gap-4">
          <Button size="lg" onClick={handleImpulse} asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button size="lg" variant="outline" onClick={handleImpulse} asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

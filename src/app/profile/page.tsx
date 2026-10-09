import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ProfileForm } from "./profile-form"
import { isReadOnlyDemoAccount } from "@/lib/demo-mode"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Eye } from "lucide-react"

export default async function ProfilePage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/login")
    }

    // Matches the server-side guard on PUT /api/profile.
    const readOnlyDemo = isReadOnlyDemoAccount(session.user.email)

    return (
        <div className="container max-w-2xl py-10 px-4 md:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">
                    Manage your account settings
                </p>
            </div>

            {readOnlyDemo ? (
                <Alert>
                    <Eye className="h-4 w-4" />
                    <AlertTitle>Read-only demo account</AlertTitle>
                    <AlertDescription>
                        You are signed in as <strong>{session.user.email}</strong>, a shared
                        account that everyone exploring this instance uses. Its details cannot
                        be changed. Sign up for your own account to create and edit projects.
                    </AlertDescription>
                </Alert>
            ) : (
                <ProfileForm user={session.user} />
            )}
        </div>
    )
}

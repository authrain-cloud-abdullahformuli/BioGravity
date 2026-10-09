/**
 * Read-only demo account support.
 *
 * A public demo instance advertises one shared login. Project-level writes are
 * already governed by the role model (a Viewer cannot mutate a project), but
 * two account-level actions sit outside it and would let any visitor break the
 * demo for everyone else:
 *
 *   - `PUT /api/profile` can change the account's own email, which would
 *     rename the advertised login and lock everybody out.
 *   - `POST /api/projects` has no role gate, so visitors could fill the shared
 *     dashboard with projects they then own outright.
 *
 * Setting DEMO_READONLY_EMAIL to that shared address blocks both for that one
 * account. Leave it unset — the normal case — and every check here is a no-op.
 */
export function isReadOnlyDemoAccount(email?: string | null): boolean {
    const demoEmail = process.env.DEMO_READONLY_EMAIL?.trim()
    if (!demoEmail || !email) return false
    return email.trim().toLowerCase() === demoEmail.toLowerCase()
}

export const DEMO_READONLY_MESSAGE =
    "This is a read-only demo account. Sign up for your own account to make changes."

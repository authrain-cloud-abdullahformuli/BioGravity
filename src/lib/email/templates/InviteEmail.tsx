import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "react-email"

export interface InviteEmailProps {
    projectName: string
    inviterName: string
    role: string
    url: string
    expiresAt: Date
}

export function InviteEmail({ projectName, inviterName, role, url, expiresAt }: InviteEmailProps) {
    const expiryDate = expiresAt.toUTCString()
    return (
        <Html>
            <Head />
            <Preview>{`${inviterName} invited you to ${projectName} on BioGravity`}</Preview>
            <Body style={body}>
                <Container style={container}>
                    <Heading style={h1}>You&apos;ve been invited to BioGravity</Heading>
                    <Text style={p}>
                        {inviterName} added you to <strong>{projectName}</strong> as <strong>{role}</strong>.
                    </Text>
                    <Section style={{ textAlign: "center", margin: "32px 0" }}>
                        <Button href={url} style={button}>
                            Accept invitation
                        </Button>
                    </Section>
                    <Text style={pSmall}>
                        Or paste this link into your browser:
                        <br />
                        <a href={url} style={link}>{url}</a>
                    </Text>
                    <Hr style={hr} />
                    <Text style={pSmall}>
                        This invitation expires on <strong>{expiryDate}</strong>. If you weren&apos;t expecting it, ignore this email — the link will stop working on its own.
                    </Text>
                </Container>
            </Body>
        </Html>
    )
}

export function renderInviteText({ projectName, inviterName, role, url, expiresAt }: InviteEmailProps): string {
    return [
        "You've been invited to BioGravity",
        "",
        `${inviterName} added you to ${projectName} as ${role}.`,
        "",
        "Accept by visiting:",
        url,
        "",
        `This invitation expires on ${expiresAt.toUTCString()}.`,
        "If you weren't expecting it, ignore this email — the link will stop working on its own.",
    ].join("\n")
}

const body = { backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }
const container = { backgroundColor: "#ffffff", margin: "40px auto", padding: "32px", maxWidth: "560px", borderRadius: "8px" }
const h1 = { fontSize: "22px", color: "#0f172a", margin: "0 0 16px" }
const p = { fontSize: "15px", color: "#334155", lineHeight: "1.6" }
const pSmall = { fontSize: "13px", color: "#64748b", lineHeight: "1.6" }
const button = { backgroundColor: "#0ea5e9", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", textDecoration: "none", fontWeight: 600 }
const link = { color: "#0ea5e9", wordBreak: "break-all" as const }
const hr = { borderColor: "#e2e8f0", margin: "24px 0" }

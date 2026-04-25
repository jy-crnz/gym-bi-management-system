import {
    Html, Body, Container, Text, Heading, Button, Section, Link
} from "@react-email/components";

export const RetentionEmail = ({ name }: { name: string }) => (
    <Html>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Text style={logo}>IRONBI TERMINAL</Text>
                </Section>

                <Heading style={h1}>Stay in the game, {name}!</Heading>

                <Text style={text}>
                    Your fitness progress is a valuable asset. We noticed your current pass is reaching its temporal threshold.
                    Don't let your streak reset—renew today to maintain your performance metrics.
                </Text>

                <Button href="https://gym-bi-management-system.vercel.app" style={button}>
                    Renew Membership
                </Button>

                <Text style={footer}>
                    IronBI Gym Intelligence • Manila, PH
                </Text>
            </Container>
        </Body>
    </Html>
);

// 🏛️ STYLE TOKENS (Glassmorphism-ish)
const main = { backgroundColor: "#000", color: "#fff", fontFamily: "sans-serif" };
const container = { margin: "0 auto", padding: "40px 20px" };
const logo = { fontSize: "12px", fontWeight: "900", color: "#10b981", letterSpacing: "2px" };
const h1 = { fontSize: "32px", fontWeight: "900", italic: "true", letterSpacing: "-1px", margin: "20px 0" };
const text = { color: "#a1a1aa", lineHeight: "1.6", fontSize: "16px" };
const button = { backgroundColor: "#3b82f6", color: "#fff", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", display: "inline-block", marginTop: "20px" };
const footer = { color: "#3f3f46", fontSize: "10px", marginTop: "40px", textAlign: "center" as const, letterSpacing: "1px" };
const header = {
    padding: "20px 0",
    borderBottom: "1px solid #1a1a1a",
    marginBottom: "30px"
};
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
  Button,
  Hr,
} from "@react-email/components";

type Props = {
  firstName: string | null;
  code: string;
};

export function WinbackEmail({ firstName, code }: Props) {
  const greeting = firstName ? `Hey ${firstName},` : "Hey there,";

  return (
    <Html lang="en">
      <Head />
      <Body
        style={{
          backgroundColor: "#050508",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "32px 16px" }}>
          {/* Header */}
          <Section style={{ textAlign: "center", marginBottom: "32px" }}>
            <Text style={{ fontSize: "28px", fontWeight: "800", color: "#a855f7", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
              M3DP
            </Text>
            <Text style={{ fontSize: "12px", color: "#8888aa", margin: 0, textTransform: "uppercase", letterSpacing: "2px" }}>
              Morgan 3D Prints
            </Text>
          </Section>

          {/* Banner */}
          <Section
            style={{
              backgroundColor: "rgba(168,85,247,0.08)",
              border: "1px solid rgba(168,85,247,0.3)",
              borderRadius: "12px",
              padding: "24px",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <Text style={{ fontSize: "22px", fontWeight: "700", color: "#a855f7", margin: "0 0 10px" }}>
              {greeting} we miss you!
            </Text>
            <Text style={{ fontSize: "14px", color: "#8888aa", margin: "0 0 18px" }}>
              It&apos;s been a while since your last order. Here&apos;s 15% off to come check out what&apos;s new.
            </Text>
            <Text
              style={{
                display: "inline-block",
                fontSize: "22px",
                fontWeight: "800",
                letterSpacing: "3px",
                color: "#a855f7",
                background: "rgba(168,85,247,0.1)",
                border: "1px solid rgba(168,85,247,0.4)",
                borderRadius: "10px",
                padding: "10px 20px",
                margin: "0 0 18px",
              }}
            >
              {code}
            </Text>
            <br />
            <Button
              href="https://morgan3dokc.com/shop"
              style={{
                background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "14px",
                padding: "14px 28px",
                borderRadius: "10px",
                textDecoration: "none",
              }}
            >
              Shop Now
            </Button>
          </Section>

          <Hr style={{ borderColor: "#1e1e30", marginBottom: "20px" }} />

          <Section style={{ textAlign: "center" }}>
            <Text style={{ fontSize: "12px", color: "#8888aa", margin: "0 0 4px" }}>
              Questions? Reply to this email or visit morgan3dokc.com
            </Text>
            <Text style={{ fontSize: "11px", color: "#8888aa", margin: 0 }}>
              &copy; {new Date().getFullYear()} Morgan 3D Prints — Oklahoma City, OK
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

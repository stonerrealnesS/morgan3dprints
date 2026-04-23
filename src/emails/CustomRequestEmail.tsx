import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
  Hr,
} from "@react-email/components";

type Props = {
  name: string;
  type: string;
  description: string;
};

export function CustomRequestEmail({ name, type, description }: Props) {
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
              backgroundColor: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.3)",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <Text style={{ fontSize: "22px", fontWeight: "700", color: "#22d3ee", margin: "0 0 6px" }}>
              Request received!
            </Text>
            <Text style={{ fontSize: "13px", color: "#8888aa", margin: 0 }}>
              Hey {name} — we got your {type} request and we'll be in touch soon.
            </Text>
          </Section>

          {/* Summary */}
          <Section
            style={{
              backgroundColor: "#0d0d14",
              border: "1px solid #1e1e30",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <Text style={{ fontSize: "11px", fontWeight: "600", color: "#8888aa", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 10px" }}>
              Your Request
            </Text>
            <Text style={{ fontSize: "14px", color: "#f0f0ff", margin: "0 0 4px", fontWeight: "600" }}>
              Type: {type}
            </Text>
            <Text style={{ fontSize: "14px", color: "#8888aa", margin: 0, lineHeight: "1.6" }}>
              {description}
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: "#0d0d14",
              border: "1px solid #1e1e30",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "24px",
            }}
          >
            <Text style={{ fontSize: "13px", color: "#8888aa", margin: 0, lineHeight: "1.6" }}>
              We typically respond within 1–2 business days with a quote or follow-up questions.
              If you have anything to add, just reply to this email.
            </Text>
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

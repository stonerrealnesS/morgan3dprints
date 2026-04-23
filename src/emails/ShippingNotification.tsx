import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
  Row,
  Column,
  Hr,
} from "@react-email/components";

type Props = {
  orderId: string;
  items: { name: string; quantity: number }[];
  shippingAddress?: string;
};

export function ShippingNotificationEmail({ orderId, items, shippingAddress }: Props) {
  const shortId = orderId.slice(-8).toUpperCase();

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
              padding: "20px",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <Text style={{ fontSize: "22px", fontWeight: "700", color: "#a855f7", margin: "0 0 6px" }}>
              Your order is on its way!
            </Text>
            <Text style={{ fontSize: "13px", color: "#8888aa", margin: 0 }}>
              Order #{shortId}
            </Text>
          </Section>

          {/* Items */}
          <Section
            style={{
              backgroundColor: "#0d0d14",
              border: "1px solid #1e1e30",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <Row style={{ borderBottom: "1px solid #1e1e30", padding: "10px 20px" }}>
              <Column>
                <Text style={{ fontSize: "11px", fontWeight: "600", color: "#8888aa", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
                  Items Shipped
                </Text>
              </Column>
            </Row>
            {items.map((item, idx) => (
              <Row
                key={idx}
                style={{ padding: "14px 20px", borderBottom: idx < items.length - 1 ? "1px solid #1e1e30" : "none" }}
              >
                <Column>
                  <Text style={{ fontSize: "14px", fontWeight: "600", color: "#f0f0ff", margin: "0 0 2px" }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: "12px", color: "#8888aa", margin: 0 }}>
                    Qty: {item.quantity}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          {/* Shipping address */}
          {shippingAddress && (
            <Section
              style={{
                backgroundColor: "#0d0d14",
                border: "1px solid #1e1e30",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "20px",
              }}
            >
              <Text style={{ fontSize: "11px", fontWeight: "600", color: "#8888aa", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>
                Shipping To
              </Text>
              <Text style={{ fontSize: "14px", color: "#f0f0ff", margin: 0 }}>
                {shippingAddress}
              </Text>
              <Text style={{ fontSize: "12px", color: "#8888aa", margin: "8px 0 0" }}>
                Estimated delivery: 5–10 business days.
              </Text>
            </Section>
          )}

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

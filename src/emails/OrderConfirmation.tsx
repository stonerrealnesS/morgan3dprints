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

type OrderItem = {
  name: string;
  quantity: number;
  priceInCents: number;
  image?: string;
};

type OrderConfirmationEmailProps = {
  orderId: string;
  items: OrderItem[];
  totalCents: number;
  fulfillment: "pickup" | "ship";
  shippingAddress?: string;
};

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function OrderConfirmationEmail({
  orderId,
  items,
  totalCents,
  fulfillment,
  shippingAddress,
}: OrderConfirmationEmailProps) {
  const shortId = orderId.slice(-8).toUpperCase();

  return (
    <Html lang="en">
      <Head />
      <Body
        style={{
          backgroundColor: "#050508",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            padding: "32px 16px",
          }}
        >
          {/* Header */}
          <Section
            style={{
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            <Text
              style={{
                fontSize: "28px",
                fontWeight: "800",
                color: "#a855f7",
                margin: "0 0 4px",
                letterSpacing: "-0.5px",
              }}
            >
              M3DP
            </Text>
            <Text
              style={{
                fontSize: "12px",
                color: "#8888aa",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              Morgan 3D Prints
            </Text>
          </Section>

          {/* Success banner */}
          <Section
            style={{
              backgroundColor: "rgba(74,222,128,0.08)",
              border: "1px solid rgba(74,222,128,0.3)",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <Text
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#4ade80",
                margin: "0 0 6px",
              }}
            >
              Your order is confirmed!
            </Text>
            <Text
              style={{
                fontSize: "13px",
                color: "#8888aa",
                margin: 0,
              }}
            >
              Order #{shortId}
            </Text>
          </Section>

          {/* Items table */}
          <Section
            style={{
              backgroundColor: "#0d0d14",
              border: "1px solid #1e1e30",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            {/* Table header */}
            <Row
              style={{
                borderBottom: "1px solid #1e1e30",
                padding: "10px 20px",
              }}
            >
              <Column>
                <Text
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#8888aa",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    margin: 0,
                  }}
                >
                  Item
                </Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#8888aa",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    margin: 0,
                  }}
                >
                  Total
                </Text>
              </Column>
            </Row>

            {/* Items */}
            {items.map((item, idx) => (
              <Row
                key={idx}
                style={{
                  padding: "14px 20px",
                  borderBottom:
                    idx < items.length - 1 ? "1px solid #1e1e30" : "none",
                }}
              >
                <Column>
                  <Text
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#f0f0ff",
                      margin: "0 0 2px",
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#8888aa",
                      margin: 0,
                    }}
                  >
                    Qty: {item.quantity} &times;{" "}
                    {formatCents(item.priceInCents)}
                  </Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#f0f0ff",
                      margin: 0,
                    }}
                  >
                    {formatCents(item.priceInCents * item.quantity)}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          {/* Total */}
          <Section
            style={{
              backgroundColor: "#0d0d14",
              border: "1px solid #1e1e30",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "20px",
            }}
          >
            <Row>
              <Column>
                <Text
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#f0f0ff",
                    margin: 0,
                  }}
                >
                  Total
                </Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "#22d3ee",
                    margin: 0,
                  }}
                >
                  {formatCents(totalCents)}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Fulfillment */}
          <Section
            style={{
              backgroundColor: "#0d0d14",
              border: "1px solid #1e1e30",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "28px",
            }}
          >
            <Text
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#8888aa",
                textTransform: "uppercase",
                letterSpacing: "1px",
                margin: "0 0 8px",
              }}
            >
              Fulfillment
            </Text>
            {fulfillment === "pickup" ? (
              <Text
                style={{
                  fontSize: "14px",
                  color: "#f0f0ff",
                  margin: "0 0 4px",
                }}
              >
                Local Pickup — Oklahoma City
              </Text>
            ) : (
              <>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#f0f0ff",
                    margin: "0 0 4px",
                  }}
                >
                  Shipped to your address
                </Text>
                {shippingAddress && (
                  <Text
                    style={{
                      fontSize: "13px",
                      color: "#8888aa",
                      margin: 0,
                    }}
                  >
                    {shippingAddress}
                  </Text>
                )}
              </>
            )}
            <Text
              style={{
                fontSize: "12px",
                color: "#8888aa",
                margin: "8px 0 0",
              }}
            >
              {fulfillment === "pickup"
                ? "We'll reach out when your order is ready for pickup (3–5 business days)."
                : "Estimated delivery: 5–10 business days."}
            </Text>
          </Section>

          <Hr style={{ borderColor: "#1e1e30", marginBottom: "20px" }} />

          {/* Footer */}
          <Section style={{ textAlign: "center" }}>
            <Text
              style={{
                fontSize: "12px",
                color: "#8888aa",
                margin: "0 0 4px",
              }}
            >
              Questions? Reply to this email or visit morgan3dokc.com
            </Text>
            <Text
              style={{
                fontSize: "11px",
                color: "#8888aa",
                margin: 0,
              }}
            >
              &copy; {new Date().getFullYear()} Morgan 3D Prints — Oklahoma City, OK
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

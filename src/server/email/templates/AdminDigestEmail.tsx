import "server-only";
import { Section, Text, Row, Column, Hr, Link } from "@react-email/components";
import { fmt } from "@/lib/core/format";
import {
  EmailShell,
  EmailText,
  EmailMuted,
  EmailButton,
} from "../components";

export type AdminDigestBooking = {
  ref: string;
  timeFormatted: string;
  customerName: string;
  serviceName: string;
  mode: string;
};

export type AdminDigestLowStock = {
  id: string;
  name: string;
  stock: number;
};

export type AdminDigestEmailProps = {
  dateFormatted: string;
  yesterdayOrders: {
    count: number;
    totalRevenueInr: number;
    paidCount: number;
    codCount: number;
  };
  todayBookings: {
    count: number;
    list: AdminDigestBooking[];
  };
  lowStockProducts: AdminDigestLowStock[];
  adminDashboardUrl: string;
};

export function getAdminDigestSubject(
  dateFormatted: string,
  ordersCount: number,
  bookingsCount: number,
): string {
  return `Daily Admin Digest: ${dateFormatted} — ${ordersCount} orders yesterday, ${bookingsCount} bookings today`;
}

export function AdminDigestEmail({
  dateFormatted,
  yesterdayOrders,
  todayBookings,
  lowStockProducts,
  adminDashboardUrl,
}: AdminDigestEmailProps): React.JSX.Element {
  return (
    <EmailShell
      preview={`Daily Digest for ${dateFormatted}: ${yesterdayOrders.count} orders, ${todayBookings.count} bookings today.`}
      locale="en"
    >
      <Text
        style={{
          fontSize: "22px",
          fontWeight: "bold",
          color: "#164E3F",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          margin: "0 0 4px 0",
          lineHeight: "1.3",
        }}
      >
        Daily Admin Digest
      </Text>
      <Text
        style={{
          fontSize: "13.5px",
          color: "#5A655F",
          margin: "0 0 20px 0",
        }}
      >
        {dateFormatted} · IST Morning Summary
      </Text>

      {/* 1. Yesterday's Commerce */}
      <Text
        style={{
          fontSize: "15px",
          fontWeight: "bold",
          color: "#164E3F",
          margin: "0 0 8px 0",
        }}
      >
        Yesterday&apos;s Storefront Performance
      </Text>
      <Section
        style={{
          backgroundColor: "#FBF7EE",
          border: "1px solid #EAE0CA",
          borderRadius: "4px",
          padding: "16px 20px",
          margin: "0 0 24px 0",
        }}
      >
        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "50%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>
              Total Orders:
            </Text>
          </Column>
          <Column style={{ width: "50%", textAlign: "right" }}>
            <Text style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#1F2A24" }}>
              {yesterdayOrders.count}
            </Text>
          </Column>
        </Row>
        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "50%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>
              Total Revenue:
            </Text>
          </Column>
          <Column style={{ width: "50%", textAlign: "right" }}>
            <Text style={{ margin: 0, fontSize: "15px", fontWeight: "bold", color: "#164E3F" }}>
              {fmt(yesterdayOrders.totalRevenueInr)}
            </Text>
          </Column>
        </Row>
        <Row>
          <Column style={{ width: "50%" }}>
            <Text style={{ margin: 0, fontSize: "12px", color: "#8A948E" }}>
              Payment Breakdown:
            </Text>
          </Column>
          <Column style={{ width: "50%", textAlign: "right" }}>
            <Text style={{ margin: 0, fontSize: "12.5px", color: "#5A655F" }}>
              {yesterdayOrders.paidCount} Paid Online · {yesterdayOrders.codCount} COD
            </Text>
          </Column>
        </Row>
      </Section>

      {/* 2. Today's Consultations */}
      <Text
        style={{
          fontSize: "15px",
          fontWeight: "bold",
          color: "#164E3F",
          margin: "0 0 8px 0",
        }}
      >
        Today&apos;s Consultations ({todayBookings.count})
      </Text>
      <Section
        style={{
          backgroundColor: "#FBF7EE",
          border: "1px solid #EAE0CA",
          borderRadius: "4px",
          padding: "12px 16px",
          margin: "0 0 24px 0",
        }}
      >
        {todayBookings.list.length === 0 ? (
          <Text style={{ margin: "8px 0", fontSize: "13px", color: "#5A655F" }}>
            No consultations scheduled for today.
          </Text>
        ) : (
          todayBookings.list.map((b, idx) => (
            <Row
              key={b.ref || idx}
              style={{
                padding: "10px 0",
                borderBottom: idx < todayBookings.list.length - 1 ? "1px solid #EAE0CA" : "none",
              }}
            >
              <Column style={{ width: "25%" }}>
                <Text
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: "#B8923A",
                  }}
                >
                  {b.timeFormatted}
                </Text>
              </Column>
              <Column style={{ width: "50%" }}>
                <Text
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#1F2A24",
                  }}
                >
                  {b.customerName}
                </Text>
                <Text
                  style={{
                    margin: "2px 0 0 0",
                    fontSize: "12px",
                    color: "#5A655F",
                  }}
                >
                  {b.serviceName} ({b.mode})
                </Text>
              </Column>
              <Column style={{ width: "25%", textAlign: "right" }}>
                <Text
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: "#8A948E",
                  }}
                >
                  {b.ref}
                </Text>
              </Column>
            </Row>
          ))
        )}
      </Section>

      {/* 3. Low Stock Items */}
      {lowStockProducts.length > 0 && (
        <>
          <Text
            style={{
              fontSize: "15px",
              fontWeight: "bold",
              color: "#C2410C",
              margin: "0 0 8px 0",
            }}
          >
            ⚠️ Low Stock Alert ({lowStockProducts.length} items)
          </Text>
          <Section
            style={{
              backgroundColor: "#FFF8F6",
              border: "1px solid #FED7AA",
              borderRadius: "4px",
              padding: "12px 16px",
              margin: "0 0 24px 0",
            }}
          >
            {lowStockProducts.map((p, idx) => (
              <Row
                key={p.id || idx}
                style={{
                  padding: "8px 0",
                  borderBottom: idx < lowStockProducts.length - 1 ? "1px solid #FED7AA" : "none",
                }}
              >
                <Column style={{ width: "70%" }}>
                  <Text style={{ margin: 0, fontSize: "13px", color: "#1F2A24" }}>
                    {p.name}
                  </Text>
                </Column>
                <Column style={{ width: "30%", textAlign: "right" }}>
                  <Text
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: p.stock === 0 ? "#DC2626" : "#EA580C",
                    }}
                  >
                    {p.stock === 0 ? "Out of Stock" : `${p.stock} remaining`}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>
        </>
      )}

      {/* Admin Panel Button */}
      <Section style={{ textAlign: "center", margin: "24px 0 16px 0" }}>
        <EmailButton href={adminDashboardUrl}>
          Open Admin Panel
        </EmailButton>
      </Section>

      <Hr style={{ borderColor: "#EAE0CA", margin: "20px 0" }} />

      <EmailMuted style={{ margin: 0, textAlign: "center" }}>
        This automated daily digest is sent every morning at 08:00 IST to configured admin notification recipients.
      </EmailMuted>
    </EmailShell>
  );
}

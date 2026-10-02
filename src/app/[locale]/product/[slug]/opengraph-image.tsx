import { ImageResponse } from "next/og";
import { getProductDetail } from "@/server/catalog/queries";
import { SITE_URL } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<ImageResponse> {
  const { slug } = await params;
  const detail = await getProductDetail(slug);
  const p = detail?.product;

  const title = p?.name ?? "Sacred Remedy";
  const price = p?.price ?? 0;
  const mrp = p?.mrp ?? 0;
  const catName = p?.catName ?? "Sacred Spiritual Item";

  let imageUrl: string | null = null;
  if (p?.images && p.images.length > 0 && p.images[0]?.src) {
    const raw = p.images[0].src;
    imageUrl = raw.startsWith("http") ? raw : `${SITE_URL}${raw.startsWith("/") ? "" : "/"}${raw}`;
  } else if (p?.photo) {
    imageUrl = p.photo.startsWith("http") ? p.photo : `${SITE_URL}${p.photo.startsWith("/") ? "" : "/"}${p.photo}`;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#0E3B30",
          backgroundImage:
            "radial-gradient(circle at 80% 20%, #164E3F 0%, #0E3B30 60%, #071E18 100%)",
          padding: 40,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Inner Card */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            backgroundColor: "#FFFDF8",
            borderRadius: 16,
            border: "2px solid #D9B96A",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Left Column: Product Image */}
          <div
            style={{
              width: "45%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FBF7EE",
              borderRight: "1.5px solid #EAE0CA",
              padding: 40,
              position: "relative",
            }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 280,
                  height: 280,
                  borderRadius: 140,
                  backgroundColor: "#164E3F",
                  border: "4px solid #B8923A",
                  color: "#D9B96A",
                  fontSize: 24,
                  fontWeight: "bold",
                  textAlign: "center",
                  padding: 24,
                }}
              >
                Maa Kali Astuti
              </div>
            )}
          </div>

          {/* Right Column: Product Info */}
          <div
            style={{
              width: "55%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "48px 48px 40px 48px",
            }}
          >
            {/* Header info */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    backgroundColor: "#164E3F",
                    color: "#D9B96A",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    padding: "4px 12px",
                    borderRadius: 4,
                  }}
                >
                  {catName}
                </div>
              </div>

              {/* Title */}
              <div
                style={{
                  display: "flex",
                  fontSize: 40,
                  fontWeight: "bold",
                  color: "#164E3F",
                  lineHeight: 1.2,
                  marginBottom: 16,
                  maxHeight: 144,
                  overflow: "hidden",
                }}
              >
                {title}
              </div>

              {/* Price Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 44,
                    fontWeight: "bold",
                    color: "#B8923A",
                    marginRight: 16,
                  }}
                >
                  ₹{price.toLocaleString("en-IN")}
                </div>

                {mrp > price && (
                  <div
                    style={{
                      display: "flex",
                      fontSize: 24,
                      color: "#8A948E",
                      textDecoration: "line-through",
                      marginRight: 16,
                    }}
                  >
                    ₹{mrp.toLocaleString("en-IN")}
                  </div>
                )}

                {mrp > price && (
                  <div
                    style={{
                      display: "flex",
                      backgroundColor: "#FFF8F6",
                      border: "1px solid #FED7AA",
                      color: "#C2410C",
                      fontSize: 14,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 4,
                    }}
                  >
                    SAVE ₹{(mrp - price).toLocaleString("en-IN")}
                  </div>
                )}
              </div>

              {/* Vedic Tag */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#5A655F",
                  fontSize: 15,
                  lineHeight: 1.4,
                }}
              >
                100% Authentic Vedic Item · Personally Energized by Sadhak Ji
              </div>
            </div>

            {/* Bottom brand footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid #EAE0CA",
                paddingTop: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#164E3F",
                  letterSpacing: "0.04em",
                }}
              >
                Maa Kali Astuti
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 14,
                  color: "#B8923A",
                  fontWeight: 600,
                }}
              >
                sadhakpawanpandey.com
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

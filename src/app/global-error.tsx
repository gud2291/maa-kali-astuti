"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#FAF6EE",
          color: "#18231C",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            padding: "32px 24px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              color: "#A87A2A",
              marginBottom: "16px",
            }}
          >
            ॥ ॐ ॥
          </div>
          <div
            style={{
              fontSize: "14px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#8B6524",
              marginBottom: "12px",
            }}
          >
            Maa Kali Astuti
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#18231C",
              margin: "0 0 8px 0",
              lineHeight: 1.25,
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "#2C3E32",
              margin: "0 0 16px 0",
            }}
          >
            कुछ अप्रत्याशित हुआ
          </p>
          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.6,
              color: "#5A655E",
              margin: "0 0 24px 0",
            }}
          >
            An unexpected error occurred. Please try reloading the page.
            <br />
            एक अप्रत्याशित त्रुटि हुई। कृपया पृष्ठ को पुनः लोड करने का प्रयास करें।
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                backgroundColor: "#1B3B2B",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "4px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again / पुनः प्रयास करें
            </button>
            <a
              href="/"
              style={{
                display: "inline-block",
                backgroundColor: "transparent",
                color: "#1B3B2B",
                border: "1px solid #D5C9B3",
                borderRadius: "4px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Home / मुख्य पृष्ठ
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

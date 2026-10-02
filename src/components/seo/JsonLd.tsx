import type { ReactNode } from "react";

export type JsonLdProps = {
  data: unknown;
};

export function JsonLd({ data }: JsonLdProps): React.JSX.Element {
  // Trusted JSON-LD structured data generated strictly by our server (RULES.md §9 exception)
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

import "server-only";

import React from "react";
import { render } from "@react-email/components";
import type { ReportModel } from "./model";
import { ReportDocument } from "./ReportDocument";

export async function renderReportHtml(model: ReportModel): Promise<string> {
  const isHi = model.lang === "hi";
  const title = `${model.name} — ${isHi ? "वैदिक जन्मपत्री प्रतिवेदन" : "Vedic Janampatri Report"}`;

  const documentElement = (
    <html lang={model.lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Montserrat:wght@400;600&family=Mukta:wght@400;600&family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ReportDocument model={model} />
      </body>
    </html>
  );

  const html = await render(documentElement);
  return html.startsWith("<!DOCTYPE") ? html : `<!DOCTYPE html>${html}`;
}

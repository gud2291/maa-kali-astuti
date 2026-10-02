import "server-only";

export const REPORT_CSS = `
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

@page {
  size: 210mm 297mm;
  margin: 0;
}

:root {
  --font-h: var(--font-cormorant, "Cormorant Garamond"), var(--font-tiro, "Tiro Devanagari Hindi"), "Tiro Devanagari Hindi", serif;
  --font-b: var(--font-montserrat, "Montserrat"), var(--font-mukta, "Mukta"), "Mukta", sans-serif;
  --col-em9: #164E3F;
  --col-em7: #1C6B54;
  --col-em5: #2F7A4F;
  --col-em-deep: #0E3B30;
  --col-g5: #C5A265;
  --col-g3: #D8C39D;
  --col-g7: #997A3D;
  --col-iv: #FBF7EE;
  --col-cream: #F5EFE1;
  --col-ink: #14120E;
  --col-ink6: #5A544A;
  --col-ink-muted: #7E776B;
  --col-border: rgba(197, 162, 101, 0.35);
}

body {
  background: #EAE6DE;
  color: var(--col-ink);
  font-family: var(--font-b);
  -webkit-font-smoothing: antialiased;
}

.report-root {
  background: #EAE6DE;
  padding: 40px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
}

.page {
  width: 210mm;
  min-height: 297mm;
  height: 297mm;
  max-height: 297mm;
  padding: 18mm 16mm 14mm 16mm;
  background: var(--col-iv);
  color: var(--col-ink);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  box-shadow: 0 14px 40px rgba(20, 18, 14, 0.14);
  break-after: page;
  page-break-after: always;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid var(--col-border);
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.page-header-title {
  font-family: var(--font-h);
  font-size: 15px;
  font-weight: 600;
  color: var(--col-em9);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.page-header-sub {
  font-family: var(--font-b);
  font-size: 10px;
  color: var(--col-ink-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.page-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--col-border);
  padding-top: 8px;
  margin-top: auto;
  font-family: var(--font-b);
  font-size: 9.5px;
  color: var(--col-ink-muted);
}

.page-footer-center {
  color: var(--col-g7);
  letter-spacing: 0.05em;
}

/* Headings */
h1.report-h1 {
  font-family: var(--font-h);
  font-size: 26px;
  font-weight: 600;
  color: var(--col-em-deep);
  line-height: 1.15;
  margin-bottom: 6px;
}

h2.report-h2 {
  font-family: var(--font-h);
  font-size: 20px;
  font-weight: 600;
  color: var(--col-em9);
  line-height: 1.2;
  margin-bottom: 8px;
}

h3.report-h3 {
  font-family: var(--font-h);
  font-size: 15px;
  font-weight: 600;
  color: var(--col-em9);
  line-height: 1.25;
  margin-bottom: 4px;
}

.report-subtitle {
  font-family: var(--font-b);
  font-size: 11.5px;
  color: var(--col-ink6);
  line-height: 1.45;
  margin-bottom: 14px;
}

p.report-p {
  font-family: var(--font-b);
  font-size: 11px;
  color: var(--col-ink);
  line-height: 1.6;
  margin-bottom: 10px;
}

/* Accent boxes */
.report-card {
  background: #FFFFFF;
  border: 1px solid var(--col-border);
  border-radius: 4px;
  padding: 14px;
  margin-bottom: 14px;
  box-shadow: 0 2px 6px rgba(20, 18, 14, 0.03);
}

.report-banner {
  background: var(--col-cream);
  border-left: 3px solid var(--col-g5);
  border-top: 1px solid var(--col-border);
  border-right: 1px solid var(--col-border);
  border-bottom: 1px solid var(--col-border);
  border-radius: 2px;
  padding: 10px 12px;
  margin-bottom: 12px;
}

.report-badge {
  display: inline-block;
  font-family: var(--font-b);
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 8px;
  border-radius: 12px;
  background: var(--col-cream);
  color: var(--col-em9);
  border: 1px solid var(--col-g3);
}

/* Tables */
table.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10.5px;
  margin-bottom: 12px;
}

table.report-table th {
  background: var(--col-em9);
  color: var(--col-iv);
  font-family: var(--font-b);
  font-size: 9.5px;
  font-weight: 600;
  text-align: left;
  padding: 7px 8px;
  border: 1px solid var(--col-em7);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

table.report-table td {
  padding: 6px 8px;
  border: 1px solid var(--col-border);
  background: #FFFFFF;
  color: var(--col-ink);
  line-height: 1.35;
}

table.report-table tr:nth-child(even) td {
  background: #FAF8F2;
}

/* Charts */
.chart-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--col-border);
  background: #FFFFFF;
  border-radius: 4px;
  padding: 12px;
}

.chart-frame-title {
  font-family: var(--font-h);
  font-size: 14px;
  font-weight: 600;
  color: var(--col-em9);
  margin-bottom: 6px;
  text-align: center;
}

.chart-svg {
  width: 100%;
  max-width: 320px;
  height: auto;
  aspect-ratio: 1 / 1;
  display: block;
}

/* 2-column & grid layouts */
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 12px;
}

.grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

/* Cover page specific */
.cover-page {
  padding: 24mm 20mm;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(180deg, #FBF7EE 0%, #F5EFE1 100%);
  border: 2px solid var(--col-g5);
}

.cover-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10mm;
}

.cover-emblem {
  width: 110px;
  height: 110px;
  margin-bottom: 24px;
}

.cover-gold-rule {
  width: 140px;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, var(--col-g5), transparent);
  margin: 14px auto;
}

.cover-title {
  font-family: var(--font-h);
  font-size: 32px;
  font-weight: 600;
  color: var(--col-em-deep);
  letter-spacing: 0.03em;
  margin-bottom: 8px;
}

.cover-subtitle {
  font-family: var(--font-h);
  font-size: 18px;
  font-style: italic;
  color: var(--col-g7);
  margin-bottom: 24px;
}

.cover-recipient-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid var(--col-g5);
  border-radius: 4px;
  padding: 20px 24px;
  margin: 0 auto;
  box-shadow: 0 4px 14px rgba(20, 18, 14, 0.05);
}

.cover-native-label {
  font-family: var(--font-b);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--col-em7);
  margin-bottom: 6px;
}

.cover-native-name {
  font-family: var(--font-h);
  font-size: 26px;
  font-weight: 600;
  color: var(--col-em-deep);
  margin-bottom: 12px;
}

.cover-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
  text-align: left;
  font-size: 11px;
}

.cover-meta-label {
  font-family: var(--font-b);
  font-size: 10px;
  color: var(--col-ink-muted);
}

.cover-meta-value {
  font-weight: 600;
  color: var(--col-ink);
}

.cover-blessing {
  max-width: 480px;
  margin: 0 auto 10mm auto;
  font-family: var(--font-h);
  font-size: 14px;
  line-height: 1.6;
  color: var(--col-ink6);
  font-style: italic;
}

/* Print Overrides */
@media print {
  body {
    background: transparent !important;
    color: var(--col-ink) !important;
  }
  .report-root {
    background: transparent !important;
    padding: 0 !important;
    gap: 0 !important;
  }
  .page {
    box-shadow: none !important;
    margin: 0 !important;
    width: 210mm !important;
    height: 297mm !important;
    page-break-after: always !important;
    break-after: page !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
`;

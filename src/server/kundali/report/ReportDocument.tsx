import "server-only";

import React from "react";
import type { ReportModel, ReportDashaRow } from "./model";
import { REPORT_CSS } from "./styles";
import { ReportChart } from "./ReportChart";
import { Logo } from "@/components/ui/Logo";

type Props = {
  model: ReportModel;
};

type PageProps = {
  model: ReportModel;
  pageNum: number;
  sectionTitle: string;
  children: React.ReactNode;
};

function Page({ model, pageNum, sectionTitle, children }: PageProps) {
  return (
    <div className="page" id={`page-${pageNum}`}>
      <div className="page-header">
        <span className="page-header-title">{sectionTitle}</span>
        <span className="page-header-sub">
          {model.name} · {model.place || model.formattedDob}
        </span>
      </div>
      <div className="page-content">{children}</div>
      <div className="page-footer">
        <span>
          {model.name} · {model.panchang.sunSign.name}
        </span>
        <span className="page-footer-center">Maa Kali Astuti · sadhakpawanpandey.com</span>
        <span>
          {model.lang === "hi" ? `पृष्ठ ${pageNum} / 28` : `Page ${pageNum} of 28`}
        </span>
      </div>
    </div>
  );
}

export function ReportDocument({ model }: Props) {
  const { labels } = model.content;
  const isHi = model.lang === "hi";

  return (
    <div className="report-root">
      <style>{REPORT_CSS}</style>

      {/* PAGE 1: COVER */}
      <div className="page cover-page" id="page-1">
        <div className="cover-header">
          <div className="cover-emblem">
            <Logo uid="reportcover" className="size-full" inline />
          </div>
          <div className="cover-title">
            {isHi ? "वैदिक जन्मपत्री प्रतिवेदन" : "Vedic Janampatri Report"}
          </div>
          <div className="cover-gold-rule" />
          <div className="cover-subtitle">
            {isHi
              ? "ग्रह-नक्षत्रों का प्रामाणिक व वैज्ञानिक विश्लेषण"
              : "Authentic Sidereal Lahiri Astrological Analysis"}
          </div>
        </div>

        <div className="cover-recipient-card">
          <div className="cover-native-label">
            {isHi ? "जातक विवरण" : "Native Analysis Prepared For"}
          </div>
          <div className="cover-native-name">{model.name}</div>
          <div className="cover-meta-grid">
            <div>
              <div className="cover-meta-label">{isHi ? "जन्म तिथि" : "Date of Birth"}</div>
              <div className="cover-meta-value">{model.formattedDob}</div>
            </div>
            <div>
              <div className="cover-meta-label">{isHi ? "जन्म समय" : "Time of Birth"}</div>
              <div className="cover-meta-value">{model.formattedTob}</div>
            </div>
            <div>
              <div className="cover-meta-label">{isHi ? "जन्म स्थान" : "Birth Place"}</div>
              <div className="cover-meta-value">{model.place || (isHi ? "निर्दिष्ट नहीं" : "Not specified")}</div>
            </div>
            <div>
              <div className="cover-meta-label">{isHi ? "प्रतिवेदन तिथि" : "Generated On"}</div>
              <div className="cover-meta-value">{model.generatedAtFormatted}</div>
            </div>
          </div>
        </div>

        <div className="cover-blessing">
          {isHi
            ? "“ज्योतिष भाग्य का बंधन नहीं, अपितु जीवन के कर्मपथ पर प्रकाश डालने वाला दिव्य दीपक है।” — साधक पवन पाण्डेय"
            : "“Astrology is not fatalistic decree, but a sacred lantern illuminating life’s path for conscious right action.” — Sadhak Pawan Pandey"}
        </div>

        <div className="page-footer" style={{ width: "100%" }}>
          <span>Maa Kali Astuti</span>
          <span className="page-footer-center">sadhakpawanpandey.com</span>
          <span>{isHi ? "पृष्ठ 1 / 28" : "Page 1 of 28"}</span>
        </div>
      </div>

      {/* PAGE 2: BIRTH DETAILS & PANCHANG */}
      <Page model={model} pageNum={2} sectionTitle={labels.sections.birthDetails ?? "Birth Details & Panchang"}>
        <h2 className="report-h2">{labels.sections.birthDetails ?? "Birth Details & Panchang"}</h2>
        <p className="report-subtitle">
          {isHi
            ? "जन्म कालीन खगोलीय गणनाएं एवं पंचांगीय स्थिति का विवरण।"
            : "Astronomical coordinates and Vedic calendar alignments at the exact instant of birth."}
        </p>

        <div className="grid-2">
          <div className="report-card">
            <h3 className="report-h3">{isHi ? "जन्म विवरण" : "Birth Parameters"}</h3>
            <table className="report-table" style={{ marginBottom: 0 }}>
              <tbody>
                <tr>
                  <td>{labels.tableHeaders.param ?? "Parameter"}</td>
                  <td><strong>{model.name}</strong></td>
                </tr>
                <tr>
                  <td>{isHi ? "दिनांक" : "Date"}</td>
                  <td>{model.formattedDob}</td>
                </tr>
                <tr>
                  <td>{isHi ? "समय" : "Time"}</td>
                  <td>{model.formattedTob}</td>
                </tr>
                <tr>
                  <td>{isHi ? "स्थान" : "Place"}</td>
                  <td>{model.place || "-"}</td>
                </tr>
                <tr>
                  <td>{isHi ? "अक्षांश / देशांतर" : "Coordinates"}</td>
                  <td>{model.chart.input.lat.toFixed(2)}°N, {model.chart.input.lon.toFixed(2)}°E</td>
                </tr>
                <tr>
                  <td>{isHi ? "अयनांश" : "Ayanamsa"}</td>
                  <td>Lahiri ({model.panchang.ayanamsaFormatted})</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="report-card">
            <h3 className="report-h3">{labels.sections.panchang ?? "Panchang at Birth"}</h3>
            <table className="report-table" style={{ marginBottom: 0 }}>
              <tbody>
                <tr>
                  <td>{isHi ? "तिथि" : "Tithi"}</td>
                  <td><strong>{model.panchang.tithi.name}</strong></td>
                </tr>
                <tr>
                  <td>{isHi ? "नक्षत्र" : "Nakshatra"}</td>
                  <td><strong>{model.panchang.nakshatra.name}</strong> ({isHi ? "चरण" : "Pada"} {model.panchang.nakshatra.pada})</td>
                </tr>
                <tr>
                  <td>{isHi ? "नक्षत्र स्वामी" : "Nakshatra Lord"}</td>
                  <td>{model.panchang.nakshatra.lordName}</td>
                </tr>
                <tr>
                  <td>{isHi ? "योग" : "Yoga"}</td>
                  <td>{model.panchang.yoga.name}</td>
                </tr>
                <tr>
                  <td>{isHi ? "करण" : "Karana"}</td>
                  <td>{model.panchang.karana.name}</td>
                </tr>
                <tr>
                  <td>{isHi ? "वार" : "Weekday"}</td>
                  <td>{model.panchang.vara.name}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="report-banner">
          <strong>{isHi ? "खगोलीय आधार:" : "Astronomical Principle:"}</strong>{" "}
          {isHi
            ? "यह गणना प्रामाणिक लहिड़ी अयनांश (True Lahiri) तथा निरयण (Sidereal) राशि चक्र पर आधारित है।"
            : "Computed using True Lahiri Ayanamsa and sidereal zodiac alignments for precise Vedic planetary calculations."}
        </div>
      </Page>

      {/* PAGE 3: LAGNA (D1) CHART */}
      <Page model={model} pageNum={3} sectionTitle={labels.sections.charts ?? "Lagna (D1) Chart"}>
        <h2 className="report-h2">{isHi ? "लग्न कुण्डली (D1 — राशि चक्र)" : "Lagna Chart (D1 — Birth Horizon)"}</h2>
        <p className="report-subtitle">
          {isHi
            ? "लग्न कुण्डली जातक के शरीर, स्वभाव, स्वास्थ्य एवं मूल जीवन पथ का प्राथमिक आधार है।"
            : "The primary chart showing the Eastern horizon at birth, foundational for personality and destiny."}
        </p>
        <div className="chart-frame" style={{ maxWidth: 360, margin: "0 auto 14px auto" }}>
          <ReportChart chart={model.chart} type="d1" lang={model.lang} />
        </div>
        <div className="report-card">
          <h3 className="report-h3">{model.lagnaAnalysis.title}</h3>
          <p className="report-p" style={{ marginBottom: 0 }}>
            {model.lagnaAnalysis.body}
          </p>
        </div>
      </Page>

      {/* PAGE 4: CHANDRA CHART */}
      <Page model={model} pageNum={4} sectionTitle={labels.sections.charts ?? "Chandra Chart"}>
        <h2 className="report-h2">{isHi ? "चन्द्र कुण्डली (मानस चक्र)" : "Chandra Chart (Moon As Ascendant)"}</h2>
        <p className="report-subtitle">
          {isHi
            ? "चन्द्रमा को लग्न मानकर मन, संवेग, मानसिक शांति एवं आंतरिक दृष्टिकोण का परीक्षण किया जाता है।"
            : "Evaluating the chart from the Moon sign reveals the emotional mindset, subconscious habits, and mental resilience."}
        </p>
        <div className="chart-frame" style={{ maxWidth: 360, margin: "0 auto 14px auto" }}>
          <ReportChart chart={model.chart} type="chandra" lang={model.lang} />
        </div>
        <div className="report-card">
          <h3 className="report-h3">{isHi ? "चन्द्र राशि का प्रभाव" : "Lunar Psychological Core"}</h3>
          <p className="report-p" style={{ marginBottom: 0 }}>
            {model.moonSignAnalysis.body}
          </p>
        </div>
      </Page>

      {/* PAGE 5: NAVAMSA (D9) CHART */}
      <Page model={model} pageNum={5} sectionTitle={labels.sections.navamshaChart ?? "Navamsa (D9) Chart"}>
        <h2 className="report-h2">{labels.sections.navamshaChart ?? "Navamsa (D9) Chart"}</h2>
        <p className="report-subtitle">
          {isHi
            ? "नवमांश कुण्डली (डी-9) वैवाहिक जीवन, धर्म, आंतरिक सामर्थ्य एवं जीवन के उत्तरार्ध का सूक्ष्म दर्पण है।"
            : "The D9 harmonic chart uncovers deeper spiritual destiny, relational harmony, and maturity in second half of life."}
        </p>
        <div className="chart-frame" style={{ maxWidth: 360, margin: "0 auto 14px auto" }}>
          <ReportChart chart={model.chart} type="d9" lang={model.lang} />
        </div>
        <div className="report-card">
          <h3 className="report-h3">{isHi ? "नवमांश की महत्ता" : "Significance of the Navamsha"}</h3>
          <p className="report-p" style={{ marginBottom: 0 }}>
            {isHi
              ? "वैदिक ज्योतिष में लग्न कुण्डली को वृक्ष तथा नवमांश को उसका फल माना गया है। ग्रह का जो बल नवमांश में पुष्ट होता है, वही फलित रूप में स्थायित्व प्राप्त करता है।"
              : "In Vedic wisdom, the Lagna chart represents the tree while the Navamsha reveals the fruit. A planet fortified in D9 provides durable results throughout life."}
          </p>
        </div>
      </Page>

      {/* PAGE 6: PLANETARY POSITIONS TABLE */}
      <Page model={model} pageNum={6} sectionTitle={labels.sections.planetaryPositions ?? "Planetary Positions"}>
        <h2 className="report-h2">{labels.sections.planetaryPositions ?? "Planetary Positions & Nakshatras"}</h2>
        <p className="report-subtitle">
          {isHi
            ? "जन्म काल में नवग्रहों की निरयण स्थिति, राशि, अंश, भाव एवं नवमांश की स्थिति।"
            : "Exact sidereal coordinates, whole-sign house placements, and harmonic navamsa signs."}
        </p>
        <table className="report-table">
          <thead>
            <tr>
              <th>{labels.tableHeaders.planet ?? "Planet"}</th>
              <th>{labels.tableHeaders.sign ?? "Sign"}</th>
              <th>{labels.tableHeaders.degrees ?? "Degrees"}</th>
              <th>{labels.tableHeaders.house ?? "House"}</th>
              <th>{labels.tableHeaders.nakshatra ?? "Nakshatra"}</th>
              <th>{labels.tableHeaders.state ?? "State"}</th>
              <th>{labels.tableHeaders.d9Sign ?? "D9 Sign"}</th>
            </tr>
          </thead>
          <tbody>
            {model.planetTable.map((p) => (
              <tr key={p.key}>
                <td><strong>{p.name}</strong></td>
                <td>{p.signName}</td>
                <td>{p.degreesFormatted}</td>
                <td>{p.house}</td>
                <td>{p.nakshatraName} ({isHi ? "पद" : "P"} {p.pada})</td>
                <td>{p.retroState || (isHi ? "मार्गी" : "Direct")}</td>
                <td>{p.d9SignName}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="report-banner">
          <strong>{isHi ? "ग्रह स्थिति का महत्व:" : "Planetary State Key:"}</strong>{" "}
          {isHi
            ? "‘R’ वक्री ग्रह को दर्शाता है। वक्री ग्रह आंतरिक चिंतन, तीव्र कर्म-पुनरावृत्ति तथा गहरी खोज का संकेत देते हैं।"
            : "‘R’ indicates a retrograde planet, prompting inward contemplation, deep karmic recalibration, and unconventional approaches."}
        </div>
      </Page>

      {/* PAGE 7: PLANETARY INFLUENCES (PART 1) */}
      <Page model={model} pageNum={7} sectionTitle={labels.sections.planetaryPositions ?? "Planetary Placements"}>
        <h2 className="report-h2">{isHi ? "ग्रहों का भावगत प्रभाव (भाग 1)" : "Planetary Placements in Houses (Part 1)"}</h2>
        <p className="report-subtitle">
          {isHi
            ? "सूर्य, चन्द्र, मंगल एवं बुध की भाव स्थिति का विस्तृत व्यावहारिक प्रभाव।"
            : "Detailed behavioral and life impacts of Sun, Moon, Mars, and Mercury in your chart."}
        </p>
        {model.planetInHouse.slice(0, 4).map((item) => (
          <div key={item.key} className="report-card">
            <h3 className="report-h3">
              {item.name} — {isHi ? `${item.house}वें भाव में` : `In House ${item.house}`}
            </h3>
            <p className="report-p" style={{ marginBottom: 0 }}>{item.body}</p>
          </div>
        ))}
      </Page>

      {/* PAGE 8: VIMSHOTTARI DASHA - CURRENT & UPCOMING */}
      <Page model={model} pageNum={8} sectionTitle={labels.sections.dasha ?? "Vimshottari Dasha"}>
        <h2 className="report-h2">{labels.sections.dasha ?? "Vimshottari Dasha Timeline (120 Years)"}</h2>
        <p className="report-subtitle">
          {isHi
            ? "विंशोत्तरी महादशा जातक के जीवन में समय के प्रवाह एवं प्रमुख अवधियों का दिग्दर्शन कराती है।"
            : "The 120-year Vedic planetary cycle tracking life chapters, focal priorities, and evolution."}
        </p>

        <div className="report-card" style={{ borderLeft: "4px solid var(--col-em9)" }}>
          <div className="report-badge" style={{ marginBottom: 6 }}>
            {isHi ? "वर्तमान महादशा" : "Active Mahadasha"}
          </div>
          <h3 className="report-h3">
            {model.dashaTimeline.currentMahadasha.lordName} ({model.dashaTimeline.currentMahadasha.start} – {model.dashaTimeline.currentMahadasha.end})
          </h3>
          <p className="report-p" style={{ marginBottom: 8 }}>
            {model.dashaTimeline.currentMahadasha.body}
          </p>
          <div style={{ fontSize: "11px", color: "var(--col-ink6)" }}>
            <strong>{isHi ? "वर्तमान अंतर्दशा:" : "Active Antardasha:"}</strong>{" "}
            {model.dashaTimeline.currentAntardasha.lordName} ({model.dashaTimeline.currentAntardasha.start} – {model.dashaTimeline.currentAntardasha.end})
          </div>
        </div>

        <h3 className="report-h3" style={{ marginTop: 12, marginBottom: 8 }}>
          {isHi ? "आगामी अंतर्दशा चक्र" : "Upcoming Sub-Periods (Antardashas)"}
        </h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>{isHi ? "अंतर्दशा नाथ" : "Antardasha Lord"}</th>
              <th>{labels.tableHeaders.startDate ?? "Start Date"}</th>
              <th>{labels.tableHeaders.endDate ?? "End Date"}</th>
            </tr>
          </thead>
          <tbody>
            {model.dashaTimeline.nextThreeAntardashas.map((sub, i) => (
              <tr key={i}>
                <td><strong>{sub.lordName}</strong></td>
                <td>{sub.start}</td>
                <td>{sub.end}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Page>

      {/* PAGE 9: VIMSHOTTARI DASHA - NEXT MAHADASHA & TIMELINE TABLE 1 */}
      <Page model={model} pageNum={9} sectionTitle={labels.sections.dasha ?? "Vimshottari Dasha"}>
        <h2 className="report-h2">{isHi ? "आगामी महादशा एवं कालक्रम (भाग 1)" : "Next Mahadasha & Timeline Overview"}</h2>
        {model.dashaTimeline.nextMahadasha && (
          <div className="report-card" style={{ borderLeft: "4px solid var(--col-g5)" }}>
            <div className="report-badge" style={{ marginBottom: 6 }}>
              {isHi ? "आगामी महादशा" : "Next Mahadasha"}
            </div>
            <h3 className="report-h3">
              {model.dashaTimeline.nextMahadasha.lordName} ({model.dashaTimeline.nextMahadasha.start} – {model.dashaTimeline.nextMahadasha.end})
            </h3>
            <p className="report-p" style={{ marginBottom: 0 }}>
              {model.dashaTimeline.nextMahadasha.body}
            </p>
          </div>
        )}

        <h3 className="report-h3" style={{ marginTop: 12, marginBottom: 8 }}>
          {isHi ? "समस्त 120 वर्षीय महादशा सूची" : "Complete 120-Year Mahadasha Sequence"}
        </h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>{labels.tableHeaders.dashaLord ?? "Mahadasha"}</th>
              <th>{labels.tableHeaders.startDate ?? "Start Date"}</th>
              <th>{labels.tableHeaders.endDate ?? "End Date"}</th>
            </tr>
          </thead>
          <tbody>
            {model.dashaTimeline.allMahadashas.slice(0, 5).map((row) => (
              <tr key={row.lord}>
                <td><strong>{row.lordName}</strong></td>
                <td>{row.start}</td>
                <td>{row.end}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Page>

      {/* PAGE 10: VIMSHOTTARI DASHA - ANTARDASHA DETAIL 1 */}
      <Page model={model} pageNum={10} sectionTitle={labels.sections.dasha ?? "Antardasha Cycles"}>
        <h2 className="report-h2">{isHi ? "विंशोत्तरी सूक्ष्म अंतर्दशा चक्र (प्रथम अर्ध)" : "Vimshottari Antardasha Cycles (Early Life)"}</h2>
        <p className="report-subtitle">
          {isHi
            ? "आरंभिक महादशाओं के अंतर्गत आने वाले 9 उप-कालखंडों का समय चक्र।"
            : "Detailed sub-periods (Antardashas) for the foundational decades of life."}
        </p>
        {model.dashaTimeline.allMahadashas.slice(0, 3).map((dasha) => (
          <div key={dasha.lord} style={{ marginBottom: 12 }}>
            <h3 className="report-h3" style={{ fontSize: 13 }}>
              {dasha.lordName} {isHi ? "महादशा उप-अवधियां" : "Sub-Cycles"} ({dasha.start} – {dasha.end})
            </h3>
            <table className="report-table" style={{ fontSize: 10 }}>
              <thead>
                <tr>
                  <th>{isHi ? "अंतर्दशा" : "Antardasha"}</th>
                  <th>{isHi ? "आरंभ" : "Start"}</th>
                  <th>{isHi ? "समापन" : "End"}</th>
                </tr>
              </thead>
              <tbody>
                {dasha.subs.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.lordName}</td>
                    <td>{s.start}</td>
                    <td>{s.end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </Page>

      {/* PAGE 11: VIMSHOTTARI DASHA - ANTARDASHA DETAIL 2 */}
      <Page model={model} pageNum={11} sectionTitle={labels.sections.dasha ?? "Antardasha Cycles"}>
        <h2 className="report-h2">{isHi ? "विंशोत्तरी सूक्ष्म अंतर्दशा चक्र (उत्तरार्ध)" : "Vimshottari Antardasha Cycles (Later Life)"}</h2>
        <p className="report-subtitle">
          {isHi
            ? "परवर्ती महादशाओं के अंतर्गत आने वाली अंतर्दशाओं का समय चक्र।"
            : "Detailed sub-periods for mature and reflective life chapters."}
        </p>
        {model.dashaTimeline.allMahadashas.slice(3, 6).map((dasha) => (
          <div key={dasha.lord} style={{ marginBottom: 12 }}>
            <h3 className="report-h3" style={{ fontSize: 13 }}>
              {dasha.lordName} {isHi ? "महादशा उप-अवधियां" : "Sub-Cycles"} ({dasha.start} – {dasha.end})
            </h3>
            <table className="report-table" style={{ fontSize: 10 }}>
              <thead>
                <tr>
                  <th>{isHi ? "अंतर्दशा" : "Antardasha"}</th>
                  <th>{isHi ? "आरंभ" : "Start"}</th>
                  <th>{isHi ? "समापन" : "End"}</th>
                </tr>
              </thead>
              <tbody>
                {dasha.subs.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.lordName}</td>
                    <td>{s.start}</td>
                    <td>{s.end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </Page>

      {/* PAGE 12: MANGLIK DOSHA */}
      <Page model={model} pageNum={12} sectionTitle={labels.sections.doshas ?? "Manglik Dosha Analysis"}>
        <h2 className="report-h2">{isHi ? "मांगलिक दोष — प्रामाणिक परीक्षण" : "Manglik Dosha — Honest Evaluation"}</h2>
        <div
          className="report-banner"
          style={{
            borderColor: model.doshas.manglik.present ? "var(--col-g7)" : "var(--col-em5)",
          }}
        >
          <strong>{isHi ? "स्थिति:" : "Assessment:"}</strong>{" "}
          {model.doshas.manglik.present
            ? (isHi
                ? `मांगलिक प्रभाव दृष्टिगोचर (${model.doshas.manglik.fromLagna ? "लग्न से" : ""}${model.doshas.manglik.fromLagna && model.doshas.manglik.fromMoon ? " एवं " : ""}${model.doshas.manglik.fromMoon ? "चन्द्र से" : ""})`
                : `Manglik influence identified (${model.doshas.manglik.fromLagna ? "from Lagna" : ""}${model.doshas.manglik.fromLagna && model.doshas.manglik.fromMoon ? " & " : ""}${model.doshas.manglik.fromMoon ? "from Moon" : ""})`)
            : (isHi ? "मांगलिक दोष अनुपस्थित" : "No Manglik Dosha detected")}
        </div>
        <div className="report-card">
          <p className="report-p">{model.doshas.manglik.body}</p>
        </div>
        <div className="report-card" style={{ background: "var(--col-cream)" }}>
          <h3 className="report-h3">{isHi ? "साधक जी का दृष्टिकोण" : "Sadhak Ji's Perspective"}</h3>
          <p className="report-p" style={{ marginBottom: 0 }}>
            {isHi
              ? "मंगल ऊर्जा, संकल्प एवं साहस का प्रतीक है। केवल मांगलिक योग वैवाहिक सुख का अंतिम निर्णय नहीं करता; परस्पर समझदारी, विनम्रता एवं धैर्य ही संबंध को सुदृढ़ बनाते हैं।"
              : "Mars represents courageous drive and vitality. An isolated placement never condemns marriage; emotional maturity, respect, and communication build enduring unions."}
          </p>
        </div>
      </Page>

      {/* PAGE 13: KAAL SARP DOSHA */}
      <Page model={model} pageNum={13} sectionTitle={labels.sections.doshas ?? "Kaal Sarp Analysis"}>
        <h2 className="report-h2">{isHi ? "कालसर्प योग — वस्तुनिष्ठ समीक्षा" : "Kaal Sarp Yoga — Balanced Analysis"}</h2>
        <div
          className="report-banner"
          style={{
            borderColor: model.doshas.kaalSarp.present ? "var(--col-g7)" : "var(--col-em5)",
          }}
        >
          <strong>{isHi ? "स्थिति:" : "Assessment:"}</strong>{" "}
          {model.doshas.kaalSarp.present
            ? (isHi ? `कालसर्प योग निर्मित (राहु भाव ${model.doshas.kaalSarp.type || "सक्रिय"})` : `Kaal Sarp configuration formed (Rahu axis ${model.doshas.kaalSarp.type || "active"})`)
            : (isHi ? "कालसर्प योग अनुपस्थित" : "No Kaal Sarp Yoga present in chart")}
        </div>
        <div className="report-card">
          <p className="report-p">{model.doshas.kaalSarp.body}</p>
        </div>
        <div className="report-card" style={{ background: "var(--col-cream)" }}>
          <h3 className="report-h3">{isHi ? "विकास का मार्ग" : "Evolutionary Perspective"}</h3>
          <p className="report-p" style={{ marginBottom: 0 }}>
            {isHi
              ? "राहु-केतु अक्ष आत्मा की जीवन-यात्रा का संकेत है। अनुशासित जीवन, सेवा तथा सत्यनिष्ठा से यह योग संघर्ष को अभूतपूर्व सफलता में परिणत कर देता है।"
              : "Rahu and Ketu mark the soul’s growth axis. With ethical discipline and steady service, periods of friction often spark profound breakthroughs."}
          </p>
        </div>
      </Page>

      {/* PAGE 14: SHANI SADE SATI */}
      <Page model={model} pageNum={14} sectionTitle={labels.sections.doshas ?? "Sade Sati Evaluation"}>
        <h2 className="report-h2">{isHi ? "शनि साढ़े साती — सत्य एवं समाधान" : "Shani Sade Sati — Honest Insights"}</h2>
        <div className="report-banner">
          <strong>{isHi ? "वर्तमान चरण:" : "Active Phase:"}</strong>{" "}
          {model.doshas.sadeSati.active
            ? (isHi ? `साढ़े साती सक्रिय (${model.doshas.sadeSati.phase})` : `Sade Sati Active (${model.doshas.sadeSati.phase} phase)`)
            : (isHi ? "वर्तमान में साढ़े साती प्रभावी नहीं है" : "Currently not in Sade Sati")}
        </div>
        <div className="report-card">
          <p className="report-p">{model.doshas.sadeSati.body}</p>
        </div>
        {model.doshas.sadeSati.periods.length > 0 && (
          <div>
            <h3 className="report-h3" style={{ marginBottom: 6 }}>
              {isHi ? "साढ़े साती कालखंड तालिका" : "Sade Sati Planetary Transit Windows"}
            </h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>{labels.tableHeaders.startDate ?? "Start Date"}</th>
                  <th>{labels.tableHeaders.endDate ?? "End Date"}</th>
                </tr>
              </thead>
              <tbody>
                {model.doshas.sadeSati.periods.map((per, idx) => (
                  <tr key={idx}>
                    <td>{per.start}</td>
                    <td>{per.end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Page>

      {/* PAGE 15: YOGAS IN YOUR CHART (PART 1) */}
      <Page model={model} pageNum={15} sectionTitle={labels.sections.yogas ?? "Key Yogas"}>
        <h2 className="report-h2">{labels.sections.yogas ?? "Key Yogas & Planetary Formations (Part 1)"}</h2>
        <p className="report-subtitle">
          {isHi
            ? "कुण्डली में विशेष ग्रह युतियों एवं दृष्टियों से निर्मित शुभ योगों का फल।"
            : "Specific planetary alignments conferring distinctive talents, resources, and life strengths."}
        </p>
        {model.yogas.length > 0 ? (
          model.yogas.slice(0, 3).map((y) => (
            <div key={y.key} className="report-card">
              <h3 className="report-h3">{y.title}</h3>
              <p className="report-p" style={{ marginBottom: 0 }}>{y.body}</p>
            </div>
          ))
        ) : (
          <div className="report-card">
            <p className="report-p">
              {isHi
                ? "आपकी कुण्डली में ग्रह संतुलित अवस्था में हैं। कोई प्रतिकूल विघ्नकारी योग उपस्थित नहीं है।"
                : "Planets enjoy natural distribution without severe restrictive alignments. Balanced focus brings steady rewards."}
            </p>
          </div>
        )}
      </Page>

      {/* PAGE 16: YOGAS IN YOUR CHART (PART 2) */}
      <Page model={model} pageNum={16} sectionTitle={labels.sections.yogas ?? "Key Yogas"}>
        <h2 className="report-h2">{isHi ? "विशिष्ट योग (भाग 2)" : "Key Yogas & Planetary Formations (Part 2)"}</h2>
        {model.yogas.length > 3 ? (
          model.yogas.slice(3, 6).map((y) => (
            <div key={y.key} className="report-card">
              <h3 className="report-h3">{y.title}</h3>
              <p className="report-p" style={{ marginBottom: 0 }}>{y.body}</p>
            </div>
          ))
        ) : (
          <div className="report-card">
            <h3 className="report-h3">{isHi ? "ग्रह मैत्री व सामंजस्य" : "Planetary Harmony"}</h3>
            <p className="report-p">
              {isHi
                ? "ग्रहों का यह विन्यास जातक को स्वतंत्र निर्णय लेने, आत्म-निर्भर बनने तथा स्वप्रयासों द्वारा उन्नति का सुअवसर प्रदान करता है।"
                : "The planetary architecture grants high autonomy, encouraging self-made achievements through direct effort and moral integrity."}
            </p>
          </div>
        )}
        <div className="report-banner" style={{ marginTop: 14 }}>
          <strong>{isHi ? "योगों का सिद्धांत:" : "Classical Principle:"}</strong>{" "}
          {isHi
            ? "योग बीज के समान होते हैं; अनुकूल कर्म एवं समय आने पर ही वे पुष्पित व फलित होते हैं।"
            : "Yogas operate like seeds. Dedicated right action and timing allow latent potentials to fully blossom."}
        </div>
      </Page>

      {/* PAGE 17: PLANETARY INFLUENCES (PART 2) */}
      <Page model={model} pageNum={17} sectionTitle={labels.sections.planetaryPositions ?? "Planetary Placements"}>
        <h2 className="report-h2">{isHi ? "ग्रहों का भावगत प्रभाव (भाग 2)" : "Planetary Placements in Houses (Part 2)"}</h2>
        <p className="report-subtitle">
          {isHi
            ? "गुरु, शुक्र, शनि, राहु एवं केतु की भावगत स्थिति का फलकथन।"
            : "Analyzing the spiritual, practical, and developmental impacts of Jupiter, Venus, Saturn, Rahu, and Ketu."}
        </p>
        {model.planetInHouse.slice(4, 9).map((item) => (
          <div key={item.key} className="report-card" style={{ marginBottom: 10, padding: 10 }}>
            <h3 className="report-h3" style={{ fontSize: 13 }}>
              {item.name} — {isHi ? `${item.house}वें भाव में` : `In House ${item.house}`}
            </h3>
            <p className="report-p" style={{ marginBottom: 0, fontSize: 10.5 }}>{item.body}</p>
          </div>
        ))}
      </Page>

      {/* PAGE 18: LIFE AREA - CAREER */}
      <Page model={model} pageNum={18} sectionTitle={labels.sections.career ?? "Career & Vocation"}>
        <h2 className="report-h2">{labels.sections.career ?? "Career & Vocation (10th House)"}</h2>
        <div className="report-banner">
          <strong>{isHi ? "दशम भाव राशि:" : "10th House Sign:"}</strong> {model.lifeAreas[0]?.signName}
        </div>
        <div className="report-card">
          <p className="report-p">{model.lifeAreas[0]?.body}</p>
        </div>
        <div className="report-card" style={{ background: "var(--col-cream)" }}>
          <h3 className="report-h3">{isHi ? "व्यावसायिक सफलता के सूत्र" : "Key Vocational Tenets"}</h3>
          <p className="report-p" style={{ marginBottom: 0 }}>
            {isHi
              ? "कार्यक्षेत्र में निरंतरता, पारदर्शी संवाद तथा अपने कौशल का नियमित उन्नयन आपको दीर्घकालिक प्रतिष्ठा व स्थिरता दिलाएगा।"
              : "Consistent application, transparent professional communication, and skill refinement ensure lasting recognition."}
          </p>
        </div>
      </Page>

      {/* PAGE 19: LIFE AREA - MARRIAGE */}
      <Page model={model} pageNum={19} sectionTitle={labels.sections.marriage ?? "Marriage & Partnership"}>
        <h2 className="report-h2">{labels.sections.marriage ?? "Partnership & Marriage (7th House)"}</h2>
        <div className="report-banner">
          <strong>{isHi ? "सप्तम भाव राशि:" : "7th House Sign:"}</strong> {model.lifeAreas[1]?.signName}
        </div>
        <div className="report-card">
          <p className="report-p">{model.lifeAreas[1]?.body}</p>
        </div>
        <div className="report-card" style={{ background: "var(--col-cream)" }}>
          <h3 className="report-h3">{isHi ? "वैवाहिक सौहार्द का मंत्र" : "Relationship Harmony"}</h3>
          <p className="report-p" style={{ marginBottom: 0 }}>
            {isHi
              ? "सच्चा संबंध दोनों पक्षों के परस्पर सम्मान, सहानुभूतिपूर्ण श्रवण और एक-दूसरे की व्यक्तिगत सीमाओं का आदर करने से प्रगाढ़ होता है।"
              : "Mutual respect, active compassionate listening, and honoring each other's autonomy create a resilient union."}
          </p>
        </div>
      </Page>

      {/* PAGE 20: LIFE AREA - HEALTH */}
      <Page model={model} pageNum={20} sectionTitle={labels.sections.health ?? "Health & Vitality"}>
        <h2 className="report-h2">{labels.sections.health ?? "Health & Vitality (6th House)"}</h2>
        <div className="report-banner">
          <strong>{isHi ? "षष्ठ भाव राशि:" : "6th House Sign:"}</strong> {model.lifeAreas[2]?.signName}
        </div>
        <div className="report-card">
          <p className="report-p">{model.lifeAreas[2]?.body}</p>
        </div>
        <div className="report-card" style={{ background: "var(--col-cream)" }}>
          <h3 className="report-h3">{isHi ? "आरोग्य एवं संतुलन" : "Holistic Wellness"}</h3>
          <p className="report-p" style={{ marginBottom: 0 }}>
            {isHi
              ? "संतुलित आहार, समय पर निद्रा एवं नियमित योग/व्यायाम को जीवनचर्या का अभिन्न अंग बनाएं। स्वास्थ्य संबंधी समस्याओं पर सदैव योग्य चिकित्सक से परामर्श लें।"
              : "Integrate wholesome nutrition, restful sleep, and gentle daily exercise into your routine. Always consult certified medical practitioners for health needs."}
          </p>
        </div>
      </Page>

      {/* PAGE 21: LIFE AREA - MONEY */}
      <Page model={model} pageNum={21} sectionTitle={labels.sections.money ?? "Finances & Prosperity"}>
        <h2 className="report-h2">{labels.sections.money ?? "Finances & Prosperity (2nd House)"}</h2>
        <div className="report-banner">
          <strong>{isHi ? "द्वितीय भाव राशि:" : "2nd House Sign:"}</strong> {model.lifeAreas[3]?.signName}
        </div>
        <div className="report-card">
          <p className="report-p">{model.lifeAreas[3]?.body}</p>
        </div>
        <div className="report-card" style={{ background: "var(--col-cream)" }}>
          <h3 className="report-h3">{isHi ? "आर्थिक स्थिरता का सिद्धांत" : "Financial Prudence"}</h3>
          <p className="report-p" style={{ marginBottom: 0 }}>
            {isHi
              ? "सट्टा व त्वरित लाभ की योजनाओं से बचें। योजनाबद्ध बचत, दीर्घकालिक निवेश तथा नैतिक आय ही स्थायी समृद्धि का मूल आधार हैं।"
              : "Avoid speculative shortcuts. Systematic saving, prudent long-term investment, and ethical stewardship underpin lasting wealth."}
          </p>
        </div>
      </Page>

      {/* PAGE 22: LIFE AREA - FAMILY */}
      <Page model={model} pageNum={22} sectionTitle={labels.sections.family ?? "Family & Domestic Life"}>
        <h2 className="report-h2">{labels.sections.family ?? "Family & Domestic Life (4th House)"}</h2>
        <div className="report-banner">
          <strong>{isHi ? "चतुर्थ भाव राशि:" : "4th House Sign:"}</strong> {model.lifeAreas[4]?.signName}
        </div>
        <div className="report-card">
          <p className="report-p">{model.lifeAreas[4]?.body}</p>
        </div>
        <div className="report-card" style={{ background: "var(--col-cream)" }}>
          <h3 className="report-h3">{isHi ? "पारिवारिक शांति का संबल" : "Domestic Foundation"}</h3>
          <p className="report-p" style={{ marginBottom: 0 }}>
            {isHi
              ? "गृह में शांति एवं स्नेह का वातावरण बनाए रखने के लिए परिजनों के साथ गुणवत्तापूर्ण समय बिताएं और पुरानी कटुताओं को क्षमा करें।"
              : "Cultivate quality family moments and practice forgiveness to ensure your home remains a comforting sanctuary."}
          </p>
        </div>
      </Page>

      {/* PAGE 23: LIFE AREA - EDUCATION */}
      <Page model={model} pageNum={23} sectionTitle={labels.sections.education ?? "Knowledge & Education"}>
        <h2 className="report-h2">{labels.sections.education ?? "Knowledge & Education (5th House)"}</h2>
        <div className="report-banner">
          <strong>{isHi ? "पंचम भाव राशि:" : "5th House Sign:"}</strong> {model.lifeAreas[5]?.signName}
        </div>
        <div className="report-card">
          <p className="report-p">{model.lifeAreas[5]?.body}</p>
        </div>
        <div className="report-card" style={{ background: "var(--col-cream)" }}>
          <h3 className="report-h3">{isHi ? "विद्या व प्रज्ञा" : "Intellectual Growth"}</h3>
          <p className="report-p" style={{ marginBottom: 0 }}>
            {isHi
              ? "जिज्ञासा एवं एकाग्रता का विकास करें। स्वाध्याय एवं उच्च ज्ञान की साधना से बौद्धिक क्षमता निरंतर प्रखर होती है।"
              : "Continuous study and deep contemplation sharpen natural intellect into authoritative wisdom."}
          </p>
        </div>
      </Page>

      {/* PAGE 24: ASCENDANT (LAGNA) ANALYSIS */}
      <Page model={model} pageNum={24} sectionTitle={labels.sections.lagnaAnalysis ?? "Lagna Analysis"}>
        <h2 className="report-h2">{labels.sections.lagnaAnalysis ?? "Ascendant (Lagna) Analysis"}</h2>
        {model.lagnaAnalysis.unknownTimeNote && (
          <div className="report-banner">
            <strong>{isHi ? "विशेष टिप्पणी:" : "Important Note:"}</strong>{" "}
            {model.lagnaAnalysis.unknownTimeNote}
          </div>
        )}
        <div className="report-card">
          <h3 className="report-h3">{model.lagnaAnalysis.title}</h3>
          <p className="report-p">{model.lagnaAnalysis.body}</p>
        </div>
        <div className="report-card" style={{ background: "var(--col-cream)" }}>
          <h3 className="report-h3">{isHi ? "आत्म-विकास की दिशा" : "Pathway for Growth"}</h3>
          <p className="report-p" style={{ marginBottom: 0 }}>
            {isHi
              ? "अपनी नैसर्गिक शक्तियों को पहचानें और कमजोरियों को सजगता से परिमार्जित करें। आपका लग्न ही आपके संपूर्ण व्यक्तित्व की आधारशिला है।"
              : "Acknowledge your intrinsic gifts while mindfully refining areas of reactivity to ground your fullest potential."}
          </p>
        </div>
      </Page>

      {/* PAGE 25: MOON SIGN & NAKSHATRA */}
      <Page model={model} pageNum={25} sectionTitle={labels.sections.moonAnalysis ?? "Moon Sign & Nakshatra"}>
        <h2 className="report-h2">{labels.sections.moonAnalysis ?? "Moon Sign & Mind Analysis"}</h2>
        <div className="report-card">
          <h3 className="report-h3">
            {isHi ? "चन्द्र राशि:" : "Moon Sign (Chandra Rashi):"} {model.moonSignAnalysis.signName}
          </h3>
          <p className="report-p">{model.moonSignAnalysis.body}</p>
        </div>

        <div className="report-card">
          <h3 className="report-h3">
            {isHi ? "जन्म नक्षत्र:" : "Birth Nakshatra:"} {model.nakshatraAnalysis.name} ({isHi ? "चरण" : "Pada"} {model.nakshatraAnalysis.pada})
          </h3>
          <p className="report-p">{model.nakshatraAnalysis.body}</p>
        </div>
      </Page>

      {/* PAGE 26: GEMSTONE & RUDRAKSHA GUIDANCE */}
      <Page model={model} pageNum={26} sectionTitle={labels.sections.gemstones ?? "Gemstone Guidance"}>
        <h2 className="report-h2">{labels.sections.gemstones ?? "Gemstone & Rudraksha Guidance"}</h2>
        <p className="report-subtitle">
          {isHi
            ? "लग्न स्वामी एवं शुभ ग्रहों की ऊर्जा को संतुलित करने हेतु शास्त्रीय अनुशंसा।"
            : "Classical recommendations to harmonize planetary resonances safely and constructively."}
        </p>
        <div className="grid-2">
          <div className="report-card">
            <div className="report-badge" style={{ marginBottom: 6 }}>
              {isHi ? "रत्न संस्तुति" : "Recommended Gem"}
            </div>
            <h3 className="report-h3">{model.gems.gem}</h3>
            <p className="report-p" style={{ fontSize: 10.5 }}>
              {isHi
                ? "यह रत्न आपके लग्न स्वामी की सकारात्मक ऊर्जा को संवर्धित करने हेतु शास्त्रीय विधि से धारण किया जा सकता है।"
                : "Fortifies the beneficial vibrations of your foundational planetary ruler."}
            </p>
          </div>
          <div className="report-card">
            <div className="report-badge" style={{ marginBottom: 6 }}>
              {isHi ? "रुद्राक्ष संस्तुति" : "Recommended Rudraksha"}
            </div>
            <h3 className="report-h3">{model.gems.rudraksha}</h3>
            <p className="report-p" style={{ fontSize: 10.5 }}>
              {isHi
                ? "रुद्राक्ष मानसिक शांति, ध्यान एवं आध्यात्मिक सुरक्षा प्रदान करने वाला दिव्य फल है।"
                : "A sacred shield fostering quiet mental equanimity, protective grace, and focus."}
            </p>
          </div>
        </div>

        <div className="report-card">
          <h3 className="report-h3">{isHi ? "दैनिक इष्ट मंत्र" : "Sacred Resonant Mantra"}</h3>
          <p className="report-p" style={{ fontStyle: "italic", fontSize: 13, color: "var(--col-em9)" }}>
            “{model.gems.mantra}”
          </p>
          <p className="report-p" style={{ marginBottom: 0 }}>
            {model.gems.note}
          </p>
        </div>
      </Page>

      {/* PAGE 27: REMEDIES */}
      <Page model={model} pageNum={27} sectionTitle={labels.sections.remedies ?? "Practical Remedies"}>
        <h2 className="report-h2">{labels.sections.remedies ?? "Practical Remedies & Spiritual Guidance"}</h2>
        <p className="report-subtitle">
          {isHi
            ? "कर्म परिष्कार, सेवा, दान तथा सहज अनुशासनात्मक उपाय।"
            : "Disciplined personal practices, charity, and ethical mindfulness for planetary balance."}
        </p>
        {model.remedies.map((rem) => (
          <div key={rem.key} className="report-card" style={{ marginBottom: 12 }}>
            <h3 className="report-h3">
              {rem.name} — <span style={{ fontSize: 12, color: "var(--col-g7)" }}>{rem.reason}</span>
            </h3>
            <p className="report-p" style={{ marginBottom: 0 }}>{rem.body}</p>
          </div>
        ))}
      </Page>

      {/* PAGE 28: DISCLAIMER & ABOUT SADHAK JI */}
      <Page model={model} pageNum={28} sectionTitle={labels.sections.disclaimer ?? "Ethical Guidance"}>
        <h2 className="report-h2">{labels.sections.disclaimer ?? "Ethical Guidance & Spiritual Disclaimer"}</h2>
        <div className="report-card">
          <h3 className="report-h3">{isHi ? "मार्गदर्शक सिद्धांत" : "Principles of Astrological Consultation"}</h3>
          <p className="report-p">
            {isHi
              ? "यह वैदिक जन्मपत्री प्रतिवेदन शास्त्रीय लहिड़ी गणनाओं एवं प्राचीन सूत्रों के आधार पर मार्गदर्शन हेतु तैयार किया गया है। ज्योतिष किसी नियति का अंतिम आदेश नहीं है; मनुष्य का पुरुषार्थ, विवेक तथा सत्कर्म ही उसके भाग्य के सर्वोच्च निर्माता हैं।"
              : "This Vedic Janampatri report is prepared from classical sidereal Lahiri calculations for spiritual guidance. Astrology is an advisory lantern; conscious human effort, moral integrity, and wise action remain supreme in shaping human destiny."}
          </p>
          <p className="report-p" style={{ marginBottom: 0 }}>
            {isHi
              ? "स्वास्थ्य, चिकित्सा, विधि अथवा वित्तीय निर्णयों के लिए सदैव संबंधित योग्य एवं पंजीकृत विशेषज्ञों से परामर्श अवश्य लें। यह प्रतिवेदन किसी भी रूप में चिकित्सीय या कानूनी सलाह का विकल्प नहीं है।"
              : "For medical, legal, psychological, or investment matters, always consult qualified and licensed professionals. This document is never a substitute for clinical or legal counsel."}
          </p>
        </div>

        <div className="report-card" style={{ background: "var(--col-cream)", borderTop: "2px solid var(--col-g5)" }}>
          <h3 className="report-h3">{isHi ? "साधक पवन पाण्डेय जी के विषय में" : "About Sadhak Pawan Pandey"}</h3>
          <p className="report-p">
            {isHi
              ? "साधक पवन पाण्डेय जी माँ काली की अनन्य साधना तथा वैदिक ज्योतिष के विशुद्ध, अंधविश्वास-मुक्त प्रचार-प्रसार हेतु समर्पित हैं। उनका लक्ष्य साधकों एवं जिज्ञासुओं को भय से मुक्त कर आध्यात्मिक विवेक तथा आत्मबल प्रदान करना है।"
              : "Sadhak Pawan Pandey is dedicated to authentic, fear-free Vedic astrology grounded in classical sacred practice. His mission is to dispel superstition and empower seekers with quiet inner clarity and devotion."}
          </p>
          <p className="report-p" style={{ fontStyle: "italic", color: "var(--col-em9)", marginBottom: 0 }}>
            {isHi
              ? "“सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः। सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥”"
              : "“May all beings be peaceful, happy, and free from fear.”"}
          </p>
        </div>
      </Page>
    </div>
  );
}

# B25 — Kundali engine + birth places
**Risk:** H · **Needs:** B24 · **Agent:** Claude recommended · **User setup before QA:** none

## Goal
Accurate sidereal (Lahiri) charts computed on the server with `astronomy-engine`: lagna, planets, houses, nakshatra, navamsa, panchang, Vimshottari dasha, Manglik / Kaal Sarp / Sade Sati, yogas — producing `ChartSnapshot`. A real birth-place search (lat/lon/time zone). The free tools (Kundali ₹99 preview, home Kundali mini, Rashi finder) switch from the approximate maths to this engine with the same UI.

## Read first (only these)
- `docs/backend/RULES.md` §2, §5
- `docs/backend/DATA-MODEL.md` §B (`src/lib/domain/kundali.ts`)
- `src/lib/astro/kundali.ts` (types, `GRAHA`, `NAK`, `placeSearch`, `kundali()`), `src/lib/astro/chart.ts` (what `chartLayout` reads), `src/lib/data/graha.json`, `nakshatra.json`, `rashi.json` (shapes only)
- `src/components/sections/kundali/KundaliForm.tsx`, `KundaliTool.tsx`, `src/components/sections/home/KundaliMini.tsx`, `src/components/sections/rashifal/RashiFinder.tsx`, `src/lib/validation/astro.ts`
- `node_modules/astronomy-engine/astronomy.d.ts` — only the declarations of `MakeTime`, `SunPosition`, `EclipticGeoMoon`, `GeoVector`, `Ecliptic`, `SiderealTime`, `e_tilt`, `SearchRiseSet`, `Observer`, `Body`, `AstroTime` (use grep)

## Install
```
pnpm add astronomy-engine@^2.1.19
pnpm add -D fflate@^0.8.3
```

## Files
Create:
- `src/server/kundali/engine/time.ts`, `ayanamsa.ts`, `planets.ts`, `lagna.ts`, `nakshatra.ts`, `dasha.ts`, `panchang.ts`, `doshas.ts`, `yogas.ts`, `index.ts`
- `src/server/kundali/content/types.ts`
- `scripts/data/build-places.mjs`, `src/server/kundali/places-data.json` (generated), `src/server/kundali/places.ts`, `src/app/api/places/route.ts`
- `src/server/kundali/actions.ts`, `src/lib/validation/kundali.ts`, `src/lib/astro/from-snapshot.ts`, `src/components/forms/PlaceInput.tsx`
Modify: `KundaliForm.tsx`, `KundaliTool.tsx`, `KundaliMini.tsx`, `RashiFinder.tsx` (use `PlaceInput` + `computeChartAction`), `src/lib/astro/kundali.ts` (remove `kundali()`/`placeSearch()` only if unused afterwards), `messages/en.json`, `messages/hi.json` (place search + attribution strings)
Delete (only if no importer is left): `src/lib/data/cities.json`

## Tasks
- [x] T1. `engine/time.ts`: `tzOffsetMin(tz: string, at: Date): number` (from `Intl.DateTimeFormat(…, { timeZone, hourCycle: "h23", year…second })` parts); `birthToUtc({ dob, tob, tobUnknown, tz }): Date` — wall time (noon when unknown) → UTC by two passes of `local − offset` (historical offsets come from the IANA data in Intl, e.g. India 1942–45). — antigravity
- [x] T2. `engine/ayanamsa.ts`: `T = time.tt / 36525`; IAU-2006 general precession `pA(T) = 5028.796195·T + 1.1054348·T² + 0.00007964·T³ − 0.000023857·T⁴ − 0.0000000383·T⁵` (arcsec); **mean Lahiri** = `23.857092 + pA/3600` (degrees; anchor = Swiss Ephemeris Lahiri at J2000); **true Lahiri** = mean + `e_tilt(time).dpsi / 3600`. Export both. Self-check in a code comment: 2000-01-01 12:00 UT → true ≈ 23.853°; 2024-01-01 → ≈ 24.19°. — antigravity
- [x] T3. `engine/planets.ts`: tropical true-of-date longitudes — Sun `SunPosition(t).elon`, Moon `EclipticGeoMoon(t).lon`, Mars…Saturn `Ecliptic(GeoVector(body, t, true)).elon`; sidereal = tropical − true Lahiri. Rahu = Meeus mean node `125.04452 − 1934.136261·T + 0.0020708·T² + T³/450000` minus **mean** Lahiri; Ketu = Rahu + 180. Retrograde: sidereal speed from ±12 h difference < 0 (Sun/Moon never; nodes always). Normalise all angles to [0, 360). — antigravity
- [x] T4. `engine/lagna.ts`: `RAMC = (SiderealTime(t)·15 + lon) mod 360`, `ε = e_tilt(t).tobl`, `asc = atan2(cos RAMC, −(sin RAMC·cos ε + tan φ·sin ε))` (degrees, normalised), sidereal = asc − true Lahiri. (Check: φ = 0, RAMC = 0 → 90°.) — antigravity
- [x] T5. `engine/nakshatra.ts`: span 13°20′; index 0–26, pada 1–4; lords cycle `ke, ve, su, mo, ma, ra, ju, sa, me` from Ashwini. Navamsa sign `floor(lon / (10/3)) mod 12`. Houses whole-sign from the lagna sign (from the Moon sign when the birth time is unknown). — antigravity
- [x] T6. `engine/dasha.ts`: Vimshottari years `ke 7, ve 20, su 6, mo 10, ma 7, ra 18, ju 16, sa 19, me 17`; year = 365.25 days; first Mahadasha = Moon's nakshatra lord with balance `(1 − fraction elapsed) × years`; continue in order until birth + 120 years; Antardashas inside each Mahadasha start from its own lord with length `MD × AD / 120` years; for the first (partial) MD compute the full sequence and drop the part before birth. — antigravity
- [x] T7. `engine/panchang.ts`: elongation `e = (moon − sun) mod 360` (sidereal); tithi `floor(e/12) + 1` (1–30), paksha shukla ≤ 15; yoga `floor(((sun + moon) mod 360)/(40/3)) + 1` (1–27); karana `floor(e/6) + 1` (1–60); vara = weekday of the local date, minus one day when the birth is before local sunrise (`SearchRiseSet(Body.Sun, new Observer(lat, lon, 0), +1, local midnight, 1)`). — antigravity
- [x] T8. `engine/doshas.ts`: Manglik = Mars in house 1, 2, 4, 7, 8 or 12 counted from the lagna sign / from the Moon sign; Kaal Sarp = all seven planets (Sun…Saturn) strictly inside the 180° arc from Rahu forward to Ketu, or all inside Ketu→Rahu; `type` = Rahu's house; Sade Sati: Saturn's sidereal sign vs natal Moon sign (12th = rising, same = peak, 2nd = setting) at `now`, and `periods` = every span from birth to birth + 100 years where Saturn is in those three signs (monthly scan, boundaries refined to 1 day by bisection). — antigravity
- [x] T9. `engine/yogas.ts`: `YOGA_KEYS = ["gajakesari", "budhaditya", "chandraMangal", "ruchaka", "bhadra", "hamsa", "malavya", "shasha", "kemadruma"]` with rules: Gajakesari = Jupiter in a kendra (1, 4, 7, 10) from the Moon; Budhaditya = Sun + Mercury same sign; Chandra-Mangal = Moon + Mars same sign; Panch Mahapurusha (ruchaka Mars, bhadra Mercury, hamsa Jupiter, malavya Venus, shasha Saturn) = planet in own or exaltation sign **and** in a kendra from the lagna (own/exaltation: Mars 0/7 · 9; Mercury 2/5 · 5; Jupiter 8/11 · 3; Venus 1/6 · 11; Saturn 9/10 · 6 — sign indexes 0 = Mesha); Kemadruma = no planet other than Sun/Rahu/Ketu in the 2nd or 12th from the Moon. Lagna-based yogas are skipped when the birth time is unknown. — antigravity
- [x] T10. `engine/index.ts`: `computeChart(input: { name; dob; tob; tobUnknown; place; lat; lon; tz }, now = new Date()): ChartSnapshot` — assembles everything; pure function, no I/O. — antigravity
- [x] T11. `content/types.ts`: `ReportContent` (exact keys): `labels` (signs[12], planets by `GrahaKey`, nakshatras[27], tithis[30], yogaNames[27], karanas[11], weekdays[7], section titles, table headers), `lagna: Record<0..11, { title; body }>`, `moonSign: Record<0..11, string>`, `nakshatra: Record<0..26, string>`, `planetInHouse: Record<GrahaKey, Record<1..12, string>>`, `lifeArea: Record<"career" | "marriage" | "health" | "money" | "family" | "education", Record<0..11, string>>`, `mahadasha: Record<GrahaKey, string>`, `manglik / kaalSarp: { present; absent }`, `sadeSati: { rising; peak; setting; none }`, `yogas: Record<YogaKey, { title; body }>`, `remedies: Record<GrahaKey, string>`, `gems: Record<0..11, { gem; rudraksha; mantra; note }>`; plus `type PartialReportContent` (deep partial, for Hindi in progress). — antigravity
- [x] T12. `scripts/data/build-places.mjs` (plain Node ESM, `fflate` unzip): download GeoNames `cities1000.zip` + `admin1CodesASCII.txt` (30 s timeouts); keep country `IN` with population ≥ 1000 plus other countries ≥ 100000; output `src/server/kundali/places-data.json` = `{ tz: string[], p: [asciiName, region, countryCode, lat(4 dp), lon(4 dp), tzIndex, population][] }` sorted by population; print count and size. **Run it once** (`node scripts/data/build-places.mjs`) and commit the JSON (must be < 3 MB). — antigravity
- [x] T13. `places.ts`: `searchPlaces(q, limit = 8): Place[]` (`Place = { id; name; region; country; lat; lon; tz }`; ASCII-folded lower-case; prefix matches first, then word-start, then contains; ties by population); data loaded once per instance. `GET /api/places?q=` (2–60 chars) → results, `Cache-Control: public, s-maxage=86400`. — antigravity
- [x] T14. `validation/kundali.ts`: `chartInputSchema` (name 2–60, dob `yyyy-mm-dd` 1900-01-01…today, tob `HH:mm` or null, tobUnknown, place `{ name ≤ 120, lat −90…90, lon −180…180, tz IANA string ≤ 60 }`). `kundali/actions.ts` (`"use server"`): `computeChartAction(input)` → `rateLimit("chart:ip", ip, 30, 3600)` → `computeChart` → `ChartSnapshot`. — antigravity
- [x] T15. `src/lib/astro/from-snapshot.ts`: `toKundali(snap: ChartSnapshot): Kundali` — maps to the existing `Kundali` type so `chartLayout`, `KundaliPreview` and the mini tools keep their rendering. — antigravity
- [x] T16. `PlaceInput.tsx` (client, ARIA combobox): debounced 250 ms `/api/places` search, keyboard navigation, selected place returned to the parent; small footer "Place data © GeoNames (CC BY 4.0)"; same look as the current place inputs. — antigravity
- [x] T17. `KundaliForm`/`KundaliTool` (`/kundali-99`), `KundaliMini` (home), `RashiFinder` (rashifal): use `PlaceInput` and `computeChartAction` + `toKundali`; keep the existing generating/preview states and copy. Remove now-unused approximate code/data (list in Done-notes). — antigravity
- [x] T18. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- No Swiss Ephemeris, no native modules, no external astrology API. No report/PDF (B29, B30).

## Done-notes
- Engine created: pure sidereal Lahiri astronomical engine with `astronomy-engine` for true Lahiri ayanamsa, planetary positions, Lagna, Nakshatras, Vimshottari dasha, Panchang, Doshas (Manglik, Kaal Sarp, Sade Sati), and Yogas.
- Places: GeoNames pipeline in `scripts/data/build-places.mjs` built `places-data.json` (0.70 MB, < 3 MB limit) with 12,782 places; search endpoint `GET /api/places` with population-weighted prefix/word/contains matching.
- UI: created `PlaceInput.tsx` combobox; updated `KundaliForm`, `KundaliTool`, `KundaliMini`, and `RashiFinder` to use `PlaceInput` and `computeChartAction` + `toKundali`.
- Removed approximate `kundali()` maths; kept `cities.json` and `placeSearch()` for `StepDetails.tsx`.
- Migration added: no.
- Next step (B26) will use `src/server/kundali/content/types.ts` (`ReportContent`) to author English report content.

## Manual QA (user)
1. `/kundali-99`: type "Varan…" → Varanasi suggestions; generate → chart + planet table appear as before.
2. Compare with drikpanchang.com (or AstroSage) for the same birth data (e.g. 12 Nov 1986, 06:40, Varanasi): lagna sign, Moon sign, nakshatra + pada and planet signs must match; degrees within ~1′.
3. Home Kundali mini and the Rashi finder work with the new place search.
4. A foreign birthplace (e.g. London) gives the right time zone.
5. `pnpm build` passes.

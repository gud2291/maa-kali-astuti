import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { unzipSync } from "fflate";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");

const CITIES_ZIP_URL = "https://download.geonames.org/export/dump/cities1000.zip";
const ADMIN1_URL = "https://download.geonames.org/export/dump/admin1CodesASCII.txt";
const OUTPUT_FILE = path.join(ROOT, "src/server/kundali/places-data.json");

async function fetchWithTimeout(url, timeoutMs = 30000) {
  console.log(`Downloading ${url}...`);
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res;
}

async function main() {
  // 1. Download admin1 codes
  const adminRes = await fetchWithTimeout(ADMIN1_URL, 30000);
  const adminText = await adminRes.text();
  const adminMap = new Map();
  for (const line of adminText.split("\n")) {
    if (!line.trim()) continue;
    const parts = line.split("\t");
    if (parts.length >= 2) {
      const code = parts[0].trim();
      const asciiName = (parts[2] || parts[1] || "").trim();
      adminMap.set(code, asciiName);
    }
  }
  console.log(`Loaded ${adminMap.size} admin1 regions.`);

  // 2. Download cities1000.zip
  const zipRes = await fetchWithTimeout(CITIES_ZIP_URL, 30000);
  const zipBuffer = new Uint8Array(await zipRes.arrayBuffer());
  console.log(`Unzipping cities1000.zip (${(zipBuffer.byteLength / 1024 / 1024).toFixed(2)} MB)...`);
  const unzipped = unzipSync(zipBuffer);

  const txtData = unzipped["cities1000.txt"];
  if (!txtData) {
    throw new Error("cities1000.txt not found inside cities1000.zip");
  }

  const citiesText = new TextDecoder("utf-8").decode(txtData);
  const lines = citiesText.split("\n");
  console.log(`Processing ${lines.length} city lines...`);

  const tzList = [];
  const tzMap = new Map();
  function getTzIndex(tz) {
    const cleanTz = (tz || "UTC").trim();
    let idx = tzMap.get(cleanTz);
    if (idx === undefined) {
      idx = tzList.length;
      tzList.push(cleanTz);
      tzMap.set(cleanTz, idx);
    }
    return idx;
  }

  const places = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split("\t");
    if (cols.length < 18) continue;

    const name = cols[1]?.trim() || "";
    const asciiName = (cols[2]?.trim() || name).trim();
    const lat = Number(cols[4]);
    const lon = Number(cols[5]);
    const country = cols[8]?.trim() || "";
    const admin1 = cols[10]?.trim() || "";
    const population = parseInt(cols[14] || "0", 10);
    const timezone = cols[17]?.trim() || "UTC";

    // Filter rule: keep country IN with pop >= 1000 plus other countries >= 100000
    const keepIn = country === "IN" && population >= 1000;
    const keepOther = country !== "IN" && population >= 100000;
    if (!keepIn && !keepOther) continue;

    const regionKey = `${country}.${admin1}`;
    const region = adminMap.get(regionKey) || admin1;

    const tzIndex = getTzIndex(timezone);
    const lat4 = Number(lat.toFixed(4));
    const lon4 = Number(lon.toFixed(4));

    places.push([asciiName, region, country, lat4, lon4, tzIndex, population]);
  }

  // Sort descending by population
  places.sort((a, b) => b[6] - a[6]);

  const output = {
    tz: tzList,
    p: places,
  };

  const jsonStr = JSON.stringify(output);
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, jsonStr, "utf-8");

  const sizeMb = (Buffer.byteLength(jsonStr, "utf-8") / (1024 * 1024)).toFixed(2);
  console.log(`Saved ${places.length} places to ${OUTPUT_FILE} (${sizeMb} MB).`);

  if (Number(sizeMb) >= 3.0) {
    throw new Error(`Output file size ${sizeMb} MB exceeds maximum limit of 3 MB`);
  }
}

main().catch((err) => {
  console.error("build-places failed:", err);
  process.exit(1);
});

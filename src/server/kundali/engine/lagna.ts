import "server-only";
import { e_tilt, SiderealTime, type AstroTime } from "astronomy-engine";
import { norm } from "./planets";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

export type LagnaResult = {
  lon: number; // sidereal longitude 0–360
  sign: number; // 0–11
  deg: number; // degrees inside the sign 0–30
};

/**
 * Computes the Ascendant (Lagna) for a given time, latitude, and longitude.
 * RAMC = (SiderealTime(t) * 15 + lon) mod 360
 * ε = e_tilt(t).tobl
 * asc = atan2(cos RAMC, −(sin RAMC·cos ε + tan φ·sin ε))
 * sidereal = asc − true Lahiri
 *
 * Check: φ = 0, RAMC = 0 -> 90°
 */
export function computeLagna(
  t: AstroTime,
  lat: number,
  lon: number,
  trueLahiri: number,
): LagnaResult {
  const ramc = norm(SiderealTime(t) * 15 + lon);
  const eps = e_tilt(t).tobl;

  const ramcRad = ramc * D2R;
  const epsRad = eps * D2R;
  const phiRad = lat * D2R;

  const y = Math.cos(ramcRad);
  const x = -(
    Math.sin(ramcRad) * Math.cos(epsRad) +
    Math.tan(phiRad) * Math.sin(epsRad)
  );

  const ascTrop = norm(Math.atan2(y, x) * R2D);
  const ascSid = norm(ascTrop - trueLahiri);

  const sign = Math.floor(ascSid / 30);
  const deg = ascSid % 30;

  return {
    lon: ascSid,
    sign,
    deg,
  };
}

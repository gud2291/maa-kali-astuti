import "server-only";
import { log } from "@/server/log";
import {
  expireUnpaidOrders,
  expireBookingHolds,
  bookingDayReminders,
  reviewRequests,
  abandonedCheckouts,
  deleteOldPalmPhotos,
  cleanupMedia,
  retryKundali,
  adminDigest,
  cleanupTables,
} from "./jobs";

export type DailyCronResult = Record<string, number | "error">;

export async function runDailyCron(now = new Date()): Promise<DailyCronResult> {
  const result: DailyCronResult = {};

  const jobs = [
    { name: "expireUnpaidOrders", fn: expireUnpaidOrders },
    { name: "expireBookingHolds", fn: expireBookingHolds },
    { name: "bookingDayReminders", fn: bookingDayReminders },
    { name: "reviewRequests", fn: reviewRequests },
    { name: "abandonedCheckouts", fn: abandonedCheckouts },
    { name: "deleteOldPalmPhotos", fn: deleteOldPalmPhotos },
    { name: "cleanupMedia", fn: cleanupMedia },
    { name: "retryKundali", fn: retryKundali },
    { name: "adminDigest", fn: adminDigest },
    { name: "cleanupTables", fn: cleanupTables },
  ];

  for (const job of jobs) {
    try {
      const res = await job.fn(now);
      result[job.name] = res.done;
    } catch (err) {
      log.error(`cron.daily.${job.name}_failed`, { err });
      result[job.name] = "error";
    }
  }

  log.info("cron.daily_completed", { summary: result });
  return result;
}

import "server-only";
import { log } from "@/server/log";
import {
  expireBookingHolds,
  bookingHourReminders,
  retryKundali,
} from "./jobs";

export type FrequentCronResult = Record<string, number | "error">;

export async function runFrequentCron(now = new Date()): Promise<FrequentCronResult> {
  const result: FrequentCronResult = {};

  const jobs = [
    { name: "expireBookingHolds", fn: expireBookingHolds },
    { name: "bookingHourReminders", fn: bookingHourReminders },
    { name: "retryKundali", fn: retryKundali },
  ];

  for (const job of jobs) {
    try {
      const res = await job.fn(now);
      result[job.name] = res.done;
    } catch (err) {
      log.error(`cron.frequent.${job.name}_failed`, { err });
      result[job.name] = "error";
    }
  }

  log.info("cron.frequent_completed", { summary: result });
  return result;
}

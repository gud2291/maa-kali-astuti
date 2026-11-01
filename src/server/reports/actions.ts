"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { requireAdmin } from "@/server/auth/guards";
import { audit } from "@/server/audit";
import { buildMonthlyReport, reportToCsv, MONTH_RE } from "./monthly";

export async function monthlyReportCsvAction(
  month: string,
): Promise<ActionResult<{ csv: string; filename: string }>> {
  return runAction(async () => {
    const actor = await requireAdmin("exports.run");
    const m = z.string().regex(MONTH_RE).parse(month);
    const rep = await buildMonthlyReport(m);
    await audit({
      actorId: actor.id,
      action: "report.export",
      entity: "report",
      entityId: m,
      summary: `Exported sales register for ${m} (${rep.rows.length} orders)`,
    });
    return { csv: reportToCsv(rep), filename: `sales-register-${m}.csv` };
  });
}

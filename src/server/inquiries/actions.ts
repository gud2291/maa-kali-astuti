"use server";

import { runAction, type ActionResult } from "@/server/result";
import { clientIp } from "@/server/request";
import { verifyTurnstile } from "@/server/auth/turnstile";
import { rateLimit } from "@/server/rate-limit";
import { getCustomer } from "@/server/auth/guards";
import { inquirySubmitSchema } from "@/lib/validation/inquiry";
import { createInquiry } from "./service";

export async function submitInquiryAction(
  input: unknown,
): Promise<ActionResult<{ refNo: string }>> {
  return runAction(async () => {
    const data = inquirySubmitSchema.parse(input);

    const ip = await clientIp();
    await verifyTurnstile(data.turnstileToken, ip);

    await rateLimit("inquiry:ip", ip, 5, 3600);
    await rateLimit("inquiry:phone", data.phone, 3, 86400);

    const customer = await getCustomer();
    const { ref } = await createInquiry(data, {
      ip,
      userId: customer?.id ?? null,
    });

    return { refNo: ref };
  });
}

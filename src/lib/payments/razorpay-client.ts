export type RazorpayOptions = {
  key: string;
  orderId: string;
  amountPaise: number;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    method?: string;
  };
};

export type RazorpayResult =
  | {
      status: "paid";
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }
  | { status: "dismissed" }
  | { status: "failed"; reason: string };

type RazorpayInstance = {
  open: () => void;
  on: (
    event: string,
    handler: (resp: { error?: { description?: string; code?: string } }) => void,
  ) => void;
};

type RazorpayConstructor = new (options: unknown) => RazorpayInstance;

let scriptPromise: Promise<boolean> | null = null;

export function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if ((window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay) {
    return Promise.resolve(true);
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export async function openRazorpay(
  opts: RazorpayOptions,
): Promise<RazorpayResult> {
  const loaded = await loadRazorpay();
  if (!loaded) {
    return { status: "failed", reason: "Could not load Razorpay SDK" };
  }

  return new Promise((resolve) => {
    let resolved = false;

    const RazorpayClass = (
      window as unknown as { Razorpay: RazorpayConstructor }
    ).Razorpay;

    if (!RazorpayClass) {
      resolve({ status: "failed", reason: "Razorpay SDK not available" });
      return;
    }

    const rzp = new RazorpayClass({
      key: opts.key,
      amount: opts.amountPaise,
      currency: "INR",
      name: opts.name,
      description: opts.description,
      order_id: opts.orderId,
      prefill: opts.prefill,
      theme: {
        color: "#164E3F",
      },
      modal: {
        ondismiss: () => {
          if (!resolved) {
            resolved = true;
            resolve({ status: "dismissed" });
          }
        },
      },
      handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        if (!resolved) {
          resolved = true;
          resolve({
            status: "paid",
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        }
      },
    });

    rzp.on("payment.failed", (response) => {
      if (!resolved) {
        resolved = true;
        const reason = response.error?.description || "Payment failed";
        resolve({ status: "failed", reason });
      }
    });

    rzp.open();
  });
}

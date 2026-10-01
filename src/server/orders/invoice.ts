import "server-only";

import type { orders, orderItems } from "@/server/db/schema/commerce";
import type { InvoiceSettings, ContactSettings } from "@/lib/validation/settings";
import type { OrderView } from "./queries";
import { formatIst } from "@/lib/core/ist";

export const STATE_CODE_MAP: Record<string, string> = {
  "Jammu and Kashmir": "01",
  "Himachal Pradesh": "02",
  "Punjab": "03",
  "Chandigarh": "04",
  "Uttarakhand": "05",
  "Haryana": "06",
  "Delhi": "07",
  "Rajasthan": "08",
  "Uttar Pradesh": "09",
  "Bihar": "10",
  "Sikkim": "11",
  "Arunachal Pradesh": "12",
  "Nagaland": "13",
  "Manipur": "14",
  "Mizoram": "15",
  "Tripura": "16",
  "Meghalaya": "17",
  "Assam": "18",
  "West Bengal": "19",
  "Jharkhand": "20",
  "Odisha": "21",
  "Chhattisgarh": "22",
  "Madhya Pradesh": "23",
  "Gujarat": "24",
  "Dadra and Nagar Haveli and Daman and Diu": "26",
  "Maharashtra": "27",
  "Karnataka": "29",
  "Goa": "30",
  "Lakshadweep": "31",
  "Kerala": "32",
  "Tamil Nadu": "33",
  "Puducherry": "34",
  "Andaman and Nicobar Islands": "35",
  "Telangana": "36",
  "Andhra Pradesh": "37",
  "Ladakh": "38",
};

export type InvoiceItemLine = {
  id: number;
  description: string;
  variant: string | null;
  hsn: string | null;
  qty: number;
  unitPriceInr: number;
  totalInr: number;
  gstRate: number;
  taxableInr: number;
  cgstInr: number;
  sgstInr: number;
  igstInr: number;
};

export type InvoiceFeeLine = {
  description: string;
  sac: string;
  qty: number;
  totalInr: number;
  gstRate: number;
  taxableInr: number;
  cgstInr: number;
  sgstInr: number;
  igstInr: number;
};

export type TaxSummaryRow = {
  rate: number;
  taxableInr: number;
  cgstInr: number;
  sgstInr: number;
  igstInr: number;
  totalTaxInr: number;
};

export type InvoiceSeller = {
  legalName: string;
  gstin: string | null;
  address: string;
  stateCode: string;
  email: string;
  phone: string;
};

export type InvoiceBuyer = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  stateCode: string | null;
};

export type InvoiceData = {
  title: "Tax Invoice" | "Bill of Supply";
  isTaxInvoice: boolean;
  invoiceNo: string;
  orderNumber: string;
  orderDate: string;
  paymentMethod: string;
  paymentStatus: string;
  seller: InvoiceSeller;
  buyer: InvoiceBuyer;
  lines: InvoiceItemLine[];
  feeLines: InvoiceFeeLine[];
  discountInr: number;
  totals: {
    itemsInr: number;
    feesInr: number;
    discountInr: number;
    taxableInr: number;
    cgstInr: number;
    sgstInr: number;
    igstInr: number;
    totalTaxInr: number;
    grandTotalInr: number;
  };
  taxSummary: TaxSummaryRow[];
  isIntrastate: boolean;
  notes: string[];
};

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function getStateCode(stateName: string): string | null {
  const trimmed = stateName.trim();
  if (STATE_CODE_MAP[trimmed]) return STATE_CODE_MAP[trimmed];
  const lower = trimmed.toLowerCase();
  for (const [name, code] of Object.entries(STATE_CODE_MAP)) {
    if (name.toLowerCase() === lower) return code;
  }
  return null;
}

export type OrderInvoiceInput =
  | (typeof orders.$inferSelect & {
      items?: (typeof orderItems.$inferSelect)[];
    })
  | OrderView;

export type OrderItemInvoiceInput =
  | typeof orderItems.$inferSelect
  | {
      id: number;
      nameEn?: string;
      nameHi?: string;
      name?: { en: string; hi: string };
      variant?: string | null;
      qty: number;
      priceInr: number;
      lineTotalInr: number;
      gstRate?: number | null;
      hsn?: string | null;
    };

export function buildInvoice(
  order: OrderInvoiceInput,
  items: OrderItemInvoiceInput[],
  invoiceSettings: InvoiceSettings,
  contact: ContactSettings,
): InvoiceData {
  const hasGstin = Boolean(invoiceSettings.gstin && invoiceSettings.gstin.trim());
  const isTaxInvoice = hasGstin;
  const title = isTaxInvoice ? "Tax Invoice" : "Bill of Supply";
  const invoiceNo = order.invoiceNo || "Not issued";

  const orderDateMs =
    order.placedAt instanceof Date
      ? order.placedAt.getTime()
      : typeof order.placedAt === "number"
        ? order.placedAt
        : order.createdAt instanceof Date
          ? order.createdAt.getTime()
          : typeof order.createdAt === "number"
            ? order.createdAt
            : Date.now();

  const formattedOrderDate = formatIst(new Date(orderDateMs), {
    time: false,
  });

  const buyerState =
    "shipAddress" in order
      ? order.shipAddress.state
      : "address" in order
        ? order.address.state
        : "";

  const buyerStateCode = getStateCode(buyerState);
  const sellerStateCode = (invoiceSettings.stateCode || "").trim();

  // Intrastate if both state codes match and are non-empty
  const isIntrastate = Boolean(
    sellerStateCode && buyerStateCode && sellerStateCode === buyerStateCode,
  );

  const buyerAddress =
    "shipAddress" in order
      ? order.shipAddress
      : "address" in order
        ? order.address
        : {
            name: "",
            phone: "",
            line1: "",
            line2: "",
            landmark: "",
            city: "",
            state: "",
            pincode: "",
          };

  const buyer: InvoiceBuyer = {
    name: buyerAddress.name,
    phone: buyerAddress.phone,
    line1: buyerAddress.line1,
    line2: buyerAddress.line2 || "",
    landmark: buyerAddress.landmark || "",
    city: buyerAddress.city,
    state: buyerAddress.state,
    pincode: buyerAddress.pincode,
    stateCode: buyerStateCode,
  };

  const seller: InvoiceSeller = {
    legalName: invoiceSettings.legalName || "Maa Kali Astuti",
    gstin: invoiceSettings.gstin || null,
    address: invoiceSettings.address || contact.address.en || "",
    stateCode: sellerStateCode,
    email: contact.email,
    phone: contact.phoneDisplay,
  };

  // Build product item lines
  const lines: InvoiceItemLine[] = items.map((item) => {
    const desc =
      "nameEn" in item && item.nameEn
        ? item.nameEn
        : "name" in item && item.name?.en
          ? item.name.en
          : "Sacred Offering";

    const variant = item.variant ?? null;
    const hsn = ("hsn" in item && item.hsn) || "7117"; // default imitation jewellery / sacred beads
    const gstRate = ("gstRate" in item && typeof item.gstRate === "number") ? item.gstRate : 0;
    const totalInr = item.priceInr * item.qty;

    if (!isTaxInvoice || gstRate <= 0) {
      return {
        id: item.id,
        description: desc,
        variant,
        hsn,
        qty: item.qty,
        unitPriceInr: item.priceInr,
        totalInr,
        gstRate: 0,
        taxableInr: totalInr,
        cgstInr: 0,
        sgstInr: 0,
        igstInr: 0,
      };
    }

    const taxableInr = round2(totalInr / (1 + gstRate / 100));
    const taxAmount = round2(totalInr - taxableInr);

    let cgstInr = 0;
    let sgstInr = 0;
    let igstInr = 0;

    if (isIntrastate) {
      cgstInr = round2(taxAmount / 2);
      sgstInr = round2(taxAmount - cgstInr);
    } else {
      igstInr = taxAmount;
    }

    return {
      id: item.id,
      description: desc,
      variant,
      hsn,
      qty: item.qty,
      unitPriceInr: item.priceInr,
      totalInr,
      gstRate,
      taxableInr,
      cgstInr,
      sgstInr,
      igstInr,
    };
  });

  // Build fee lines (energization, shipping, express, COD, gift wrap) at 18%
  const feeLines: InvoiceFeeLine[] = [];
  const FEE_GST_RATE = 18;

  const energInr =
    "energInr" in order
      ? order.energInr
      : "totals" in order
        ? order.totals.energ
        : 0;

  const shippingInr =
    "shippingInr" in order
      ? order.shippingInr
      : "totals" in order
        ? order.totals.shipping
        : 0;

  const expressInr =
    "expressInr" in order
      ? order.expressInr
      : "totals" in order
        ? order.totals.express
        : 0;

  const codInr =
    "codInr" in order
      ? order.codInr
      : "totals" in order
        ? order.totals.cod
        : 0;

  const giftInr =
    "giftInr" in order
      ? order.giftInr
      : "totals" in order
        ? order.totals.gift
        : 0;

  const addFeeLine = (description: string, sac: string, amount: number) => {
    if (amount <= 0) return;
    if (!isTaxInvoice) {
      feeLines.push({
        description,
        sac,
        qty: 1,
        totalInr: amount,
        gstRate: 0,
        taxableInr: amount,
        cgstInr: 0,
        sgstInr: 0,
        igstInr: 0,
      });
      return;
    }

    const taxableInr = round2(amount / (1 + FEE_GST_RATE / 100));
    const taxAmount = round2(amount - taxableInr);

    let cgstInr = 0;
    let sgstInr = 0;
    let igstInr = 0;

    if (isIntrastate) {
      cgstInr = round2(taxAmount / 2);
      sgstInr = round2(taxAmount - cgstInr);
    } else {
      igstInr = taxAmount;
    }

    feeLines.push({
      description,
      sac,
      qty: 1,
      totalInr: amount,
      gstRate: FEE_GST_RATE,
      taxableInr,
      cgstInr,
      sgstInr,
      igstInr,
    });
  };

  addFeeLine("Energization & Vedic Sanctification (Pran Pratishtha)", "9997", energInr);
  addFeeLine("Standard Delivery & Safe Transit Insurance", "9968", shippingInr);
  addFeeLine("Express Priority Air Dispatch", "9968", expressInr);
  addFeeLine("Cash on Delivery (COD) Processing Fee", "9971", codInr);
  addFeeLine("Sacred Gift Packaging & Blessing Card", "9985", giftInr);

  const discountInr =
    "discountInr" in order
      ? order.discountInr
      : "totals" in order
        ? order.totals.discount
        : 0;

  // Aggregate totals
  const itemsInr = lines.reduce((acc, l) => acc + l.totalInr, 0);
  const feesInr = feeLines.reduce((acc, l) => acc + l.totalInr, 0);

  const taxableInr = round2(
    lines.reduce((acc, l) => acc + l.taxableInr, 0) +
      feeLines.reduce((acc, l) => acc + l.taxableInr, 0) -
      (isTaxInvoice && discountInr > 0 ? discountInr : 0),
  );

  const cgstInr = round2(
    lines.reduce((acc, l) => acc + l.cgstInr, 0) +
      feeLines.reduce((acc, l) => acc + l.cgstInr, 0),
  );

  const sgstInr = round2(
    lines.reduce((acc, l) => acc + l.sgstInr, 0) +
      feeLines.reduce((acc, l) => acc + l.sgstInr, 0),
  );

  const igstInr = round2(
    lines.reduce((acc, l) => acc + l.igstInr, 0) +
      feeLines.reduce((acc, l) => acc + l.igstInr, 0),
  );

  const totalTaxInr = round2(cgstInr + sgstInr + igstInr);

  const grandTotalInr =
    "totalInr" in order
      ? order.totalInr
      : "totals" in order
        ? order.totals.total
        : itemsInr + feesInr - discountInr;

  // Group into Tax Summary table
  const rateMap = new Map<
    number,
    { taxable: number; cgst: number; sgst: number; igst: number }
  >();

  if (isTaxInvoice) {
    const allTaxableRows = [
      ...lines.map((l) => ({
        rate: l.gstRate,
        taxable: l.taxableInr,
        cgst: l.cgstInr,
        sgst: l.sgstInr,
        igst: l.igstInr,
      })),
      ...feeLines.map((l) => ({
        rate: l.gstRate,
        taxable: l.taxableInr,
        cgst: l.cgstInr,
        sgst: l.sgstInr,
        igst: l.igstInr,
      })),
    ];

    for (const r of allTaxableRows) {
      if (r.rate <= 0) continue;
      const existing = rateMap.get(r.rate) ?? {
        taxable: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
      };
      existing.taxable += r.taxable;
      existing.cgst += r.cgst;
      existing.sgst += r.sgst;
      existing.igst += r.igst;
      rateMap.set(r.rate, existing);
    }
  }

  const taxSummary: TaxSummaryRow[] = Array.from(rateMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([rate, v]) => ({
      rate,
      taxableInr: round2(v.taxable),
      cgstInr: round2(v.cgst),
      sgstInr: round2(v.sgst),
      igstInr: round2(v.igst),
      totalTaxInr: round2(v.cgst + v.sgst + v.igst),
    }));

  return {
    title,
    isTaxInvoice,
    invoiceNo,
    orderNumber: order.number,
    orderDate: formattedOrderDate,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    seller,
    buyer,
    lines,
    feeLines,
    discountInr,
    totals: {
      itemsInr,
      feesInr,
      discountInr,
      taxableInr,
      cgstInr,
      sgstInr,
      igstInr,
      totalTaxInr,
      grandTotalInr,
    },
    taxSummary,
    isIntrastate,
    notes: [
      "All spiritual offerings are energized per authentic Vedic tradition by Sadhak Pawan Pandey.",
      "Goods once sold are covered under our 7-day holy item return and replacement policy.",
      "This is a computer-generated invoice and does not require a physical signature.",
    ],
  };
}

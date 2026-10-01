import type { Locale, OrderStatus } from "@/lib/domain/enums";

export type WaTemplateParams = {
  customerName: string;
  orderNumber: string;
  status: OrderStatus;
  locale?: Locale;
  energizationDate?: string | null;
  courier?: string | null;
  awb?: string | null;
  trackingUrl?: string | null;
};

export function getOrderWhatsAppMessage(params: WaTemplateParams): string {
  const isHi = params.locale === "hi";
  const name = params.customerName;
  const num = params.orderNumber;

  switch (params.status) {
    case "placed":
      return isHi
        ? `प्रणाम ${name} जी, माँ काली अस्तुति पर आपका ऑर्डर ${num} प्राप्त हो गया है। हमारी टीम इसे पूरी श्रद्धा से तैयार कर रही है। जय माँ काली!`
        : `Pranam ${name} ji, your order ${num} at Maa Kali Astuti has been received and confirmed. Jai Maa Kali!`;

    case "energizing":
      return isHi
        ? `प्रणाम ${name} जी, आपके ऑर्डर ${num} की वैदिक प्राण-प्रतिष्ठा (अभिमंत्रण) ${params.energizationDate || "शीघ्र"} को निर्धारित है। महापूजा उपरांत इसे रवाना किया जाएगा।`
        : `Pranam ${name} ji, the sacred energization for your order ${num} is scheduled on ${params.energizationDate || "the upcoming puja"}. It will be dispatched after sanctification.`;

    case "packed":
      return isHi
        ? `प्रणाम ${name} जी, आपका ऑर्डर ${num} पूर्ण पवित्रता के साथ पैक हो चुका है एवं प्रस्थान के लिए तैयार है।`
        : `Pranam ${name} ji, your sacred order ${num} has been carefully packed and is ready for dispatch.`;

    case "shipped": {
      const trackingInfo = params.trackingUrl
        ? `\nट्रैकिंग लिंक: ${params.trackingUrl}`
        : params.awb
          ? ` (AWB: ${params.awb})`
          : "";
      const trackingInfoEn = params.trackingUrl
        ? `\nTracking Link: ${params.trackingUrl}`
        : params.awb
          ? ` (AWB: ${params.awb})`
          : "";
      return isHi
        ? `प्रणाम ${name} जी, आपका पार्सल ${num} ${params.courier || "कूरियर"} द्वारा रवाना कर दिया गया है${trackingInfo}। जय माँ काली!`
        : `Pranam ${name} ji, your sacred parcel ${num} has been shipped via ${params.courier || "courier"}${trackingInfoEn}. Jai Maa Kali!`;
    }

    case "delivered":
      return isHi
        ? `प्रणाम ${name} जी, आपका ऑर्डर ${num} सफलतापूर्वक डिलीवर हो चुका है। माँ काली की कृपा आप एवं आपके परिवार पर सदैव बनी रहे।`
        : `Pranam ${name} ji, your order ${num} has been delivered. May Maa Kali's divine blessings be upon you and your family.`;

    case "cancelled":
      return isHi
        ? `प्रणाम ${name} जी, आपका ऑर्डर ${num} रद्द कर दिया गया है। किसी भी जानकारी के लिए हमें संपर्क करें।`
        : `Pranam ${name} ji, your order ${num} has been cancelled. Please contact us if you have any questions.`;

    default:
      return isHi
        ? `प्रणाम ${name} जी, आपके ऑर्डर ${num} के संबंध में संपर्क कर रहे हैं।`
        : `Pranam ${name} ji, contacting you regarding your order ${num} at Maa Kali Astuti.`;
  }
}

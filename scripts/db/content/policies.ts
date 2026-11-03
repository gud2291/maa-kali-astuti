/* [client-review] Draft content. */
import type { PolicySlug } from "../../../src/lib/domain/enums";
import type { RichDoc } from "../../../src/lib/domain/types";
import { doc, h2, h3, p, b, i, a, ul, ol, quote, countDocWords } from "./rich";

export type SeedPolicyContent = {
  slug: PolicySlug;
  titleHi: string;
  bodyEn: RichDoc;
};

/* 1. Shipping Policy */
const shippingBody: RichDoc = doc(
  p([
    "At Maa Kali Astuti, every sacred item—from Himalayan Nepali Rudraksha beads to consecrated Bhojpatra amulets and energized copper offerings—is treated with profound spiritual care and logistical precision. We recognize that our patrons eagerly anticipate these sacred instruments for their personal sadhana and daily peace. This Shipping Policy outlines our dispatch procedures, consecration timelines, delivery windows, and courier standards across India.",
  ]),
  h2("1. Sacred Consecration and Dispatch Timeline"),
  p([
    "Unlike standard commercial goods, many spiritual artifacts available in our shop undergo traditional consecration (Pran Pratishtha and Mahapuja) at our sacred altar before leaving the ashram. When you select ritual energization for an item, our team prepares the offering in alignment with auspicious daily planetary hours (Muhurats) and the upcoming Mahapuja schedule.",
  ]),
  ul([
    [b("Orders with ritual energization: "), "Items undergo traditional mantra chanting, cleansing with sacred waters, and energization. These orders are carefully packaged and dispatched within 1 to 3 business days following the completed consecration."],
    [b("Standard in-stock offerings: "), "Items that do not require personalized energization are dispatched within 24 to 48 hours of successful payment confirmation."],
  ]),
  h2("2. Domestic Delivery Options and Timelines"),
  p([
    "We partner with reputable, insured domestic courier networks (including Blue Dart, Delhivery, DTDC, and India Post Speed Post) to ensure reliable transit to all serviceable pin codes throughout the Republic of India.",
  ]),
  ul([
    [b("Standard Delivery (4 to 7 Business Days): "), "Our standard shipping service ensures safe, tracked delivery across most Tier 1, Tier 2, and rural Indian postal zones within 4 to 7 business days following dispatch. Orders of ₹999 or more qualify for ", b("Free Standard Shipping"), ". For orders below ₹999, a flat shipping fee of ₹79 is applied at checkout."],
    [b("Express Delivery (2 to 4 Business Days): "), "When you require prioritized transit, Express Delivery is available for a flat fee of ₹99, delivering to major metropolitan centers and provincial capitals within 2 to 4 business days."],
  ]),
  h2("3. Cash on Delivery (COD) Terms"),
  p([
    "To provide maximum accessibility and trust, Cash on Delivery (COD) is supported across eligible pin codes under the following practical conditions:",
  ]),
  ul([
    [b("Cart limits: "), "COD is available for order totals up to ₹5,000. Orders exceeding ₹5,000 must be completed via secure online payment gateways."],
    [b("Processing fee: "), "A nominal COD handling fee of ₹49 is charged to cover specialized cash-handling logistics by our courier partners."],
    [b("Dispatch verification: "), "To prevent fraudulent orders and ensure courier safety, COD shipments may require a brief confirmation via telephone call or WhatsApp verification prior to dispatch."],
  ]),
  h2("4. Tracking, Packaging, and Transit Safety"),
  p([
    "Every consecrated shipment is encased in tamper-evident, protective packaging to prevent moisture and physical impact during transit. Upon dispatch, a real-time tracking number and courier link are transmitted to your registered email address and mobile number via SMS/WhatsApp. You can also monitor your shipment directly through our ",
    a("Track Order", "/track-order"),
    " portal.",
  ]),
  p([
    "If an outer parcel appears visibly damaged, crushed, or tampered with at the time of delivery, please take clear photographs before signing and notify our support desk at ",
    a("support@sadhakpawanpandey.com", "mailto:support@sadhakpawanpandey.com"),
    " within 48 hours for immediate assistance.",
  ]),
);

/* 2. Refund & Returns Policy */
const refundBody: RichDoc = doc(
  p([
    "At Maa Kali Astuti, we take immense pride in the authentic sourcing, meticulous quality control, and sacred consecration of all our spiritual offerings. We understand that purchasing sacred artifacts and booking astrological consultations involves profound trust. This Refund & Returns Policy outlines the conditions under which returns, replacements, and monetary refunds are processed.",
  ]),
  h2("1. 7-Day Return Eligibility Window [client-confirm]"),
  p([
    "We provide a 7-day return window from the confirmed date of delivery for eligible physical products purchased through our online storefront. If an item arrives in a damaged condition, contains manufacturing defects, or differs from the specific product ordered, you are entitled to a full replacement or refund.",
  ]),
  p([
    "To qualify for a valid return under this window, the item must satisfy the following criteria:",
  ]),
  ul([
    [b("Original condition: "), "The bead, bracelet, or copper offering must be completely unworn, undamaged by the user, and in its pristine original state."],
    [b("Complete packaging: "), "The return must include all original packaging materials, sacred certificates, and accompanying booklets."],
    [b("Intact seals: "), "Security tags and sacred consecration threads must remain untampered with."],
  ]),
  h2("2. Non-Returnable and Non-Refundable Offerings"),
  p([
    "Due to the consecrated, customized, and intangible nature of certain offerings, specific categories are strictly non-returnable and non-refundable once initiated or delivered:",
  ]),
  ul([
    [b("Personalized Amulets & Tabeez: "), "Bhojpatra amulets hand-inscribed with your specific Name, Gotra, and astrological intentions cannot be resold or re-energized for another person."],
    [b("Digital Kundali PDF Reports: "), "The Janam Kundali report is free and generated instantly from your supplied birth parameters, so no payment or refund is involved."],
    [b("Completed Spiritual Consultations: "), "Astrological, palmistry, tarot, and numerology consultations represent dedicated professional advisory time and cannot be refunded once the session has transpired."],
  ]),
  h2("3. Return Request Process"),
  p([
    "Initiating a return is simple, transparent, and respectful:",
  ]),
  ol([
    [b("Submit notification: "), "Send an email to ", a("support@sadhakpawanpandey.com", "mailto:support@sadhakpawanpandey.com"), " or contact our care desk via WhatsApp within 7 calendar days of delivery, quoting your Order Number."],
    [b("Provide documentation: "), "Include clear photographs or a short video demonstrating the reported defect or damage along with the parcel label."],
    [b("Reverse courier arrangement: "), "Upon approval, our support team will schedule a complimentary reverse pickup from your registered address via our courier partner."],
  ]),
  h2("4. Inspection and Refund Disbursement Timeline"),
  p([
    "Upon receipt of the returned item at our ashram inspection facility, our team will inspect the item within 48 business hours. Once verified, your refund will be processed promptly:",
  ]),
  ul([
    [b("Online payments: "), "Refunds for orders paid via UPI, Netbanking, Debit/Credit Card, or Digital Wallets are credited back to the original payment source within ", b("5 to 7 working days"), "."],
    [b("Cash on Delivery (COD): "), "For verified returns of COD orders, refunds are disbursed directly to your designated Indian bank account via NEFT or IMPS transfer within 5 to 7 working days after receiving your bank account details."],
  ]),
  h2("5. Order Cancellations"),
  p([
    "You may cancel any standard physical order free of charge before it enters the sacred consecration or dispatch phase. Once an item has undergone ritual Mahapuja consecration or has been handed over to the courier, cancellations can no longer be accepted.",
  ]),
);

/* 3. Privacy Policy */
const privacyBody: RichDoc = doc(
  p([
    "Maa Kali Astuti ('we', 'us', or 'our'), guided by Sadhak Pawan Pandey, is committed to safeguarding the privacy and personal data of every seeker and customer who interacts with our platform. We recognize that our patrons entrust us not only with standard contact and billing details, but also with deeply sensitive personal information—including astrological birth details, family gotra, and palm photographs.",
  ]),
  p([
    "This Privacy Policy is designed in strict alignment with the spirit and requirements of the Digital Personal Data Protection Act, 2023 (DPDP Act 2023) of India, explaining transparently how your data is collected, utilized, stored, protected, and permanently deleted.",
  ]),
  h2("1. Categories of Personal Data We Collect"),
  p([
    "We collect only the minimum necessary data required to deliver authentic spiritual services and fulfill physical orders efficiently:",
  ]),
  ul([
    [b("Identity and contact information: "), "Your full name, email address, telephone number, and physical shipping address required for order fulfillment and customer notifications."],
    [b("Astrological and spiritual parameters: "), "Date of birth, exact time of birth, place of birth, and family Gotra, provided voluntarily by you for Kundali chart generation, horoscope consultations, and personalized altar energization."],
    [b("Palm photographs: "), "High-resolution images of your hands submitted voluntarily for personalized Hastrekha (palmistry) analysis."],
    [b("Technical and transactional data: "), "Order histories, payment identifiers (note: card details and bank credentials are processed directly by RBI-authorized payment aggregators and are never stored on our servers)."],
  ]),
  h2("2. Purpose of Data Processing"),
  p([
    "Your personal data is processed solely for explicit, lawful, and spiritual purposes: (a) generating accurate astronomical charts and personalized reports; (b) conducting scheduled one-on-one astrological consultations; (c) dispatching energized sacred artifacts to your address; and (d) communicating transactional updates, order tracking, and essential service alerts.",
  ]),
  h2("3. Strict Data Retention and Palm Photo Deletion Policy"),
  p([
    "We operate under a strict, time-bound data minimization principle regarding sacred consultation materials:",
  ]),
  quote(
    "Palm photographs and sensitive consultation media submitted for Hastrekha readings are permanently and irreversibly deleted from our secure private cloud storage exactly 30 days after the final consultation report is delivered.",
  ),
  p([
    "Transactional order histories, tax invoices, and account credentials are retained only for the duration required by applicable Indian commercial and tax regulations. You may request the export or deletion of your customer profile at any time.",
  ]),
  h2("4. Information Sharing and Absolute Non-Commercialization"),
  p([
    "We honor the sacred confidentiality of spiritual seeker relationships. We do not sell, rent, lease, trade, or commercially monetize your personal or astrological information to any third-party advertisers, data brokers, or marketing networks. Information is shared only with trusted operational service providers under strict data-processing agreements: (a) logistics and courier partners strictly for physical delivery; and (b) payment gateways for processing financial transactions.",
  ]),
  h2("5. Your Rights as a Data Principal and Grievance Redressal"),
  p([
    "Under the DPDP Act 2023, you enjoy comprehensive rights concerning your personal data, including the right to access a summary of your data, the right to request correction or updating of inaccurate information, and the right to request erasure of your profile. For any privacy inquiries, requests, or grievances, you may contact our designated Grievance Officer directly at ",
    a("support@sadhakpawanpandey.com", "mailto:support@sadhakpawanpandey.com"),
    ".",
  ]),
);

/* 4. Terms of Service */
const termsBody: RichDoc = doc(
  p([
    "Welcome to Maa Kali Astuti (accessible at sadhakpawanpandey.com). These Terms of Service ('Terms') constitute a legally binding agreement between you ('the User', 'Customer', or 'Seeker') and Maa Kali Astuti ('the Platform', 'we', or 'us'). By browsing our website, purchasing products, booking consultations, or enrolling in sadhana mentorships, you acknowledge that you have read, understood, and agreed to be bound by these Terms.",
  ]),
  h2("1. Platform Offerings and Eligibility"),
  p([
    "Maa Kali Astuti is a dedicated platform bridging authentic Vedic spiritual science with contemporary well-being. Our offerings comprise consecrated spiritual artifacts (including Nepali Rudraksha, gemstone crystal bracelets, handmade Bhojpatra amulets, and pure copper offerings), digital astrology reports, personal guidance consultations, and traditional sadhana training courses. You must be at least 18 years of age or possess legal parental consent to make purchases on this platform.",
  ]),
  h2("2. E-Commerce Orders, Pricing, and Cash on Delivery"),
  p([
    "All prices displayed on the website are denominated in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to revise prices, product descriptions, and promotional discounts at our discretion without prior notice.",
  ]),
  ul([
    [b("Order acceptance: "), "An order is deemed accepted only when confirmed via email or SMS. We reserve the right to decline or cancel any order due to stock unavailability, pricing inaccuracies, or courier unserviceability."],
    [b("Cash on Delivery (COD): "), "COD is permitted for orders up to ₹5,000 with a non-refundable processing fee of ₹49. Orders exceeding this limit must be prepaid online. Repeated refusal of verified COD shipments will result in permanent suspension of COD privileges."],
    [b("Maximum quantity: "), "To prevent unauthorized commercial redistribution, standard orders are limited to a maximum quantity of 10 units per product line."],
  ]),
  h2("3. Consultation Bookings and the 12-Hour Reschedule Rule"),
  p([
    "Personal consultations (covering Kundali, Palmistry, Tarot, and Numerology) with Sadhak Pawan Pandey require disciplined scheduling to honor both the mentor's time and waiting seekers:",
  ]),
  ul([
    [b("Reschedule notice: "), "You may reschedule a confirmed consultation slot provided you submit your request at least ", b("12 hours prior"), " to the scheduled appointment time."],
    [b("Reschedule limit: "), "A maximum of ", b("1 reschedule"), " is permitted per booking. Further rescheduling requests will not be entertained."],
    [b("Late cancellations and no-shows: "), "Cancellations made with less than 12 hours notice, or failure to attend the scheduled video/audio session (no-show), will result in forfeiture of the consultation fee."],
  ]),
  h2("4. Digital Reports, Sadhana Courses, and Rituals"),
  p([
    "Our free digital Kundali reports are generated using astronomical algorithms based upon the user-submitted birth data. The accuracy of the resulting report is strictly contingent upon the correctness of the birth parameters you provide.",
  ]),
  p([
    "Enrollment in Sacred Sadhana Courses (course fee ₹50,000) is reserved for sincere seekers who commit to traditional spiritual discipline (niyam) and ethical conduct. Admission into specialized rituals and sadhanas remains subject to spiritual evaluation by Sadhak Ji.",
  ]),
  h2("5. Intellectual Property and Governing Law"),
  p([
    "All literary compositions, ritual mantras, philosophical discourses, video pravachans, brand logos, product descriptions, and photographic content on this platform are the exclusive intellectual property of Maa Kali Astuti and Sadhak Pawan Pandey. Unauthorized reproduction, distribution, or commercial exploitation is strictly prohibited.",
  ]),
  p([
    "These Terms shall be governed by and interpreted in accordance with the laws of the Republic of India. Any legal dispute, controversy, or claim arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the competent courts in India.",
  ]),
);

/* 5. Astrology Disclaimer */
const disclaimerBody: RichDoc = doc(
  p([
    "The consultations, horoscope assessments, astrological reports, gemstone recommendations, energized amulets, and spiritual rituals offered through Maa Kali Astuti and guided by Sadhak Pawan Pandey are rooted in time-honored Vedic traditions, ancient Jyotish Shastra, and classical philosophical systems. We present spirituality not as superstition, but as an ancient science of cosmic resonance and inner alignment.",
  ]),
  p([
    "To ensure clear expectations and ethical integrity, this Astrology Disclaimer clearly defines the scope, nature, and practical boundaries of all spiritual guidance provided on this platform.",
  ]),
  h2("1. Spiritual Guidance, Self-Reflection, and Perspective"),
  p([
    "Vedic astrology, numerology, tarot reading, and palmistry are interpretative disciplines designed to provide psychological clarity, self-awareness, and spiritual perspective regarding life patterns. Planetary movements, dashas, and astrological charts reflect potential cosmic tendencies rather than fatalistic, predestined certainties. All interpretations provided during consultations or in written reports are intended solely as guidance for personal contemplation.",
  ]),
  h2("2. Strict Non-Substitute for Professional Medical, Legal, and Financial Advice"),
  p([
    "Spiritual guidance is neither intended nor permitted to serve as a substitute for qualified professional counsel:",
  ]),
  ul([
    [b("Medical and psychiatric health: "), "Astrological readings and remedies do not diagnose, treat, cure, or prevent any physical or mental medical condition. If you suffer from medical symptoms, psychiatric distress, or severe depression, you must consult licensed healthcare physicians or clinical mental health specialists immediately."],
    [b("Legal disputes: "), "Astrological advice regarding court cases or adversary conflicts provides spiritual solace and moral courage; it is not legal counsel. You must consult a licensed advocate for legal proceedings."],
    [b("Financial and investment decisions: "), "Gemstone recommendations and prosperity remedies are devotional practices. They do not constitute certified financial, tax, or investment advice."],
  ]),
  h2("3. Personal Agency, Free Will, and the Primacy of Karma"),
  p([
    "Vedic philosophy emphatically upholds the supreme primacy of Purushartha (conscious, righteous human endeavor) and the eternal law of Karma. Astrology illuminates the celestial weather of your life, but how you navigate that terrain depends entirely upon your own intellect, moral choices, hard work, and determination.",
  ]),
  quote(
    "Destiny is not a cage of static outcomes; it is a canvas upon which conscious human action, guided by ethical wisdom, shapes your ultimate reality.",
  ),
  p([
    "No astrologer, amulet, or ritual can replace personal responsibility, integrity, and genuine effort.",
  ]),
  h2("4. Spiritual Artifacts, Consecration, and Material Guarantees"),
  p([
    "All sacred items—including Nepali Rudraksha beads, crystal bracelets, Bhojpatra tabeez, and pure copper 12 Nag sets—are authentic devotional artifacts consecrated through traditional Vedic rituals. While these items have been revered for millennia for their subtle energetic properties, individual experiences vary widely based on personal faith, mental receptivity, and lifestyle.",
  ]),
  p([
    "Maa Kali Astuti and Sadhak Pawan Pandey make no miraculous claims, supernatural promises, or absolute guarantees regarding guaranteed wealth, instant success, or specific magical outcomes. Seekers engage with our offerings voluntarily at their own personal discretion and faith.",
  ]),
);

export const SEEDED_POLICIES: SeedPolicyContent[] = [
  {
    slug: "shipping",
    titleHi: "शिपिंग और डिलीवरी नीति",
    bodyEn: shippingBody,
  },
  {
    slug: "refund-returns",
    titleHi: "वापसी और रिफंड नीति",
    bodyEn: refundBody,
  },
  {
    slug: "privacy",
    titleHi: "गोपनीयता नीति",
    bodyEn: privacyBody,
  },
  {
    slug: "terms",
    titleHi: "नियम और शर्तें",
    bodyEn: termsBody,
  },
  {
    slug: "astrology-disclaimer",
    titleHi: "ज्योतिष एवं आध्यात्मिक अस्वीकरण",
    bodyEn: disclaimerBody,
  },
];

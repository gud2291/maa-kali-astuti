/* [client-review] Draft content. */
import type { Loc, RichDoc } from "../../../src/lib/domain/types";
import { doc, h2, h3, p, b, i, ul, ol, quote, countDocWords } from "./rich";

export type SeedArticleContent = {
  slug: string;
  titleHi: string;
  excerptEn: string;
  excerptHi: string;
  bodyEn: RichDoc;
  faq: { q: Loc; a: Loc }[];
  readMins: number;
};

/* Article 1: How to identify an original Nepali Rudraksha */
const body1: RichDoc = doc(
  p([
    "The sacred Rudraksha seed has been revered across India for thousands of years as a profound tool for mental clarity, physical well-being, and spiritual alignment. Sourced primarily from the high-altitude Himalayan valleys of Nepal, genuine Nepali Rudraksha beads are prized for their prominent mukhis (natural facets), pronounced thorny contours, and deep energetic presence. However, the high demand for authentic beads has led to the proliferation of artificially carved wooden imitations and glued assemblies in the marketplace.",
  ]),
  p([
    "At Maa Kali Astuti, we believe that spiritual practice must be grounded in truth rather than blind faith or fear. You do not need expensive laboratory equipment to perform preliminary authenticity checks. By understanding the natural botanical anatomy of the seed and testing its physical characteristics, you can reliably distinguish a genuine Nepali bead from a manufactured substitute in your own home.",
  ]),
  h2("1. Inspecting the Mukhi Grooves and Contour Anatomy"),
  p([
    "The first and most reliable test involves a close visual inspection of the mukhi lines (furrows running from the top hole to the bottom tail of the bead). In a genuine Nepali Rudraksha, these lines are completely natural fissures formed as the seed pod matures on the tree. They run continuously without abrupt artificial endings, fractures, or chemical etching marks.",
  ]),
  ul([
    [b("Deep, natural valleys: "), "Authentic Nepali mukhis form deep, rugged ravines rather than shallow scratched slits."],
    [b("Unbroken continuity: "), "Each furrow travels uninterrupted from the crown (pedicel point) to the base."],
    [b("Thorny projection texture: "), "The surface exhibits raised, irregular woody nodules that cannot be easily replicated by plastic molding."],
  ]),
  p([
    "Under a standard magnifying glass or smartphone zoom lens, examine whether the grooves appear carved with metal tools. Machine-cut beads usually exhibit sharp, unnaturally smooth tool marks or powdered wood residue glued into the crevices.",
  ]),
  h2("2. The Water Immersion Check: Fact Versus Myth"),
  p([
    "There is a widespread myth that every original Rudraksha will instantly sink in water, while fakes float. Scientifically, this is an incomplete and sometimes misleading test. The specific gravity of a genuine seed depends upon whether it is fresh, well-dried, mature, or hollow inside. A ripe, solid seed will generally sink, but an older dehydrated seed may float temporarily.",
  ]),
  p([
    "The real purpose of the water test is different: soak the bead in warm, clean water for several hours. This softens any synthetic glues, artificial dyes, or blended sawdust pastes used by counterfeiters. If the bead begins releasing dark chemical dyes, dissolves at the seams, or separates into two halves, it is a fabricated imitation. An authentic seed remains completely intact, emitting only a mild, natural earthy fragrance.",
  ]),
  h2("3. Internal Seed Compartments and the X-Ray Standard"),
  p([
    "Every genuine mukhi corresponds internally to a distinct seed chamber (locule). For example, an authentic 5 Mukhi bead contains exactly five internal compartments with miniature central seeds. Counterfeiters often take a common 5 Mukhi bead and carefully carve additional lines onto its exterior to sell it as a rare 7, 8, or 10 Mukhi bead.",
  ]),
  quote(
    "Spiritual integrity begins with botanical authenticity. A bead cannot channel specific cosmic energies if its internal architecture contradicts its external appearance.",
  ),
  p([
    "While high-value collector beads should always be accompanied by a certified digital X-ray radiography certificate, you can check the entry and exit holes under bright light. If the bead shows signs of being drilled off-center or has mismatched internal cavities, it has likely been tampered with.",
  ]),
  h2("4. Caring for and Preserving Your Consecrated Bead"),
  p([
    "Once you have verified your Nepali Rudraksha, preserving its vitality requires sensible, regular maintenance. Because Rudraksha is an organic seed, it responds to changes in humidity, sweat, and environmental dust. Follow these straightforward guidelines to keep it in prime condition for generations:",
  ]),
  ol([
    [b("Periodic natural cleansing: "), "Gently clean the crevices using a soft toothbrush and warm water every few months."],
    [b("Moisturizing with pure oil: "), "Apply a drop of unrefined mustard oil or sandalwood oil to prevent dryness and cracking."],
    [b("Storage with reverence: "), "When not worn, store your bead in a clean cotton or silk cloth in your altar area."],
  ]),
  p([
    "By approaching Rudraksha with informed discernment and genuine devotion, you ensure that your sacred possession serves as an enduring anchor for inner tranquility and spiritual growth.",
  ]),
);

/* Article 2: Which crystal bracelet suits your rashi? */
const body2: RichDoc = doc(
  p([
    "Natural gemstones and crystals have been integrated into Vedic astrology and mineral lore for centuries. Rather than serving as miraculous shortcuts, crystals act as natural energetic resonators. Formed under immense tectonic heat and pressure deep within the Earth, their stable molecular lattices interact harmoniously with the human biofield, calming overactive mental tendencies and amplifying subtle positive intentions.",
  ]),
  p([
    "In Jyotish (Vedic astrology), each of the twelve Rashis (zodiac signs) is governed by a ruling planetary force and an elemental temperament—Fire (Agni), Earth (Prithvi), Air (Vayu), or Water (Jal). Choosing a crystal bracelet aligned with your Rashi balances your innate planetary dynamics, helping you cultivate emotional composure and daily focus.",
  ]),
  h2("1. Fire Rashis: Mesha, Simha, and Dhanu"),
  p([
    "Fire signs are naturally dynamic, driven, and visionary, but they can easily suffer from burnout, impulsive impatience, and internal restlessness. Their ideal gemstones ground excess heat while focusing leadership energy.",
  ]),
  ul([
    [b("Mesha (Aries · Mars): "), "Red Jasper and Carnelian provide steady stamina, courage, and grounded focus without aggressive outbursts."],
    [b("Simha (Leo · Sun): "), "Pyrite and Citrine radiate abundance, confidence, and warmth, aligning seamlessly with the solar principle of leadership."],
    [b("Dhanu (Sagittarius · Jupiter): "), "Yellow Citrine or Amethyst balances intellectual exploration with wisdom, temperance, and philosophical clarity."],
  ]),
  h2("2. Earth Rashis: Vrishabha, Kanya, and Makara"),
  p([
    "Earth signs are practical, methodical, and reliable, yet they may struggle with stubborn inertia, overthinking, or financial anxiety. They benefit most from crystals that foster flexibility, prosperity, and emotional release.",
  ]),
  ul([
    [b("Vrishabha (Taurus · Venus): "), "Rose Quartz and Green Jade cultivate compassion, emotional peace, and attract harmonious material comfort."],
    [b("Kanya (Virgo · Mercury): "), "Green Jade and Clear Quartz quiet an analytical, self-critical mind and enhance clear, organized communication."],
    [b("Makara (Capricorn · Saturn): "), "Black Tourmaline and Tiger Eye provide formidable psychic protection, perseverance, and disciplined focus against professional hurdles."],
  ]),
  h2("3. Air Rashis: Mithuna, Tula, and Kumbha"),
  p([
    "Air signs possess brilliant intellects, adaptability, and social grace, but their minds can become scattered, anxious, or indecisive. Crystals that center thoughts and soothe nervous tension are highly beneficial for them.",
  ]),
  ul([
    [b("Mithuna (Gemini · Mercury): "), "Tiger Eye and Lapis Lazuli anchor fluctuating thoughts, harmonizing speech and intellectual precision."],
    [b("Tula (Libra · Venus): "), "Rose Quartz and Lapis Lazuli support decision-making, inner equilibrium, and loving interpersonal relationships."],
    [b("Kumbha (Aquarius · Saturn): "), "Amethyst and Black Tourmaline protect innovative visionaries from cognitive fatigue and psychic overload."],
  ]),
  h2("4. Water Rashis: Karka, Vrishchika, and Meena"),
  p([
    "Water signs are profoundly intuitive, empathetic, and sensitive, which can sometimes leave them vulnerable to emotional exhaustion, mood swings, and absorbing external stress. Crystals with gentle, protective frequencies keep their boundaries firm.",
  ]),
  ul([
    [b("Karka (Cancer · Moon): "), "Moonstone and Rose Quartz nurture emotional equilibrium, gently soothing anxiety and digestive unease."],
    [b("Vrishchika (Scorpio · Mars/Ketu): "), "Black Tourmaline and Malachite provide intense energetic shielding, facilitating deep psychological transformation."],
    [b("Meena (Pisces · Jupiter): "), "Amethyst and Clear Quartz elevate spiritual intuition while anchoring the seeker in practical, daily reality."],
  ]),
  h2("5. Proper Cleansing and Daily Wearing Guidelines"),
  p([
    "Because crystal beads absorb ambient vibrations, regular cleansing is essential. Every two weeks, expose your bracelet to gentle morning sunlight for fifteen minutes, or place it on a cluster of raw Clear Quartz. Alternatively, pass it through the fragrant smoke of natural dhoop or sambrani. Wear it on your receptive (non-dominant) wrist to absorb healing vibrations, or on your active wrist to channel focused intention into the world.",
  ]),
);

/* Article 3: Rules of wearing a Baglamukhi amulet */
const body3: RichDoc = doc(
  p([
    "Maa Baglamukhi, the eighth Mahavidya in the sacred Shakta tradition, is revered as Pitambari—the golden-hued goddess of Stambhana (the divine power to paralyze hostility, neutralize deceit, and still the agitated mind). An authentic Maa Baglamukhi amulet, inscribed by hand on consecrated Bhojpatra and encased in pure copper, is not an ordinary ornamental talisman. It is a consecrated spiritual shield created to provide mental fortitude, spiritual resilience, and protection during severe life trials.",
  ]),
  p([
    "Wearing a consecrated Yantra demands personal self-discipline, mental cleanliness, and enduring respect for Vedic tradition. In the Vedic path, spiritual remedies do not replace right action (Purushartha); rather, they purify your aura so that truth and justice prevail without self-destructive conflict. The talisman serves as a physical touchstone for inner courage and unwavering moral focus.",
  ]),
  h2("1. The Auspicious Timing and Wearing Procedure (Vidhi)"),
  p([
    "The initial wearing of the Baglamukhi tabiz should be undertaken during an auspicious planetary window. Traditionally, Thursday morning during Shukla Paksha (the waxing moon) or during Guru Hora is considered most favorable, as Jupiter and yellow hues resonate deeply with Maa Baglamukhi.",
  ]),
  ol([
    [b("Morning purification: "), "Take a bath early in the morning and wear clean, preferably yellow or white clothing."],
    [b("Altar preparation: "), "Place the amulet on a clean yellow cloth in your home temple before an image or lamp of the Divine Mother."],
    [b("Offerings: "), "Offer yellow flowers, haldi (turmeric), and light an earthen lamp with pure sesame or mustard oil."],
    [b("Mantra invocation: "), "Recite the sacred Baglamukhi Gayatri or the foundational Mool Mantra with a focused, devoted mind."],
  ]),
  h2("2. Core Disciplines of Personal Purity (Niyam)"),
  p([
    "A consecrated amulet carries the vibrational resonance of the Mahapuja in which it was energized. Maintaining that sanctified state requires practical mindfulness and ethical grounding throughout your daily routine:",
  ]),
  ul([
    [b("Truthfulness in speech: "), "Since Maa Baglamukhi governs the power of the tongue (Vak Siddhi), avoid slander, false statements, deceitful promises, and malicious gossip."],
    [b("Non-retaliation: "), "The amulet is a protective shield, not an aggressive weapon. Never attempt to invoke the Divine Mother to harm innocent individuals or achieve unethical ambitions."],
    [b("Dietary discipline: "), "While wearing the amulet, it is spiritually beneficial to maintain a sattvic diet and avoid excessive intoxicants or impure foods."],
  ]),
  h2("3. When and How to Remove the Amulet"),
  p([
    "Certain circumstances represent ritual transition or physical impurity, during which it is respectful to temporarily remove the amulet from your body. These occasions include attending funeral grounds (shamshan), participating in mourning rites (sutak), and intimate marital encounters.",
  ]),
  quote(
    "Discipline is not superstition; it is the conscious alignment of human reverence with divine energy.",
  ),
  p([
    "When removing the amulet, do not place it casually on beds, dining tables, or leather surfaces. Wrap it gently in a clean yellow or red silk cloth and place it respectfully in your home altar. You may put it back on after taking a fresh bath the following morning with a brief mental prayer.",
  ]),
  h2("4. Care of the Copper Capsule"),
  p([
    "The pure copper tabiz serves as an energetic conductor and an impermeable seal protecting the inner Bhojpatra from perspiration and ambient humidity. Never attempt to pry open or submerge the copper capsule in harsh corrosive acids. If the copper oxidizes naturally over time, clean only the exterior with a gentle cloth and dry ash or pitambari powder. Handled with reverence, the amulet remains an enduring source of fearless resolve and spiritual clarity.",
  ]),
);

/* Article 4: 5 Mukhi or 7 Mukhi: choosing between peace and prosperity */
const body4: RichDoc = doc(
  p([
    "Among the sacred seeds of the Elaeocarpus ganitrus tree, the Five Mukhi (Panchamukhi) and Seven Mukhi (Saptamukhi) beads are among the most frequently sought by spiritual seekers and householders alike. While both beads originate from the sacred Himalayan terrain of Nepal, their governing deities, planetary frequencies, and practical applications in daily life differ significantly.",
  ]),
  p([
    "Choosing between them is not a matter of which bead is 'superior', but rather which energetic influence corresponds to your current life phase, mental constitution, and immediate goals. Understanding their distinct attributes allows you to make an informed, grounded choice without confusion.",
  ]),
  h2("1. The Five Mukhi Rudraksha: Universal Peace and Health"),
  p([
    "The 5 Mukhi bead represents Kalagni Rudra, the transformative form of Lord Shiva that dissolves past mental conditioning and clears sluggish inertia. Governed astrologically by Brihaspati (Jupiter), it is the most universal and versatile of all Rudraksha varieties.",
  ]),
  ul([
    [b("Mental tranquility: "), "Regulates overactive mental chatter, easing anxiety, restlessness, and erratic sleep patterns."],
    [b("Physical vitality: "), "Traditionally associated in Ayurveda with balancing the three doshas (Vata, Pitta, Kapha) and supporting cardiovascular balance."],
    [b("Spiritual clarity: "), "An ideal foundation for students, educators, and anyone engaged in daily mantra meditation or academic study."],
  ]),
  p([
    "Because of its gentle and benevolent vibration, anyone can wear a 5 Mukhi Rudraksha without prior astrological consultation. It acts as an energetic stabilizer, insulating the wearer from daily stressors and maintaining emotional equilibrium.",
  ]),
  h2("2. The Seven Mukhi Rudraksha: Material Stability and Resilience"),
  p([
    "The 7 Mukhi bead is consecrated to Goddess Mahalakshmi, the embodiment of auspicious fortune, abundance, and dignified prosperity. Simultaneously, it is governed by the stern planet Shani (Saturn), which demands patience, justice, and systematic perseverance.",
  ]),
  ul([
    [b("Overcoming financial stagnation: "), "Helps remove chronic blocks in business, stalled payments, and unrewarded career efforts."],
    [b("Mitigating Saturnian stress: "), "Softens the adverse psychological pressure experienced during Sade Sati or challenging Saturn transits."],
    [b("Professional grounding: "), "Instills tenacity, pragmatic foresight, and emotional resilience for entrepreneurs and working professionals."],
  ]),
  p([
    "Unlike common superstitions that associate Saturn with fear, the 7 Mukhi Rudraksha encourages righteous effort and disciplined growth, ensuring that material gains are enduring and ethically grounded.",
  ]),
  h2("3. Comparing the Key Attributes Side by Side"),
  p([
    "To help you evaluate which bead aligns best with your circumstances, consider where your life currently requires the greatest reinforcement:",
  ]),
  ul([
    [b("Primary Goal: "), "Choose 5 Mukhi if you seek inner peace, stress reduction, and mental clarity; choose 7 Mukhi if you require financial stabilization and career momentum."],
    [b("Planetary Archetype: "), "5 Mukhi resonates with the expansive wisdom of Jupiter; 7 Mukhi balances the structured perseverance of Saturn with Lakshmi's grace."],
    [b("Everyday Demeanor: "), "5 Mukhi soothes an agitated temperament; 7 Mukhi bolsters determination during prolonged uphill challenges."],
  ]),
  h2("4. Can You Wear 5 Mukhi and 7 Mukhi Together?"),
  p([
    "A frequent question is whether these two powerful seeds can be combined. The answer is an emphatic yes. In traditional Vedic combination principles, wearing a 5 Mukhi mala with a 7 Mukhi bead as the central pendant (Sumeru or focal bead) creates an exceptional balance between inner spiritual composure and outer material efficacy. The peace granted by the 5 Mukhi ensures that you navigate business and worldly pursuits with calm discernment and steadfast composure.",
  ]),
);

/* Article 5: Using Bitter Havan at home: the correct method */
const body5: RichDoc = doc(
  p([
    "In traditional Vedic environmental science, sacred smoke (Dhoop and Havan) is used not merely as ritual symbolism, but as an effective method of atmospheric purification. Spaces accumulate stagnant subtle energies from arguments, prolonged illnesses, stress, and external malevolent intentions commonly termed 'evil eye' (Buri Nazar). The Bitter Havan (Kadwa Havan) is a specialized herbal formulation designed specifically to cleanse domestic premises and restore harmonious energetic flow.",
  ]),
  p([
    "Unlike sweet, fragrant havans performed during celebratory pujas, a Bitter Havan employs pungent, resinous, and bitter botanical ingredients—including mustard seeds, neem bark, guggul, loban, and specialized forest herbs—known for their anti-microbial and aura-cleansing properties. When burned over glowing natural embers, these botanicals release potent vapors that clear stagnant environmental toxicity.",
  ]),
  h2("1. When and Why Bitter Havan Is Recommended"),
  p([
    "Bitter Havan is traditionally recommended when a household experiences unexplained heaviness, sudden domestic friction, persistent nightmares among young children, or prolonged financial roadblocks without tangible cause.",
  ]),
  ul([
    [b("Ideal days: "), "Tuesday or Saturday evenings, as well as the night of Amavasya (new moon), carry the most potent energy for dispelling stagnation."],
    [b("Optimal time: "), "Perform the ritual during Sandhya Kaal (twilight), just as the sun sets and night begins to fall."],
    [b("Frequency: "), "Once a fortnight or once a month is sufficient for maintaining a clean, vibrant, and protected home environment."],
  ]),
  h2("2. Step-by-Step Home Ritual Procedure"),
  p([
    "You do not require elaborate priestly ceremonies to conduct this purification. With sincere intent and simple preparations, any householder can execute the ritual safely and effectively:",
  ]),
  ol([
    [b("Prepare the fire base: "), "Take a small copper havan kund or a sturdy terracotta saucer. Place a clean dried cow dung cake (kanda) and pure camphor (kapoor) in the center."],
    [b("Ignite the flame: "), "Light the camphor with respect and allow the cow dung cake to catch fire until hot glowing embers are formed."],
    [b("Offer the herbal mixture: "), "Take a small pinch of the 100g Bitter Havan packet. Chant the Gayatri Mantra, Mahamrityunjaya Mantra, or 'Om Dum Durgayei Namah' while gently placing the herbs onto the embers."],
    [b("Circulate the sacred smoke: "), "Carefully carry the smoking vessel through every room of your house in a clockwise direction, paying special attention to corners, entrance hallways, and closed storage spaces."],
  ]),
  h2("3. Essential Safety and Environmental Precautions"),
  p([
    "Because Bitter Havan produces dense, pungent medicinal smoke, proper ventilation is critical. Always keep windows and outer doors open while circulating the smoke to allow stagnant vibrations and physical fumes to exit the home smoothly.",
  ]),
  quote(
    "Spiritual cleansing should never compromise physical health. Moderate smoke with thoughtful ventilation achieves the deepest purification.",
  ),
  p([
    "If family members suffer from acute asthma or respiratory sensitivity, have them step outside during the active smoking phase. The goal is to purify the subtle energetic fabric of the home, not to cause physical discomfort. Use moderate quantities rather than overloading the burning embers.",
  ]),
  h2("4. Respectful Disposal of the Sacred Ash (Bhasma)"),
  p([
    "Once the embers have completely cooled, do not discard the remaining sacred ash in household garbage bins. Collect the cool bhasma with clean hands and offer it to the soil beneath a garden plant, at the base of a living tree, or gently release it into moving water. This completes the cycle of natural renewal with dignity and reverence, grounding the purified space in natural harmony.",
  ]),
);

/* Article 6: Why a Kundali reading needs your exact birth time */
const body6: RichDoc = doc(
  p([
    "Vedic astrology (Jyotish) is fundamentally a celestial science of time, space, and mathematical geometry. It is not an exercise in guesswork or fortune-telling; rather, it is a detailed cosmic blueprint calculated from the exact position of the planets and constellations relative to the Earth's horizon at the very instant you took your first independent breath. For this reason, the precision of your birth time is the bedrock upon which all astrological analysis rests.",
  ]),
  p([
    "When consulting with an astrologer, an error of even four to five minutes can significantly distort key predictive charts, leading to inaccurate assessments of career turning points, relationship dynamics, and life remedies.",
  ]),
  h2("1. The Ascendant (Lagna): Earth's Rapid Rotation"),
  p([
    "The primary foundation of any Vedic horoscope is the Lagna (Ascendant)—the zodiac sign rising on the eastern horizon at the precise location and minute of birth. Because the Earth completes a full 360-degree rotation every twenty-four hours, the twelve zodiac signs rise sequentially throughout the day.",
  ]),
  p([
    "On average, a zodiac sign changes every two hours. However, if your birth occurred near the boundary between two signs (the cusp), an inaccuracy of just two minutes can place your entire horoscope in the wrong sign. If your Lagna changes, all twelve houses immediately shift, completely altering which planets govern your wealth, health, and family.",
  ]),
  h2("2. Divisional Charts: The Navamsa (D9) and Micro-Moments"),
  p([
    "While the primary birth chart (D1 or Rasi chart) maps the physical manifestations of life, advanced Vedic astrology relies heavily on the sixteen divisional charts (Shodashvarga) to understand deeper subconscious trends, marriage, and spiritual destiny. The most crucial of these is the Navamsa chart (D9).",
  ]),
  ul([
    [b("High-speed transitions: "), "The Navamsa divides each 30-degree zodiac sign into nine subdivisions of 3 degrees and 20 minutes each."],
    [b("Shifting every 13 to 15 minutes: "), "A Navamsa sign shifts approximately every 13 to 15 minutes."],
    [b("Subtle life indicators: "), "A slight discrepancy in your recorded birth time completely alters your D9 planetary strengths, invalidating predictions about your spouse and inner life path."],
  ]),
  h2("3. Vimshottari Dasha: Timing Your Major Life Events"),
  p([
    "The jewel of Vedic astrology is the Vimshottari Dasha system, which calculates the exact sequence and duration of planetary periods throughout a 120-year cycle. This timing engine is determined entirely by the Moon's exact degree down to arc-minutes and arc-seconds within its Nakshatra (lunar mansion) at birth.",
  ]),
  p([
    "An error of just a few minutes in recorded time advances or retards the Moon's longitude, shifting the starting dates of major planetary cycles by several months or even years. As a result, critical life events—such as job changes, marriage, or health recoveries—may appear displaced along your personal timeline.",
  ]),
  h2("4. What to Do If Your Exact Birth Time Is Unknown"),
  p([
    "Many seekers possess only approximate birth times (such as 'early morning' or 'around 4:00 PM'). In such cases, a responsible astrologer does not guess blindly. Instead, two authentic traditional approaches are employed:",
  ]),
  ol([
    [b("Birth Time Rectification (Janma Samay Shodhan): "), "The astrologer cross-references major past life events—such as graduation, marriage, surgeries, or sibling births—against divisional chart math to systematically pinpoint the true minute."],
    [b("Prashna and Palmistry (Hastrekha): "), "When records are entirely absent, Prashna Shastra (horary astrology based on the moment of the query) and physical palm analysis provide profound, verifiable clarity."],
  ]),
  p([
    "By honoring the mathematical rigor of Vedic astrology, you ensure that consultations deliver clear, practical guidance that honors your authentic cosmic design.",
  ]),
);

export const SEEDED_ARTICLES: SeedArticleContent[] = [
  {
    slug: "how-to-identify-an-original-nepali-rudraksha-six-checks-you-can-do-at-home",
    titleHi: "असली नेपाली रुद्राक्ष की पहचान: घर पर किए जाने वाले ६ प्रामाणिक परीक्षण",
    excerptEn:
      "Learn how to distinguish genuine Nepali Rudraksha beads from fake replicas using practical, non-destructive checks you can perform at home, from surface contours to water immersion.",
    excerptHi:
      "घर पर असली नेपाली रुद्राक्ष की पहचान करने के व्यावहारिक और प्रामाणिक तरीके जानिए। बनावटी मोतियों और मिथकों से बचकर असली मुखी रेखाओं और प्राकृतिक बनावट की सही परख करें।",
    bodyEn: body1,
    faq: [
      {
        q: {
          en: "Does the water floating test definitively prove Rudraksha authenticity?",
          hi: "क्या पानी में तैरने से रुद्राक्ष की असली होने की पुष्टि होती है?",
        },
        a: {
          en: "No, density varies naturally; ripe genuine seeds may sink or float depending on internal moisture, so water immersion is useful primarily to expose artificial adhesives.",
          hi: "नहीं, घनत्व में प्राकृतिक अंतर होता है; पानी में भिगोने का मुख्य उद्देश्य कृत्रिम गोंद, रंग या चिपकाई गई बनावट की जांच करना होता है।",
        },
      },
      {
        q: {
          en: "Can Nepali Rudraksha mukhi lines be carved artificially?",
          hi: "क्या नेपाली रुद्राक्ष की मुखी रेखाएं कृत्रिम रूप से बनाई जा सकती हैं?",
        },
        a: {
          en: "Counterfeiters sometimes carve extra lines into common beads, but genuine mukhi lines run uninterrupted from head to tail with deep, natural cellular furrows.",
          hi: "कई बार नकली मोतियों पर लकीरें उकेरी जाती हैं, लेकिन असली रुद्राक्ष की मुखी रेखाएं प्राकृतिक, गहरी और ऊपर से नीचे तक अखंडित होती हैं।",
        },
      },
      {
        q: {
          en: "How often should an authentic Rudraksha bead be oiled?",
          hi: "रुद्राक्ष को कितने समय बाद तेल लगाना चाहिए?",
        },
        a: {
          en: "Lightly applying natural mustard or sandalwood oil once every few months keeps the organic seed moisturized and prevents environmental cracking.",
          hi: "हर दो-तीन महीने में एक बार हल्का सरसों या चंदन का तेल लगाने से रुद्राक्ष की नमी बनी रहती है और वह प्राकृतिक रूप से सुरक्षित रहता है।",
        },
      },
    ],
    readMins: Math.max(1, Math.round(countDocWords(body1) / 200)),
  },
  {
    slug: "which-crystal-bracelet-suits-your-rashi",
    titleHi: "आपकी राशि के अनुसार कौन सा क्रिस्टल ब्रेसलेट आपके लिए श्रेष्ठ है?",
    excerptEn:
      "Discover which gemstone and crystal bracelet aligns with your astrological zodiac sign, balancing planetary energies, focus, and daily harmony without fear or superstition.",
    excerptHi:
      "अपनी जन्म राशि के अनुसार सही प्राकृतिक क्रिस्टल ब्रेसलेट का चयन करें। जानें कि कैसे पाइराइट, सिट्रीन, रोज़ क्वार्ट्ज और एमेथिस्ट आपके जीवन में संतुलन और सकारात्मक ऊर्जा लाते हैं।",
    bodyEn: body2,
    faq: [
      {
        q: {
          en: "Can I wear multiple crystal bracelets at the same time?",
          hi: "क्या एक साथ कई क्रिस्टल ब्रेसलेट पहने जा सकते हैं?",
        },
        a: {
          en: "Yes, compatible crystals like Pyrite for abundance and Black Tourmaline for grounding complement each other without energetic conflict.",
          hi: "हाँ, अनुकूल क्रिस्टल जैसे समृद्धि के लिए पाइराइट और सुरक्षा के लिए ब्लैक टूमलाइन एक साथ बिना किसी बाधा के पहने जा सकते हैं।",
        },
      },
      {
        q: {
          en: "How should I energetically cleanse my crystal bracelet?",
          hi: "क्रिस्टल ब्रेसलेट का शुद्धिकरण कैसे करें?",
        },
        a: {
          en: "Gently expose it to morning sunlight or cleanse it with the smoke of pure camphor or natural incense once every fortnight.",
          hi: "हर पंद्रह दिन में एक बार सुबह की हल्की धूप या शुद्ध कपूर और धूपबत्ती के धुएं से ब्रेसलेट को नकारात्मक ऊर्जा से मुक्त करें।",
        },
      },
      {
        q: {
          en: "Which wrist should I wear my crystal bracelet on?",
          hi: "क्रिस्टल ब्रेसलेट किस कलाई में पहनना चाहिए?",
        },
        a: {
          en: "Wear on the dominant wrist to project intentions and actions, or on the non-dominant wrist to absorb calming, receptive energies.",
          hi: "ऊर्जा ग्रहण करने और आंतरिक शांति के लिए बाएं हाथ में, और संकल्प व आत्मविश्वास बढ़ाने के लिए दाएं हाथ में पहनें।",
        },
      },
    ],
    readMins: Math.max(1, Math.round(countDocWords(body2) / 200)),
  },
  {
    slug: "rules-of-wearing-a-baglamukhi-amulet",
    titleHi: "बगलामुखी ताबीज धारण करने के महत्वपूर्ण नियम और मर्यादा",
    excerptEn:
      "Essential disciplines, auspicious timings, and respectful daily guidelines for wearing the sacred consecrated Maa Baglamukhi copper tabiz for divine protection and mental fortitude.",
    excerptHi:
      "माँ बगलामुखी ताबीज धारण करने के शास्त्रोक्त नियम, शुभ मुहूर्त और शुद्ध आचरण की मर्यादा। जानिए कैसे पवित्रता और एकाग्रता से इस दिव्य रक्षा कवच का पूरा लाभ प्राप्त किया जा सकता है।",
    bodyEn: body3,
    faq: [
      {
        q: {
          en: "What is the most auspicious day to wear the Baglamukhi amulet?",
          hi: "बगलामुखी ताबीज धारण करने के लिए कौन सा दिन सबसे शुभ है?",
        },
        a: {
          en: "Thursday morning during Shukla Paksha or an auspicious planetary hour (Guru Hora) is traditionally considered most auspicious.",
          hi: "शुक्ल पक्ष का गुरुवार प्रातःकाल अथवा गुरु की होरा ताबीज धारण करने के लिए सबसे उत्तम मानी जाती है।",
        },
      },
      {
        q: {
          en: "Should the amulet be removed during times of physical impurity?",
          hi: "क्या अशुद्ध अवस्था या सूतक काल में ताबीज उतारना चाहिए?",
        },
        a: {
          en: "Yes, it is respectful to remove the amulet during funeral rites, hospital visits, or intimate times, placing it in a clean pooja altar.",
          hi: "हाँ, दाह-संस्कार, सूतक या शारीरिक अशुद्धि के समय ताबीज उतारकर पूजा स्थान में पवित्र कपड़े पर रखना चाहिए।",
        },
      },
      {
        q: {
          en: "Can the copper tabiz be opened to inspect the inner Bhojpatra?",
          hi: "क्या ताबीज को खोलकर अंदर का भोजपत्र देखा जा सकता है?",
        },
        a: {
          en: "Never open the consecrated copper capsule, as sealing preserves the sanctified mantras and prevents moisture damage to the Bhojpatra.",
          hi: "ताबीज को कभी नहीं खोलना चाहिए, क्योंकि इससे उसकी प्राण-प्रतिष्ठा की ऊर्जा और भोजपत्र की सुरक्षा प्रभावित होती है।",
        },
      },
    ],
    readMins: Math.max(1, Math.round(countDocWords(body3) / 200)),
  },
  {
    slug: "5-mukhi-or-7-mukhi-choosing-between-peace-and-prosperity",
    titleHi: "५ मुखी या ७ मुखी रुद्राक्ष: मानसिक शांति और समृद्धि के बीच सही चुनाव",
    excerptEn:
      "Compare Panchamukhi and Saptamukhi Nepali Rudraksha beads. Understand their distinct ruling energies, health benefits, and how to select the right bead for your life's priorities.",
    excerptHi:
      "पंचमुखी और सप्तमुखी रुद्राक्ष के प्रभाव, अधिष्ठाता देव और लाभों की तुलना। जानें कि अपने वर्तमान जीवन और प्राथमिकताओं के अनुसार आपको किस रुद्राक्ष का चयन करना चाहिए।",
    bodyEn: body4,
    faq: [
      {
        q: {
          en: "Who should wear a 5 Mukhi Rudraksha?",
          hi: "पांच मुखी रुद्राक्ष किसे धारण करना चाहिए?",
        },
        a: {
          en: "Anyone seeking mental clarity, stress relief, healthy blood pressure, and spiritual focus can wear 5 Mukhi without astrological restrictions.",
          hi: "मानसिक शांति, एकाग्रता और अच्छे स्वास्थ्य की कामना करने वाला कोई भी व्यक्ति पांच मुखी रुद्राक्ष पहन सकता है।",
        },
      },
      {
        q: {
          en: "Is 7 Mukhi Rudraksha safe for everyone to wear?",
          hi: "क्या सात मुखी रुद्राक्ष सभी के लिए सुरक्षित है?",
        },
        a: {
          en: "Yes, 7 Mukhi is ruled by Goddess Mahalakshmi and blessed by planet Saturn, bringing grounded progress without adverse side effects.",
          hi: "जी हाँ, सात मुखी रुद्राक्ष माँ महालक्ष्मी और शनि देव से संबंधित है, जो बिना किसी दुष्प्रभाव के स्थिरता और बरकत देता है।",
        },
      },
      {
        q: {
          en: "Can a 5 Mukhi mala include a 7 Mukhi pendant?",
          hi: "क्या ५ मुखी की माला में ७ मुखी का पेंडेंट लगाया जा सकता है?",
        },
        a: {
          en: "Combining the calming foundation of 5 Mukhi beads with a 7 Mukhi central bead harmonizes both mind and material progress effectively.",
          hi: "बिल्कुल, ५ मुखी माला के साथ ७ मुखी का पेंडेंट धारण करना मानसिक शांति और आर्थिक उन्नति दोनों में अत्यंत सहायक होता है।",
        },
      },
    ],
    readMins: Math.max(1, Math.round(countDocWords(body4) / 200)),
  },
  {
    slug: "using-bitter-havan-at-home-the-correct-method",
    titleHi: "घर पर कड़वा हवन करने की सही और प्रामाणिक विधि",
    excerptEn:
      "Step-by-step traditional guide to performing Bitter Havan at home to clear stagnant negative vibrations, dispel evil eye, and restore harmony in your living space safely.",
    excerptHi:
      "घर से नकारात्मक ऊर्जा और वास्तु दोष को दूर करने के लिए कड़वे हवन की सही विधि। जानिए किस समय, किन सावधानियों के साथ और कैसे घर के प्रत्येक कोने में इसका धुआं प्रवाहित करें।",
    bodyEn: body5,
    faq: [
      {
        q: {
          en: "On which days should Bitter Havan be performed?",
          hi: "कड़वा हवन किस दिन करना सबसे लाभकारी होता है?",
        },
        a: {
          en: "Tuesday or Saturday evening during twilight (Sandhya Kaal), or on Amavasya days, are traditionally considered the most effective times.",
          hi: "मंगलवार या शनिवार की शाम गोधूलि वेला में अथवा अमावस्या के दिन कड़वा हवन करना सबसे अधिक फलदायी माना जाता है।",
        },
      },
      {
        q: {
          en: "Can Bitter Havan be performed in small apartments?",
          hi: "क्या फ्लैट या छोटे अपार्टमेंट में कड़वा हवन किया जा सकता है?",
        },
        a: {
          en: "Yes, simply use a small quantity of havan samagri in a copper kund with open windows to allow air circulation and smoke egress.",
          hi: "हाँ, खुली खिड़कियों के साथ तांबे के छोटे पात्र में अल्प मात्रा में सामग्री डालकर आसानी से हवन किया जा सकता है।",
        },
      },
      {
        q: {
          en: "What should be done with the leftover sacred ash (Bhasma)?",
          hi: "हवन के बाद बची हुई राख (भस्म) का क्या करना चाहिए?",
        },
        a: {
          en: "Collect the cooled ash with respect and offer it to the roots of a living tree, garden soil, or flowing clean water.",
          hi: "ठंडी होने के बाद भस्म को आदरपूर्वक किसी जीवित पेड़ की जड़ में, गमले की मिट्टी में या बहते जल में विसर्जित करें।",
        },
      },
    ],
    readMins: Math.max(1, Math.round(countDocWords(body5) / 200)),
  },
  {
    slug: "why-a-kundali-reading-needs-your-exact-birth-time",
    titleHi: "सटीक कुंडली विश्लेषण के लिए जन्म का सही समय क्यों अनिवार्य है?",
    excerptEn:
      "Understand the mathematical principles of Vedic astrology and why even a 4-minute difference in your recorded birth time fundamentally shifts your Lagna, Navamsa, and planetary dashas.",
    excerptHi:
      "वैदिक ज्योतिष में लग्न और नवमांश की गणितीय गणना को समझें। जानिए कैसे केवल कुछ मिनटों का अंतर आपकी राशि कुंडली, दशा क्रम और महत्वपूर्ण जीवन भविष्यवाणियों को बदल सकता है।",
    bodyEn: body6,
    faq: [
      {
        q: {
          en: "How much difference does a 5-minute birth time error make?",
          hi: "५ मिनट के समय अंतर से कुंडली में क्या प्रभाव पड़ता है?",
        },
        a: {
          en: "While the main birth chart (D1) may remain similar, critical divisional charts like Navamsa (D9) can shift signs entirely within 5 minutes.",
          hi: "मुख्य लग्न वही रह सकता है, परंतु भाग्य और वैवाहिक जीवन को दर्शाने वाला नवमांश (D9) चक्र पूरी तरह बदल सकता है।",
        },
      },
      {
        q: {
          en: "Can a Kundali be analyzed if birth time is completely unknown?",
          hi: "यदि जन्म समय बिल्कुल ज्ञात न हो तो क्या कुंडली देखी जा सकती है?",
        },
        a: {
          en: "Yes, astrologers use Chandra Kundali (Moon chart), Surya Kundali, or Prashna Shastra (horary astrology) to provide meaningful guidance.",
          hi: "हाँ, ऐसी स्थिति में चंद्र कुंडली, सूर्य कुंडली या प्रश्न शास्त्र के माध्यम से मार्गदर्शन दिया जाता है।",
        },
      },
      {
        q: {
          en: "What is birth time rectification (Janma Samay Shodhan)?",
          hi: "जन्म समय शोधन (बर्थ टाइम रेक्टिफिकेशन) क्या होता है?",
        },
        a: {
          en: "It is a specialized astrological technique that matches past life events, siblings, and physical traits to mathematically pinpoint the exact minute.",
          hi: "यह वह वैदिक तकनीक है जिसमें अतीत की प्रमुख घटनाओं और शारीरिक लक्षणों का मिलान करके जन्म के सही मिनट का निर्धारण किया जाता है।",
        },
      },
    ],
    readMins: Math.max(1, Math.round(countDocWords(body6) / 200)),
  },
];

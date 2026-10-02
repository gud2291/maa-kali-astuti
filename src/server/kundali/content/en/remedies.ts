/* [client-review] Draft text for Sadhak Ji's review. */
import "server-only";
import type { GrahaKey } from "@/lib/domain/kundali";

export const REMEDIES_EN: Record<GrahaKey, string> = {
  su: "To harmonize solar energy, begin each morning offering water to the rising Sun with quiet gratitude. Recite the Gayatri Mantra or 'Om Suryaya Namah' 11 times. Practice seva by honoring elders and father figures. Donate wheat or jaggery on Sundays. As supportive aids, copper items or a 12 Mukhi Rudraksha reinforce solar vitality.",
  mo: "To nourish lunar harmony, practice mindful breathing and drink pure water from a silver cup. Recite 'Om Chandraya Namah' on Monday evenings. Support your mother and elderly women with loving care. Donate milk, rice, or white clothes to the needy. As gentle support, wearing a 2 Mukhi Rudraksha helps calm emotional turbulence.",
  ma: "To balance dynamic Mars energy, engage in disciplined physical exercise and recite the Hanuman Chalisa or 'Om Bhaumaya Namah' on Tuesdays. Practice restraint in speech when provoked. Donate red lentils (masoor dal) or volunteer for community emergency relief. A 3 Mukhi Rudraksha provides helpful energetic support for focused self-discipline.",
  me: "To refine Mercurial intellect and speech, cultivate truthful communication and feed green grass or moong dal to cows on Wednesdays. Recite 'Om Budhaya Namah' with calm concentration. Support underprivileged students with books and study supplies. Wearing a 4 Mukhi Rudraksha or carrying green jade provides supportive intellectual grounding.",
  ju: "To expand Jupiter's benevolent wisdom, honor teachers and spiritual mentors with humble service. Recite 'Om Gurave Namah' on Thursdays, study ethical literature, and donate chana dal, yellow fruit, or educational materials to deserving institutions. A 5 Mukhi Rudraksha offers gentle support for cultivating patience, clarity, and continuous higher learning.",
  ve: "To cultivate Venusian harmony and grace, maintain cleanliness in your home and treat your partner with loving respect. Recite 'Om Shukraya Namah' on Fridays. Offer white sweets or rice to marginalized individuals or animal shelters. Wearing a 6 Mukhi Rudraksha or carrying a rose quartz supports balanced artistic expression and emotional peace.",
  sa: "To align with Saturn's lessons of discipline and patience, practice selfless seva for workers, the elderly, or disabled individuals on Saturdays. Recite 'Om Sham Shanaye Namah' quietly. Avoid falsehood and punctuality lapses. Donate black sesame, mustard oil, or warm blankets. A 7 Mukhi Rudraksha serves as a supportive anchor for steadfast endurance.",
  ra: "To balance Rahu's unconventional and ambitious currents, maintain strict personal ethics and avoid speculative shortcuts or intoxicating substances. Recite 'Om Rahave Namah' during twilight hours. Feed stray dogs or birds regularly and donate coconuts or dark blankets to shelters. Wearing an 8 Mukhi Rudraksha provides helpful grounding against mental restlessness.",
  ke: "To harmonize Ketu's spiritual and introspective tendencies, dedicate daily time to silent meditation and selfless service without seeking recognition. Recite 'Om Ketave Namah' mindfully. Support spiritual ashrams or feed stray animals, especially multi-colored dogs. A 9 Mukhi Rudraksha offers gentle energetic support for inner detachment, deep research, and spiritual peace.",
};

export const GEMS_EN: Record<
  number,
  {
    gem: string;
    rudraksha: string;
    mantra: string;
    note: string;
  }
> = {
  0: {
    gem: "Red Coral (Moonga)",
    rudraksha: "3 Mukhi Rudraksha",
    mantra: "Om Kram Kreem Kroum Sah Bhaumaya Namah",
    note: "Red Coral supports your Lagna lord Mars, enhancing physical vitality, courage, and decisive leadership. Wear it set in copper or gold on the ring finger on a Tuesday morning after ritual cleansing.",
  },
  1: {
    gem: "Diamond or White Zircon",
    rudraksha: "6 Mukhi Rudraksha",
    mantra: "Om Dram Dreem Droum Sah Shukraya Namah",
    note: "Diamond or natural white zircon strengthens your Lagna lord Venus, fostering aesthetic harmony, emotional equilibrium, and prosperity. Wear it in silver or platinum on the middle or little finger on a Friday morning.",
  },
  2: {
    gem: "Emerald (Panna)",
    rudraksha: "4 Mukhi Rudraksha",
    mantra: "Om Bram Breem Broum Sah Budhaya Namah",
    note: "Emerald fortifies your Lagna lord Mercury, sharpening analytical intellect, articulate communication, and commercial success. Wear it set in gold or silver on the little finger on a Wednesday morning after proper energization.",
  },
  3: {
    gem: "Natural Pearl (Moti)",
    rudraksha: "2 Mukhi Rudraksha",
    mantra: "Om Shram Shreem Shroum Sah Chandraya Namah",
    note: "Natural pearl nurtures your Lagna lord Moon, stabilizing emotional rhythms, enhancing intuition, and bringing mental serenity. Wear it set in pure silver on the little finger on a Monday evening during waxing moon.",
  },
  4: {
    gem: "Ruby (Manikya)",
    rudraksha: "12 Mukhi Rudraksha",
    mantra: "Om Hram Hreem Hroum Sah Suryaya Namah",
    note: "Ruby energizes your Lagna lord Sun, elevating self-confidence, vitality, executive authority, and moral purpose. Wear it mounted in copper or gold on the ring finger on a Sunday morning during the sunrise hour.",
  },
  5: {
    gem: "Emerald (Panna)",
    rudraksha: "4 Mukhi Rudraksha",
    mantra: "Om Bram Breem Broum Sah Budhaya Namah",
    note: "Emerald empowers your Lagna lord Mercury, optimizing analytical precision, memory, and practical problem-solving. Wear it in silver or gold on the little finger on a Wednesday morning following authentic cleansing and mantra chanting.",
  },
  6: {
    gem: "Diamond or White Sapphire",
    rudraksha: "6 Mukhi Rudraksha",
    mantra: "Om Dram Dreem Droum Sah Shukraya Namah",
    note: "White sapphire or diamond enhances your Lagna lord Venus, promoting diplomatic grace, relationship harmony, and creative refinement. Wear it set in silver or white gold on the middle finger on a Friday morning.",
  },
  7: {
    gem: "Red Coral (Moonga)",
    rudraksha: "3 Mukhi Rudraksha",
    mantra: "Om Kram Kreem Kroum Sah Bhaumaya Namah",
    note: "Red Coral invigorates your Lagna lord Mars, strengthening inner resilience, investigative stamina, and purposeful determination. Wear it set in copper or gold on the ring finger on a Tuesday morning with focused devotion.",
  },
  8: {
    gem: "Yellow Sapphire (Pukhraj)",
    rudraksha: "5 Mukhi Rudraksha",
    mantra: "Om Gram Greem Groum Sah Gurave Namah",
    note: "Yellow Sapphire supports your Lagna lord Jupiter, expanding ethical wisdom, higher learning, spiritual clarity, and respected prosperity. Wear it in gold or brass on the index finger on a Thursday morning during Shukla Paksha.",
  },
  9: {
    gem: "Blue Sapphire (Neelam) or Amethyst",
    rudraksha: "7 Mukhi Rudraksha",
    mantra: "Om Pram Preem Proum Sah Shanaishcharaya Namah",
    note: "Blue Sapphire or natural amethyst strengthens your Lagna lord Saturn, bestowing disciplined focus, structural perseverance, and executive endurance. Test for three days before wearing in silver or iron on a Saturday evening.",
  },
  10: {
    gem: "Blue Sapphire (Neelam) or Blue Topaz",
    rudraksha: "7 Mukhi Rudraksha",
    mantra: "Om Pram Preem Proum Sah Shanaishcharaya Namah",
    note: "Blue Sapphire or blue topaz fortifies your Lagna lord Saturn, enhancing progressive intellect, social responsibility, and sustained focus. Trial the stone briefly, then wear in silver on the middle finger on Saturday evening.",
  },
  11: {
    gem: "Yellow Sapphire (Pukhraj) or Citrine",
    rudraksha: "5 Mukhi Rudraksha",
    mantra: "Om Gram Greem Groum Sah Gurave Namah",
    note: "Yellow Sapphire or golden citrine illuminates your Lagna lord Jupiter, fostering compassionate wisdom, intuitive insight, and spiritual protection. Wear it in gold or silver on the index finger on a Thursday morning.",
  },
};

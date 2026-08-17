export type ScoredReikiPathKey =
  | "reikiRising"
  | "embodiedHealer"
  | "guidance";

export type ReikiQuizResultKey = ScoredReikiPathKey | "trainingMatch";

export type ReikiQuizResult = {
  eyebrow: string;
  title: string;
  description: string;
  reasons: string[];
  cta: string;
  href: string;
  secondaryCta?: string;
  secondaryHref?: string;
  tertiaryCta?: string;
  tertiaryHref?: string;
};

export const reikiQuizResults: Record<ReikiQuizResultKey, ReikiQuizResult> = {
  reikiRising: {
    eyebrow: "Your clearest match",
    title: "Reiki Rising",
    description:
      "A live 10-week online journey where you can learn, practice and integrate Reiki within a steady group container.",
    reasons: [
      "You are drawn to a clear learning rhythm and shared experience.",
      "You want meaningful depth without beginning with a fully private path.",
      "You are ready to grow through live practice, reflection and community support.",
    ],
    cta: "Explore Reiki Rising",
    href: "/reiki-rising",
  },
  embodiedHealer: {
    eyebrow: "Your clearest match",
    title: "The Embodied Healer",
    description:
      "A deeply personalized 1:1 Reiki mentorship that can meet you at the beginning and grow with you through practitioner or Master Teacher work.",
    reasons: [
      "You want guidance shaped around your experience, pace and calling.",
      "You are seeking a more intimate and highly supported learning relationship.",
      "You may be ready for a longer path toward embodied practice, mastery or teaching.",
    ],
    cta: "Explore The Embodied Healer",
    href: "/mentorship",
  },
  guidance: {
    eyebrow: "Your clearest match",
    title: "Personalized Guidance",
    description:
      "A focused one-on-one mentorship session for trained Reiki practitioners who want clarity, spiritual support or grounded direction without beginning another educational program.",
    reasons: [
      "You have already learned Reiki and want support as you continue growing in your practice.",
      "You want perspective, mentorship or renewed confidence without furthering your education just yet.",
      "A focused session feels more supportive than another structured curriculum right now.",
    ],
    cta: "Book Personalized Guidance",
    href: "https://calendly.com/thelightnessofbeing/mentorship",
  },
  trainingMatch: {
    eyebrow: "Your next step",
    title: "Explore both Reiki training paths",
    description:
      "Your answers reflect qualities found in both Reiki Rising and The Embodied Healer. Taking time to compare the two paths may help you feel which learning experience is right for you.",
    reasons: [
      "Some of your answers point toward the rhythm and connection of a live group experience.",
      "Other answers reflect a desire for personalized support and room to move at your own pace.",
      "You do not need to force a decision before you feel ready. Explore both paths and notice which one feels most supportive.",
    ],
    cta: "Explore Reiki Rising",
    href: "/reiki-rising",
    secondaryCta: "Explore The Embodied Healer",
    secondaryHref: "/mentorship",
    tertiaryCta: "Send Kate a Message",
    tertiaryHref:
      "/contact?inquiryType=training&subject=Help%20Choosing%20a%20Reiki%20Path",
  },
};

export const reikiQuizClosingReflections = [
  "You shared that you want to feel grounded and connected. Keep that desire close as you explore this path. It can be a compass for the support you choose.",
  "You shared that you want to feel confident and capable. This path can help you build greater trust in what you know and how you carry it forward.",
  "You shared that you want to feel clear and aligned. Let this recommendation offer a grounded next step while you continue listening to what feels true for you.",
  "You shared that you want to feel supported and encouraged. You do not have to navigate your growth alone and this path offers a place to begin receiving support.",
  "You shared that you want to feel grounded, confident, clear and supported. Keep these feelings close as you explore this path and consider what will best nurture your growth.",
] as const;

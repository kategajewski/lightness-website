import type { Metadata } from "next";
import { HypnotherapyIntakeForm } from "@/components/hypnotherapy-intake-form";

export const metadata: Metadata = {
  title: "Hypnotherapy Intake",
  description: "Complete your intake questions and consent before your in-person or remote hypnotherapy session with Kate Gajewski.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function HypnotherapyIntakePage() {
  return <HypnotherapyIntakeForm />;
}

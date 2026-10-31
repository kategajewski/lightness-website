import type { Metadata } from "next";
import { SoundBathIntakeForm } from "@/components/sound-bath-intake-form";

export const metadata: Metadata = {
  title: "Sound Bath Intake",
  description: "Complete your questions and consent before your in-person or remote sound bath experience with Kate Gajewski.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function SoundBathIntakePage() {
  return <SoundBathIntakeForm />;
}

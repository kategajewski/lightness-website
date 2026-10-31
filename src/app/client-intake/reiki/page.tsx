import type { Metadata } from "next";
import { ReikiIntakeForm } from "@/components/reiki-intake-form";

export const metadata: Metadata = {
  title: "New Client Reiki Intake",
  description: "Complete your questions and consent before your first in-person or remote Reiki session with Kate Gajewski.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function ReikiIntakePage() {
  return <ReikiIntakeForm />;
}

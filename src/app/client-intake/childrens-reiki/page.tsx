import type { Metadata } from "next";
import { ChildReikiIntakeForm } from "@/components/children-reiki-intake-form";

export const metadata: Metadata = {
  title: "Parent Intake for Gentle Energy Support",
  description: "Complete the parent or guardian intake and consent for your child's Gentle Energy Support Reiki session with Kate Gajewski.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function ChildReikiIntakePage() {
  return <ChildReikiIntakeForm />;
}

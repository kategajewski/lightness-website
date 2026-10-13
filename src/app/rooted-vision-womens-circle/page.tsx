import { redirect } from "next/navigation";
import { site } from "@/lib/site";

// Keep the old link useful while the next circle date is being settled.
export default function RootedVisionWomensCirclePage() {
  redirect(site.links.events);
}

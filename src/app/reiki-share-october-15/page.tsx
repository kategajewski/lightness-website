import { redirect } from "next/navigation";
import { site } from "@/lib/site";

export default function ReikiShareOctoberPage() {
  redirect(site.links.events);
}

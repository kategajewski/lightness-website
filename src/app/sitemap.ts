import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const routes = [
  ["", 1, "weekly"],
  ["/services", 0.95, "monthly"],
  ["/about", 0.9, "monthly"],
  ["/courses", 0.9, "weekly"],
  ["/events", 0.9, "weekly"],
  ["/membership", 0.85, "monthly"],
  ["/reiki-rising", 0.85, "monthly"],
  ["/sound-training", 0.85, "monthly"],
  ["/sound-journeys-at-sanctuary", 0.9, "weekly"],
  ["/reiki-share-october-15", 0.8, "weekly"],
  ["/reiki-share", 0.8, "weekly"],
  ["/mentorship", 0.85, "monthly"],
  ["/corporate-wellness", 0.85, "monthly"],
  ["/reiki-healing-long-island", 0.9, "monthly"],
  ["/sound-healing-long-island", 0.9, "monthly"],
  ["/reiki-training-long-island", 0.9, "monthly"],
  ["/corporate-wellness-long-island", 0.9, "monthly"],
  ["/special-blessing", 0.8, "monthly"],
  ["/divine-rose-frequencies", 0.85, "monthly"],
  ["/gift-certificate", 0.75, "monthly"],
  ["/contact", 0.8, "monthly"],
  ["/email-updates", 0.65, "monthly"],
  ["/writing", 0.8, "weekly"],
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(([path, priority, changeFrequency]) => ({
    url: `${site.url}${path}`,
    changeFrequency,
    priority,
  }));
}

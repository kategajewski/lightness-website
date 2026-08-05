import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["/account/", "/api/", "/checkout/", "/create-password/", "/forgot-password/", "/library/", "/login/", "/reset-password/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: privatePaths },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: privatePaths },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

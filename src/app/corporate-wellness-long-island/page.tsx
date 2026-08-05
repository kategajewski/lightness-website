import { LocalDiscoveryPage } from "@/components/local-discovery-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Corporate Wellness Programs on Long Island",
  description: "Customized corporate sound baths, meditation, yoga, and restorative wellness experiences for Long Island teams, workplaces, retreats, and events.",
  path: "/corporate-wellness-long-island",
  image: "/homepage-images/corporate-wellness.jpeg",
});

export default function CorporateWellnessLongIslandPage() {
  return (
    <LocalDiscoveryPage
      eyebrow="Corporate Wellness on Long Island"
      title="Meaningful wellness experiences for Long Island teams and workplaces."
      description="Customized sound baths, guided meditation, yoga, and restorative experiences led by Kate Gajewski for workplaces, retreats, and organizations across Long Island."
      serviceName="Corporate Wellness Programs on Long Island"
      path="/corporate-wellness-long-island"
      image="/homepage-images/corporate-wellness.jpeg"
      imageAlt="Corporate sound bath and workplace wellness experience on Long Island"
      introductionTitle="Bring a grounded, restorative pause into the workday."
      introduction={[
        "Kate creates intentional wellness experiences that help teams decompress, reconnect, and return to their work with more steadiness and presence.",
        "Every offering begins with a conversation about your people, space, timing, and goals, then is shaped to feel welcoming and accessible for the group in front of her.",
      ]}
      details={[
        { title: "Corporate Sound Baths", description: "Immersive sound experiences that offer teams a calming collective reset." },
        { title: "Meditation & Grounding", description: "Accessible guided practices supporting stress relief, clarity, and presence." },
        { title: "Yoga & Retreat Wellness", description: "Customized movement and restorative programming for offices, retreats, and staff gatherings." },
      ]}
      goodToKnow={[
        "Programs are available for organizations and gatherings across Long Island.",
        "Experiences can be designed for small teams, larger groups, or leadership retreats.",
        "No prior meditation, yoga, or sound healing experience is expected from participants.",
        "Timing, format, accessibility needs, and available space are discussed before the event.",
      ]}
      faqs={[
        { question: "What corporate wellness services are available on Long Island?", answer: "Kate offers corporate sound baths, guided meditation, grounding practices, yoga, and customized restorative experiences for teams, workplaces, retreats, and community organizations." },
        { question: "Can you come to our workplace?", answer: "Yes. Kate offers on-site experiences at workplaces and event spaces across Long Island, depending on the group, location, and date." },
        { question: "How much space does a corporate sound bath require?", answer: "Space needs depend on group size and whether participants will be seated or lying down. Kate will help you choose an appropriate format based on the room available." },
        { question: "How do we request a proposal?", answer: "Send an inquiry with your organization, preferred date, location, approximate group size, and what you hope the experience will support. Kate will follow up to shape the offering and provide next steps." },
      ]}
      primaryCta={{ label: "Request a Corporate Experience", href: "/contact?inquiryType=corporate&subject=Corporate%20Wellness%20Inquiry&draft=Hi%20Kate%2C%20I%27m%20interested%20in%20a%20corporate%20wellness%20experience%20for%20our%20team.%20Here%27s%20a%20little%20about%20our%20group%2C%20location%2C%20and%20preferred%20timing%3A" }}
      secondaryCta={{ label: "View Corporate Wellness", href: "/corporate-wellness" }}
    />
  );
}

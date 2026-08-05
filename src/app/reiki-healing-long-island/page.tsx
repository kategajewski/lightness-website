import { LocalDiscoveryPage } from "@/components/local-discovery-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Reiki Healing on Long Island in Patchogue, NY",
  description: "Private Reiki and energy healing sessions with Kate Gajewski in Patchogue, Long Island for relaxation, grounding, emotional balance, and renewal.",
  path: "/reiki-healing-long-island",
  image: "/homepage-images/healing-session.jpeg",
});

export default function ReikiHealingLongIslandPage() {
  return (
    <LocalDiscoveryPage
      eyebrow="Reiki Healing on Long Island"
      title="A gentle place to rest, receive, and return to yourself."
      description="Private Reiki and energy healing sessions with Kate Gajewski in Patchogue, New York, created for those seeking grounding, emotional balance, nervous system support, and meaningful renewal."
      serviceName="Reiki and Energy Healing on Long Island"
      path="/reiki-healing-long-island"
      image="/homepage-images/healing-session.jpeg"
      imageAlt="Private Reiki and energy healing session with Kate Gajewski in Patchogue"
      introductionTitle="Reiki support that meets you with care, presence, and spaciousness."
      introduction={[
        "Reiki is a gentle energy healing practice that can support deep relaxation, energetic balance, and a greater sense of connection to yourself.",
        "Kate offers private sessions from The Lightness of Being in Patchogue for clients throughout Long Island. Each experience is shaped around what you need that day, without pressure to perform, explain, or force an outcome.",
      ]}
      details={[
        { title: "Rest & Receive", description: "A 60-minute Reiki and energy healing session for nervous system softening, energetic balance, and restoration." },
        { title: "Sacred Reset", description: "A two-hour guided experience blending spiritual guidance, coaching, Holy Fire healing, and Reiki." },
        { title: "Gentle Support for Children", description: "A calm 30-minute energy session created to support grounding, relaxation, and emotional balance." },
      ]}
      goodToKnow={[
        "Sessions take place in Patchogue and welcome clients from across Long Island.",
        "No previous experience with Reiki or energy healing is needed.",
        "You remain fully clothed and can simply rest throughout the session.",
        "Reiki is a complementary wellness practice and is not a substitute for medical or mental health care.",
      ]}
      faqs={[
        { question: "Where are Reiki sessions offered on Long Island?", answer: "Kate offers private Reiki and energy healing sessions at The Lightness of Being, 98 Medford Avenue in Patchogue, New York." },
        { question: "What can I expect during my first Reiki session?", answer: "You will begin with a brief conversation, then rest fully clothed while Kate offers gentle energy healing. Experiences vary, but many people describe feeling calmer, lighter, or deeply rested afterward." },
        { question: "Do I need to believe in Reiki for it to be helpful?", answer: "No. You only need to arrive with openness and a willingness to rest. There is no expectation that you hold a particular spiritual belief." },
        { question: "How do I choose the right Reiki offering?", answer: "Rest & Receive is a beautiful starting point. Sacred Reset offers more time and combines healing with guidance and coaching. You can contact Kate if you would like help choosing." },
      ]}
      primaryCta={{ label: "Book a Reiki Session", href: "https://calendly.com/thelightnessofbeing/restandreceiveenergy" }}
      secondaryCta={{ label: "View All Healing Sessions", href: "/services#reiki-energy-healing" }}
    />
  );
}

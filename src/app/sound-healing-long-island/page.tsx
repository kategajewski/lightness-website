import { LocalDiscoveryPage } from "@/components/local-discovery-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Sound Healing & Private Sound Baths on Long Island",
  description: "Private sound healing and sound bath experiences in Patchogue, Long Island with crystal bowls, gong, chimes, and restorative frequencies.",
  path: "/sound-healing-long-island",
  image: "/homepage-images/moodysound.jpeg",
});

export default function SoundHealingLongIslandPage() {
  return (
    <LocalDiscoveryPage
      eyebrow="Sound Healing on Long Island"
      title="Rest inside an immersive landscape of sound."
      description="Private sound healing in Patchogue for individuals, couples, and small groups seeking a restorative pause, nervous system softening, and a deeper sense of ease."
      serviceName="Sound Healing and Private Sound Baths on Long Island"
      path="/sound-healing-long-island"
      image="/homepage-images/moodysound.jpeg"
      imageAlt="Crystal singing bowls used for sound healing on Long Island"
      introductionTitle="A private sound experience shaped around your intention."
      introduction={[
        "Sound healing uses crystal bowls, gong, chimes, and other instruments to create an immersive experience that invites the body and mind to settle.",
        "Kate offers private sound immersions in Patchogue and creates customized sound experiences for groups and gatherings across Long Island.",
      ]}
      details={[
        { title: "Private Sound Immersion", description: "A one-on-one restorative experience designed around your energy, comfort, and intention." },
        { title: "Small Group Sound Baths", description: "A shared sound journey for friends, private gatherings, celebrations, and intentional circles." },
        { title: "Workplace & Event Sound", description: "Customized sound experiences for teams, retreats, community spaces, and wellness events." },
      ]}
      goodToKnow={[
        "Private sessions are available in Patchogue, with select group offerings across Long Island.",
        "No meditation or sound healing experience is required.",
        "Most guests rest on a mat, while seated arrangements can be accommodated.",
        "The experience can be tailored for individuals, couples, private groups, or organizations.",
      ]}
      faqs={[
        { question: "What is a sound bath?", answer: "A sound bath is an immersive listening experience. You rest comfortably while instruments such as crystal bowls, gong, and chimes create layers of sound intended to support relaxation and presence." },
        { question: "Where can I experience sound healing on Long Island?", answer: "Kate offers private sound healing in Patchogue and travels for select group, workplace, retreat, and community experiences across Long Island." },
        { question: "What should I bring to a sound healing session?", answer: "For a private appointment, the essentials are provided. For some group events, you may be invited to bring a yoga mat, blanket, water, and anything else that helps you feel comfortable." },
        { question: "Can I book a sound bath for a private group?", answer: "Yes. Private group sound experiences can be shaped for friends, celebrations, retreats, teams, or meaningful gatherings. Contact Kate with your group size, location, and preferred date." },
      ]}
      primaryCta={{ label: "Book Private Sound Healing", href: "https://calendly.com/thelightnessofbeing/private-sound-healing" }}
      secondaryCta={{ label: "Explore Group Experiences", href: "/corporate-wellness-long-island" }}
    />
  );
}

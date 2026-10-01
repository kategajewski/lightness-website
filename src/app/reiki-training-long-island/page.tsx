import { LocalDiscoveryPage } from "@/components/local-discovery-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Reiki Training for Long Island Students",
  description: "Learn Reiki with Kate Gajewski through a live 10-week online training serving Long Island students seeking personal healing and practitioner growth.",
  path: "/reiki-training-long-island",
  image: "/homepage-images/ghl-reiki-rising.webp",
});

export default function ReikiTrainingLongIslandPage() {
  return (
    <LocalDiscoveryPage
      eyebrow="Reiki Training for Long Island"
      title="Learn Reiki through practice, embodiment, and meaningful support."
      description="Explore Reiki training and coaching with Kate Gajewski. The Embodied Healer and private Reiki coaching are available now. Reiki Rising returns Fall 2027."
      serviceName="Reiki Training for Long Island Students"
      path="/reiki-training-long-island"
      image="/homepage-images/ghl-reiki-rising.webp"
      imageAlt="Reiki Rising training with Kate Gajewski"
      introductionTitle="A Reiki training designed for depth—not a rushed weekend certification."
      introduction={[
        "Reiki Rising offers time to learn, receive, practice, ask questions, and integrate Reiki into your own life before deciding how you may want to share it with others.",
        "The program is taught live online, making it accessible to students throughout Long Island while preserving the connection and support of a guided cohort.",
      ]}
      details={[
        { title: "Personal Healing", description: "Build a steady relationship with Reiki through self-practice, reflection, and energetic awareness." },
        { title: "Embodied Learning", description: "Move beyond information into hands-on practice, integration, and confidence that grows over time." },
        { title: "Supportive Community", description: "Learn inside a live cohort with guidance, conversation, and space for your individual process." },
      ]}
      goodToKnow={[
        "Reiki Rising is a 10-week live online experience, not a self-paced course.",
        "Students throughout Long Island can participate from home.",
        "The training supports both personal healing and a future practitioner path.",
        "Reiki Rising enrollment is closed until Fall 2027. Join the interest list or explore The Embodied Healer and private Reiki coaching, available now.",
      ]}
      faqs={[
        { question: "Can I take Reiki training if I live on Long Island?", answer: "Yes. Reiki Rising is taught live online, so students across Long Island can join from home while still receiving real-time teaching and group support." },
        { question: "Do I need experience before learning Reiki?", answer: "No previous Reiki experience is needed. The program is designed to support students beginning their journey as well as those returning to Reiki in a deeper way." },
        { question: "Is the training only for future practitioners?", answer: "No. Many students begin for their own healing, spiritual development, or family practice. You do not need to decide in advance whether you want to work professionally." },
        { question: "How is Reiki Rising different from a weekend class?", answer: "The 10-week rhythm creates more space for practice, questions, embodiment, and integration. Students can develop a lived relationship with Reiki rather than receiving all the material at once." },
      ]}
      primaryCta={{ label: "Explore Available Training & Coaching", href: "/courses" }}
      secondaryCta={{ label: "View All Training", href: "/courses" }}
    />
  );
}

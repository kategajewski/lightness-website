export const site = {
  name: "The Lightness of Being",
  subtitle: "Healing with Kate Gajewski",
  description:
    "Private healing sessions, courses, and memberships for The Lightness of Being.",
  social: {
    instagram: "https://instagram.com/thelightness0fbeing",
  },
  contact: {
    address: "98 Medford Ave, Patchogue, NY 11772",
  },
  links: {
    home: "/",
    about: "/about",
    services: "/services",
    courses: "/courses",
    membership: "/membership",
    giftCertificate: "/gift-certificate",
    privacyPolicy: "/privacy-policy",
    terms: "/terms",
    refundPolicy: "/refund-policy",
    login: "/login",
    account: "/account",
    reiki: "https://bethelightness.com/reiki",
    reikiTraining: "/reiki-rising",
    soundTraining: "/sound-training",
    corporateWellness: "/corporate-wellness",
    events: "/events",
    contact: "/contact",
    hypnotherapy:
      "https://bethelightness.com/hypnotherapy-past-life-regression-therapy",
    soundBath: "https://bethelightness.com/private-sound-bath",
    calendly: "https://calendly.com/thelightnessofbeing",
    mentorship: "/mentorship",
    mentorshipApplication: "/mentorship-application",
    meditation: "https://root-and-shield.bethelightness.com/about",
    specialBlessing: "/special-blessing",
    sacredSoundsUnderTheSky: "/sacred-sounds-under-the-sky",
    rosaries: "https://bethelightness.com/rosary-custom-order-form",
  },
};

export const booking = {
  primaryLabel: "Join Monthly Membership",
  primaryHref: site.links.membership,
  primaryDescription:
    "Monthly Rest & Reset offers ongoing support, built-in savings, and a steady rhythm of care for clients who want healing to be a regular part of life.",
  secondaryOptions: [
    {
      label: "Book Appointment",
      href: site.links.calendly,
      description: "Book private one-on-one healing support through Kate's live Calendly schedule.",
    },
  ],
} as const;

export const primaryNavigation = [
  { label: "Healing Sessions", href: site.links.services },
  { label: "About", href: site.links.about },
  { label: "Training", href: site.links.courses },
  { label: "Events", href: site.links.events },
  { label: "Contact", href: site.links.contact },
] as const;

export const footerNavigation = [
  { label: "Healing Sessions", href: site.links.services },
  { label: "About", href: site.links.about },
  { label: "Training", href: site.links.courses },
  { label: "Events", href: site.links.events },
  { label: "Gift Certificate", href: site.links.giftCertificate },
  { label: "Privacy Policy", href: site.links.privacyPolicy },
  { label: "Terms", href: site.links.terms },
  { label: "Refund Policy", href: site.links.refundPolicy },
] as const;

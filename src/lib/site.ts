export const site = {
  name: "The Lightness of Being",
  subtitle: "Healing with Kate Gajewski",
  url: "https://bethelightness.com",
  description:
    "Holistic healing with Kate Gajewski in Patchogue, New York: Reiki and energy healing, hypnotherapy, sound healing, yoga, practitioner training, mentorship, events, corporate wellness, ceremonies and handcrafted sacred prayer beads.",
  adminEmails: [
    "kate@bethelightness.com",
    "kategajewski@gmail.com",
    "thelightnessofbeingli@gmail.com",
  ],
  social: {
    instagram: "https://instagram.com/thelightness0fbeing",
    googleReviews:
      "https://www.google.com/search?q=the+lightness+of+being+patchogue#mpd=~2014996060404357506/customers/reviews",
  },
  contact: {
    address: "98 Medford Ave, Patchogue, NY 11772",
    locality: "Patchogue",
    region: "NY",
    postalCode: "11772",
    country: "US",
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
    inquiries: "/inquiries",
    reiki: "https://bethelightness.com/reiki",
    reikiTraining: "/reiki-rising",
    soundTraining: "/sound-training",
    soundJourneysAtSanctuary: "/sound-journeys-at-sanctuary",
    corporateWellness: "/corporate-wellness",
    events: "/events",
    emailUpdates: "/email-updates",
    writing: "/writing",
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
    goldenHourJuly: "/golden-hour-july-28",
    riseIntoLight: "/rise-into-light",
    reikiShareJuly: "/reiki-share-july-1",
    reikiShareOctober: "/reiki-share-october-15",
    reikiShare: "/reiki-share",
    theWeekendReset: "/the-weekend-reset",
    flowField: "/flow-field",
    divineRoseFrequencies: "/divine-rose-frequencies",
    rosaries: "/divine-rose-frequencies",
  },
};

export const booking = {
  primaryLabel: "Join Monthly Membership",
  primaryHref: site.links.membership,
  primaryDescription:
    "Monthly Rest & Reset offers ongoing support, built-in savings and a steady rhythm of care for clients who want healing to be a regular part of life.",
  secondaryOptions: [
    {
      label: "Book Appointment",
      href: site.links.calendly,
      description: "Book private one-on-one healing support through Kate's live Calendly schedule.",
    },
  ],
} as const;

export function isAdminEmail(email?: string | null) {
  if (!email) return false;

  return site.adminEmails.includes(email.toLowerCase());
}

export const primaryNavigation = [
  { label: "Healing Sessions", href: site.links.services },
  { label: "About", href: site.links.about },
  { label: "Training", href: site.links.courses },
  { label: "Rosaries", href: site.links.rosaries },
  { label: "Events", href: site.links.events },
  { label: "Writing", href: site.links.writing },
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

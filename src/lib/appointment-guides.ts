export type AppointmentGuideSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
  intake?: {
    href: string;
    label: string;
  };
  studioDirections?: boolean;
};

export type AppointmentGuide = {
  slug: string;
  service: string;
  title: string;
  introduction: readonly string[];
  sections: readonly AppointmentGuideSection[];
  closing: string;
};

export const appointmentStudio = {
  name: "The Lightness of Being",
  street: "98 Medford Avenue",
  city: "Patchogue, NY",
  directions:
    "You can find us using Google Maps or Apple Maps. The studio is on the back side of the Wekerle Insurance Agency building, with our entrance facing the parking lot. Look for the large sign above our window that reads The Lightness of Being.",
  googleMaps:
    "https://www.google.com/maps/search/?api=1&query=The+Lightness+of+Being+98+Medford+Avenue+Patchogue+NY",
  appleMaps:
    "https://maps.apple.com/?q=The+Lightness+of+Being&address=98+Medford+Avenue,Patchogue,NY",
} as const;

const meetConnection =
  "Use the Google Meet link in your appointment confirmation at our scheduled time.";
const notice =
  "Please provide at least 24 hours’ notice if you need to cancel or reschedule.";
const arrival = "Please arrive no earlier than 5 minutes before your appointment.";
const adultArrival =
  "The time between sessions allows me to reset the space and my own energy so I can welcome you with my full presence. This is an important part of preparing for your session. If you arrive earlier, the door will be locked while I finish getting ready for you.";
const childArrival =
  "The time between sessions allows me to reset the space and my own energy so I can welcome your child with my full presence. This is an important part of preparing for their session. If you arrive earlier, the door will be locked while I finish getting ready for you.";

const inPerson: AppointmentGuideSection = {
  id: "in-person",
  title: "For in-person sessions",
  paragraphs: [arrival, adultArrival],
  studioDirections: true,
};

const depositPolicy: AppointmentGuideSection = {
  id: "cancellations",
  title: "Cancellations & rescheduling",
  paragraphs: [
    notice,
    "For cancellations or rescheduling with less than 24 hours’ notice, or missed appointments, your deposit will be retained by The Lightness of Being. A new deposit will be required to book another appointment.",
  ],
};

const newReikiClients: AppointmentGuideSection = {
  id: "new-clients",
  title: "New clients",
  paragraphs: [
    "Please complete your intake form before your appointment. This helps us make the most of your allotted session time.",
  ],
  intake: {
    href: "/client-intake/reiki",
    label: "Complete your Reiki intake form",
  },
};

const reikiPreparation: AppointmentGuideSection = {
  id: "getting-ready",
  title: "Getting ready",
  paragraphs: [
    "Wear comfortable clothing and, if possible, avoid caffeine for 2–3 hours before your appointment. Come prepared to relax. Once we begin, I’ll take care of guiding you through the rest.",
  ],
};

const reikiVirtual: AppointmentGuideSection = {
  id: "virtual",
  title: "For virtual sessions",
  paragraphs: [
    meetConnection,
    "Prepare a quiet, private space where you can relax without interruptions. Have a comfortable place to sit or lie down, with a blanket and pillow nearby if you’d like. Please check your internet connection and audio beforehand.",
  ],
};

const curriculumPreparation: AppointmentGuideSection = {
  id: "getting-ready",
  title: "Getting ready",
  paragraphs: [
    "Please have your curriculum materials, a notebook and a pen nearby, along with any questions or experiences you’d like to discuss.",
    "If you’ll be receiving Reiki or an upgrade, wear comfortable clothing and, if possible, avoid caffeine for 2–3 hours beforehand. Come prepared to settle in and receive.",
  ],
};

const firstMentorshipReiki: AppointmentGuideSection = {
  id: "new-clients",
  title: "New clients",
  paragraphs: [
    "If this will be your first Reiki session with me, please complete your intake form before our appointment. This helps us make the most of your allotted session time.",
  ],
  intake: {
    href: "/client-intake/reiki",
    label: "Complete your Reiki intake form",
  },
};

const curriculumVirtual: AppointmentGuideSection = {
  id: "virtual",
  title: "For virtual sessions",
  paragraphs: [
    meetConnection,
    "Please prepare a quiet, private space where you can give our session your full attention. If you’re receiving Reiki or an upgrade, have a comfortable place to sit or lie down, with a blanket nearby if you’d like. Check your internet connection and audio beforehand.",
  ],
};

export const appointmentGuides: readonly AppointmentGuide[] = [
  {
    slug: "sacred-reset",
    service: "Sacred Reset",
    title: "Before Your Reiki Appointment ✨",
    introduction: [
      "Thank you for booking your Sacred Reset session with me! I’m looking forward to sharing this time with you.",
    ],
    sections: [
      reikiPreparation,
      newReikiClients,
      reikiVirtual,
      inPerson,
      depositPolicy,
    ],
    closing:
      "I’m looking forward to welcoming you, wherever you’re joining me from. 🤍",
  },
  {
    slug: "rest-receive",
    service: "Rest & Receive",
    title: "Before Your Reiki Appointment ✨",
    introduction: [
      "Thank you for booking your Rest & Receive session with me! I’m looking forward to sharing this time with you.",
    ],
    sections: [
      reikiPreparation,
      newReikiClients,
      reikiVirtual,
      inPerson,
      depositPolicy,
    ],
    closing:
      "I’m looking forward to welcoming you, wherever you’re joining me from. 🤍",
  },
  {
    slug: "children",
    service: "Gentle Support",
    title: "Before Your Child’s Gentle Support Session ✨",
    introduction: [
      "Thank you for booking Gentle Support, a 30-minute Reiki session for your child. I’m looking forward to connecting with you both!",
    ],
    sections: [
      {
        id: "getting-ready",
        title: "Getting ready",
        paragraphs: [
          "Please dress your child in comfortable clothing. You can let them know they’re joining me for some quiet, restful time. They’re welcome to have a favorite stuffed animal or blanket with them to help them feel comfortable.",
          "I’ll follow your child’s pace and comfort throughout our time together and guide you both through the session.",
        ],
      },
      {
        id: "new-clients",
        title: "New clients",
        paragraphs: [
          "If this is your child’s first appointment, please complete their intake form beforehand. This helps us make the most of their allotted session time.",
        ],
        intake: {
          href: "/client-intake/childrens-reiki",
          label: "Complete your child’s Reiki intake form",
        },
      },
      {
        id: "virtual",
        title: "For virtual sessions",
        paragraphs: [
          meetConnection,
          "Prepare a quiet, familiar space with a comfortable place for your child to sit or lie down. Please stay nearby to support them and help with any technology needs. Check your internet connection and audio beforehand.",
        ],
      },
      {
        ...inPerson,
        paragraphs: [arrival, childArrival],
      },
      depositPolicy,
    ],
    closing: "Thank you for trusting me to support your child. 🤍",
  },
  {
    slug: "inner-journey",
    service: "Inner Journey",
    title: "Before Your Inner Journey Session ✨",
    introduction: [
      "Thank you for booking your Inner Journey hypnotherapy session with me! I’m looking forward to sharing this time with you.",
    ],
    sections: [
      {
        id: "getting-ready",
        title: "Getting ready",
        paragraphs: [
          "Wear comfortable clothing and, if possible, avoid caffeine for 2–3 hours before your appointment.",
          "Please come with a specific intention. This may be something you’d like to shine a light on, heal or release. This could be a pattern, a feeling, a belief or an experience you’d like to explore. We’ll talk through your intention together before beginning.",
          "Come prepared to settle in and turn inward. I’ll guide you through the rest.",
        ],
      },
      {
        ...newReikiClients,
        intake: {
          href: "/client-intake/hypnotherapy",
          label: "Complete your hypnotherapy intake form",
        },
      },
      {
        id: "virtual",
        title: "For virtual sessions",
        paragraphs: [
          meetConnection,
          "Prepare a quiet, private space where you can remain undisturbed for the full session. Choose a comfortable place to recline or lie down, with your device positioned so I can see and hear you. Have a blanket nearby if you’d like, and check your internet connection and audio beforehand.",
        ],
      },
      inPerson,
      depositPolicy,
    ],
    closing: "Thank you for trusting me to hold this space with you. 🤍",
  },
  {
    slug: "sound",
    service: "Sound Immersion",
    title: "Before Your Sound Immersion ✨",
    introduction: [
      "Thank you for booking your Sound Immersion with me! I’m looking forward to sharing this time with you.",
    ],
    sections: [
      {
        id: "getting-ready",
        title: "Getting ready",
        paragraphs: [
          "Wear comfortable clothing and, if possible, avoid caffeine for 2–3 hours before your appointment. Come prepared to relax. Once we begin, I’ll take care of the rest.",
        ],
      },
      {
        id: "group-size",
        title: "Has your group size changed?",
        paragraphs: [
          "If the number of people attending has changed since booking, please let me know before your appointment so I can prepare accordingly.",
          "Please share these preparation and arrival details with everyone in your group.",
        ],
      },
      {
        id: "new-clients",
        title: "New clients",
        paragraphs: [
          "If this is your first Sound Immersion with me, please complete your sound bath intake form before your appointment.",
          "Please share the intake link with your group so each participant can complete their own form.",
        ],
        intake: {
          href: "/client-intake/sound-bath",
          label: "Complete your sound bath intake form",
        },
      },
      {
        id: "virtual",
        title: "For virtual sessions",
        paragraphs: [
          meetConnection,
          "Prepare a quiet space with a comfortable place to sit or lie down. Have a blanket and pillow nearby if you’d like. Check your internet connection and audio beforehand, and have headphones or a speaker available for listening.",
        ],
      },
      inPerson,
      depositPolicy,
    ],
    closing: "I’m looking forward to welcoming you into this experience. 🤍",
  },
  {
    slug: "guidance",
    service: "Personalized Guidance",
    title: "Before Your Personalized Guidance Session ✨",
    introduction: [
      "Thank you for booking your Personalized Guidance session with me! I’m looking forward to connecting with you.",
    ],
    sections: [
      {
        id: "getting-ready",
        title: "Getting ready",
        paragraphs: [
          "Please come prepared with what you’d like to focus on and any questions you have. You’re welcome to jot down a few notes beforehand so we can make the most of our time together.",
          "I also recommend having a notebook and pen to capture any insights, ideas or next steps you’d like to remember.",
        ],
      },
      {
        id: "virtual",
        title: "For virtual sessions",
        paragraphs: [
          meetConnection,
          "Please find a quiet, private place where we can speak freely and you can give our conversation your attention. Check your internet connection and audio beforehand.",
        ],
      },
      inPerson,
      depositPolicy,
    ],
    closing:
      "I’m looking forward to hearing what’s on your mind and exploring it together. 🤍",
  },
  {
    slug: "connection",
    service: "Connection Session",
    title: "Before Your Connection Session ✨",
    introduction: [
      "Thank you for booking a Connection Session with me! I’m looking forward to getting to know you, hearing what’s calling you to this work and exploring how I can support you.",
      "This is a 30-minute conversation by phone or Google Meet to discuss working together and answer your questions.",
    ],
    sections: [
      {
        id: "getting-ready",
        title: "Getting ready",
        paragraphs: [
          "Come prepared to share a little about what you’re looking for, what you’d like support with and any questions you have about my offerings. You’re welcome to have a notebook and pen to jot down anything you’d like to remember.",
          "Please find a quiet, comfortable place where we can speak freely and you can give our conversation your attention.",
        ],
      },
      {
        id: "connecting",
        title: "Connecting for your appointment",
        paragraphs: [
          "Please check your Calendly confirmation for your selected meeting method and connection details.",
          "If we’re meeting through Google Meet, use the link provided at your scheduled appointment time. Please check your internet connection and audio beforehand.",
          "If we’re connecting by phone, follow the calling instructions in your confirmation.",
        ],
      },
      {
        id: "cancellations",
        title: "If your plans change",
        paragraphs: [
          "Please cancel or reschedule through your confirmation email with at least 24 hours’ notice so I can make that time available to someone else.",
          "This complimentary session is time I’ve set aside especially for you. If you miss our appointment without notice, I may be unable to offer another Connection Session. Thank you for respecting my time and the opportunity to connect.",
        ],
      },
    ],
    closing: "I’m looking forward to speaking with you! 🤍",
  },
  {
    slug: "embodied-healer",
    service: "Embodied Healer",
    title: "Before Your Embodied Healer Session ✨",
    introduction: [
      "I’m looking forward to our upcoming session! Depending on where we are in your mentorship, our time together may include receiving Reiki, receiving Reiki upgrades or exploring your curriculum.",
    ],
    sections: [
      curriculumPreparation,
      firstMentorshipReiki,
      curriculumVirtual,
      inPerson,
      {
        id: "cancellations",
        title: "Cancellations & rescheduling",
        paragraphs: [
          notice,
          "With less than 24 hours’ notice, or if you miss your appointment, the session will count as used within your mentorship. Any assigned reading or curriculum will be provided for you to complete independently.",
        ],
      },
    ],
    closing:
      "Thank you for honoring our time together and the care that goes into supporting your journey. 🤍",
  },
  {
    slug: "reiki-rising",
    service: "Reiki Rising",
    title: "Before Your Reiki Rising Session ✨",
    introduction: [
      "I’m looking forward to our upcoming session! Depending on where we are in your training, our time together may include receiving Reiki, receiving Reiki upgrades or exploring your curriculum.",
    ],
    sections: [
      curriculumPreparation,
      firstMentorshipReiki,
      curriculumVirtual,
      inPerson,
      {
        id: "cancellations",
        title: "Cancellations & rescheduling",
        paragraphs: [
          notice,
          "With less than 24 hours’ notice, or if you miss your appointment, the session will count as used within your training. Any assigned reading or curriculum will be provided for you to complete independently.",
        ],
      },
    ],
    closing:
      "Thank you for honoring our time together and the care that goes into supporting your journey. 🤍",
  },
];

export function getAppointmentGuide(slug: string): AppointmentGuide | undefined {
  return appointmentGuides.find((guide) => guide.slug === slug);
}

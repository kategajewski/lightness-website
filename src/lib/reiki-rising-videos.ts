import "server-only";
import { createHash } from "node:crypto";

type Lesson = { slug: string; title: string; videoId: string; duration: string };
type CourseModule = { date: string; releaseAt: string; title: string; lessons: Lesson[] };

// Live-call recordings belong to this cohort, separately from Sunday lessons.
export const reikiRisingReplays: CourseModule[] = [
  {
    date: "September 30, 2026",
    releaseAt: "2026-10-02T00:00:00-04:00",
    title: "Opening Class Replay",
    lessons: [{
      slug: "live-call-2026-09-30",
      title: "September 30: Opening Class Replay",
      videoId: "5c5fa972-1d82-48e5-9ec1-2aa69818ff89",
      duration: "1 hour 13 minutes",
    }],
  },
];

// New York midnight is still EDT on November 1; EST starts later that morning.
export const reikiRisingModules: CourseModule[] = [
  {
    date: "September 27, 2026", releaseAt: "2026-09-27T00:00:00-04:00",
    title: "The foundations of Reiki, how Reiki can feel, Reiki history, and the science behind energy healing",
    lessons: [
      { slug: "what-is-reiki", title: "What Is Reiki and How Does It Feel", videoId: "df773c45-ee9e-4004-b120-ee071e2e9785", duration: "22:26" },
      { slug: "holy-fire-reiki", title: "What Is Holy Fire Reiki", videoId: "95cdeabd-add9-4872-89ff-8675eb041385", duration: "6:05" },
      { slug: "science-behind-reiki", title: "The Science Behind Reiki", videoId: "016be248-4ac9-410f-bd05-0a5686c9c997", duration: "9:19" },
      { slug: "history-of-reiki", title: "History of Reiki", videoId: "60819e4b-f1e6-463e-8b49-3be6862d36ca", duration: "29:38" },
    ],
  },
  { date: "October 4, 2026", releaseAt: "2026-10-04T00:00:00-04:00", title: "Chakras, the aura, meridians, and how energy can show up in the body", lessons: [] },
  { date: "October 11, 2026", releaseAt: "2026-10-11T00:00:00-04:00", title: "Grounding, shielding, and creating energetic safety", lessons: [] },
  { date: "October 18, 2026", releaseAt: "2026-10-18T00:00:00-04:00", title: "The Three Pillars of Reiki, self-Reiki, and hand positions", lessons: [] },
  { date: "October 25, 2026", releaseAt: "2026-10-25T00:00:00-04:00", title: "Sharing Reiki with others, animals, plants, food, and water", lessons: [] },
  { date: "November 1, 2026", releaseAt: "2026-11-01T00:00:00-04:00", title: "Reiki symbols and Cho Ku Rei", lessons: [] },
  { date: "November 8, 2026", releaseAt: "2026-11-08T00:00:00-05:00", title: "Sei He Ki, Koki-ho, and Gyoshi Ho", lessons: [] },
  { date: "November 15, 2026", releaseAt: "2026-11-15T00:00:00-05:00", title: "Hon Sha Ze Sho Nen and distant Reiki", lessons: [] },
  { date: "November 22, 2026", releaseAt: "2026-11-22T00:00:00-05:00", title: "Practicing a full Reiki session with symbols and documentation", lessons: [] },
  { date: "November 29, 2026", releaseAt: "2026-11-29T00:00:00-05:00", title: "Bringing Reiki into the world, business foundations, and psychic surgery", lessons: [] },
];

export function isModuleReleased(module: CourseModule, now = Date.now()) {
  return Number.isFinite(now) && now >= Date.parse(module.releaseAt);
}

export function findReikiLesson(slug: string) {
  for (const courseModule of [...reikiRisingModules, ...reikiRisingReplays]) {
    const lesson = courseModule.lessons.find((item) => item.slug === slug);
    if (lesson) return { module: courseModule, lesson };
  }
  return null;
}

export function createReikiPlaybackUrl(videoId: string, now = Date.now()) {
  const key = process.env.BUNNY_STREAM_EMBED_TOKEN_KEY?.trim();
  if (!key) return null;
  const expires = Math.floor(now / 1000) + 2 * 60 * 60;
  const token = createHash("sha256").update(`${key}${videoId}${expires}`).digest("hex");
  const url = new URL(`https://player.mediadelivery.net/embed/762439/${videoId}`);
  url.searchParams.set("token", token);
  url.searchParams.set("expires", String(expires));
  url.searchParams.set("autoplay", "false");
  url.searchParams.set("preload", "false");
  url.searchParams.set("responsive", "true");
  return url.toString();
}

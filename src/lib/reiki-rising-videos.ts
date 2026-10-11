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
  {
    date: "October 7, 2026",
    releaseAt: "2026-10-08T00:00:00-04:00",
    title: "Week 2 Class Replay",
    lessons: [{
      slug: "live-call-2026-10-07",
      title: "October 7: Week 2 Class Replay",
      videoId: "b1c84f74-8a47-4412-b632-7eec273b7055",
      duration: "49 minutes 31 seconds",
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
  {
    date: "October 4, 2026", releaseAt: "2026-10-04T00:00:00-04:00",
    title: "Chakras, the aura, meridians, and how energy can show up in the body",
    lessons: [
      { slug: "energy-anatomy", title: "Intro to Energy Anatomy", videoId: "973b40e0-00a9-45a9-b32d-aa0c075fef8b", duration: "3:53" },
      { slug: "chakras", title: "Chakras", videoId: "00f97bcd-01c5-464f-8a0f-a935d4660950", duration: "2:42" },
      { slug: "root-chakra", title: "Root Chakra", videoId: "81a13ccf-09bf-480c-8bcd-a1e8ade3b372", duration: "9:01" },
      { slug: "sacral-chakra", title: "Sacral Chakra", videoId: "1f0ff622-18c2-4ffe-ae32-e1c1f2585532", duration: "4:06" },
      { slug: "solar-plexus-chakra", title: "Solar Plexus Chakra", videoId: "4e6191c4-6113-46fd-885b-d66c9604ba04", duration: "5:32" },
      { slug: "heart-chakra", title: "Heart Chakra", videoId: "713221d4-cdbd-4a5b-b7a3-609ab047e7e8", duration: "3:56" },
      { slug: "throat-chakra", title: "Throat Chakra", videoId: "b800d78d-4f4c-4b63-b61c-9af8edd3dfc1", duration: "5:59" },
      { slug: "third-eye-chakra", title: "Third Eye Chakra", videoId: "c786d32c-c460-4635-b9e2-e883cc796028", duration: "3:04" },
      { slug: "crown-chakra", title: "Crown Chakra", videoId: "89ae861e-f6a0-49a2-9bf3-71a08566ba79", duration: "7:50" },
      { slug: "meridians", title: "Meridians", videoId: "da0aa88e-6a81-4177-8f28-f1b992136acc", duration: "2:53" },
      { slug: "aura", title: "Aura", videoId: "f7fd4641-f255-45d0-8165-881794ed3008", duration: "7:14" },
    ],
  },
  {
    date: "October 11, 2026", releaseAt: "2026-10-11T00:00:00-04:00",
    title: "Grounding, shielding and creating energetic safety",
    lessons: [
      { slug: "grounding", title: "Grounding", videoId: "9e985f97-b07a-4291-8aeb-88650ec325d4", duration: "10:22" },
      { slug: "shielding", title: "Shielding", videoId: "cd37036e-03cf-4fd8-a035-d584d2a9a611", duration: "21:06" },
    ],
  },
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

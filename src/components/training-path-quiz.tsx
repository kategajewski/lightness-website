"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type PathKey = "reikiRising" | "embodiedHealer" | "guidance";

type QuizOption = {
  label: string;
  description: string;
  scores: Record<PathKey, number>;
  resultReflection?: string;
};

type QuizQuestion = {
  question: string;
  options: QuizOption[];
};

type QuizResult = {
  eyebrow: string;
  title: string;
  description: string;
  reasons: string[];
  cta: string;
  href: string;
  secondaryCta?: string;
  secondaryHref?: string;
  tertiaryCta?: string;
  tertiaryHref?: string;
};

const paths: Record<PathKey, QuizResult> = {
  reikiRising: {
    eyebrow: "Your clearest match",
    title: "Reiki Rising",
    description:
      "A live 10-week online journey where you can learn, practice and integrate Reiki within a steady group container.",
    reasons: [
      "You are drawn to a clear learning rhythm and shared experience.",
      "You want meaningful depth without beginning with a fully private path.",
      "You are ready to grow through live practice, reflection and community support.",
    ],
    cta: "Explore Reiki Rising",
    href: "/reiki-rising",
  },
  embodiedHealer: {
    eyebrow: "Your clearest match",
    title: "The Embodied Healer",
    description:
      "A deeply personalized 1:1 Reiki mentorship that can meet you at the beginning and grow with you through practitioner or Master Teacher work.",
    reasons: [
      "You want guidance shaped around your experience, pace and calling.",
      "You are seeking a more intimate and highly supported learning relationship.",
      "You may be ready for a longer path toward embodied practice, mastery, or teaching.",
    ],
    cta: "Explore The Embodied Healer",
    href: "/mentorship",
  },
  guidance: {
    eyebrow: "Your clearest match",
    title: "Personalized Guidance",
    description:
      "A focused one-on-one mentorship session for trained Reiki practitioners who want clarity, spiritual support or grounded direction without beginning another educational program.",
    reasons: [
      "You have already learned Reiki and want support as you continue growing in your practice.",
      "You want perspective, mentorship or renewed confidence without furthering your education just yet.",
      "A focused session feels more supportive than another structured curriculum right now.",
    ],
    cta: "Book Personalized Guidance",
    href: "https://calendly.com/thelightnessofbeing/mentorship",
  },
};

const closeTrainingResult: QuizResult = {
  eyebrow: "Your next step",
  title: "Explore both Reiki training paths",
  description:
    "Your answers reflect qualities found in both Reiki Rising and The Embodied Healer. Taking time to compare the two paths may help you feel which learning experience is right for you.",
  reasons: [
    "Some of your answers point toward the rhythm and connection of a live group experience.",
    "Other answers reflect a desire for personalized support and room to move at your own pace.",
    "You do not need to force a decision before you feel ready. Explore both paths and notice which one feels most supportive.",
  ],
  cta: "Explore Reiki Rising",
  href: "/reiki-rising",
  secondaryCta: "Explore The Embodied Healer",
  secondaryHref: "/mentorship",
  tertiaryCta: "Send Kate a Message",
  tertiaryHref:
    "/contact?inquiryType=training&subject=Help%20Choosing%20a%20Reiki%20Path",
};

const questions: QuizQuestion[] = [
  {
    question: "What first called you to Reiki, or what continues to call you now?",
    options: [
      {
        label: "My own healing and spiritual growth",
        description:
          "I want to feel more connected, balanced and supported within myself.",
        scores: { reikiRising: 0, embodiedHealer: 0, guidance: 0 },
      },
      {
        label: "Supporting the people and animals I love",
        description:
          "I feel drawn to share Reiki with family, friends, or animal companions.",
        scores: { reikiRising: 0, embodiedHealer: 0, guidance: 0 },
      },
      {
        label: "Serving others through healing work",
        description:
          "I want to begin, deepen, or feel more confident in my work as a practitioner.",
        scores: { reikiRising: 0, embodiedHealer: 0, guidance: 0 },
      },
      {
        label: "All of the above",
        description:
          "Reiki is connected to my healing, my relationships and how I feel called to serve.",
        scores: { reikiRising: 0, embodiedHealer: 0, guidance: 0 },
      },
    ],
  },
  {
    question: "What feels most important to you right now?",
    options: [
      {
        label: "Learning Reiki in a meaningful way",
        description: "I want a strong foundation and space to practice what I learn.",
        scores: { reikiRising: 3, embodiedHealer: 3, guidance: 0 },
      },
      {
        label: "Following a deeply personal Reiki path",
        description:
          "I want individualized support that can meet me as a beginner or guide me toward mastery.",
        scores: { reikiRising: 0, embodiedHealer: 4, guidance: 1 },
      },
      {
        label: "Finding clarity and support",
        description: "I need help understanding my next step before choosing a larger path.",
        scores: { reikiRising: 0, embodiedHealer: 1, guidance: 4 },
      },
    ],
  },
  {
    question: "What kind of support helps you grow best?",
    options: [
      {
        label: "A live group experience",
        description: "I value shared learning, community and a clear collective rhythm.",
        scores: { reikiRising: 4, embodiedHealer: 0, guidance: 0 },
      },
      {
        label: "A private, ongoing relationship",
        description: "I want highly personal guidance and room to move at my own pace.",
        scores: { reikiRising: 0, embodiedHealer: 4, guidance: 1 },
      },
      {
        label: "A focused one-on-one session",
        description: "I want thoughtful direction without entering a full program yet.",
        scores: { reikiRising: 0, embodiedHealer: 1, guidance: 4 },
      },
    ],
  },
  {
    question: "Which pace feels most supportive in your life right now?",
    options: [
      {
        label: "A 10-week guided rhythm",
        description: "I can make room for live learning and practice over a defined season.",
        scores: { reikiRising: 4, embodiedHealer: 1, guidance: 0 },
      },
      {
        label: "A spacious path built around me",
        description: "I want my learning to unfold privately and adapt as I grow.",
        scores: { reikiRising: 0, embodiedHealer: 4, guidance: 1 },
      },
      {
        label: "One clear next step",
        description: "I need support but not a full training commitment.",
        scores: { reikiRising: 0, embodiedHealer: 0, guidance: 4 },
      },
    ],
  },
  {
    question: "What would you most love to carry forward from this experience?",
    options: [
      {
        label: "A grounded personal Reiki practice",
        description: "I want Reiki to become a lived part of my healing and daily life.",
        scores: { reikiRising: 4, embodiedHealer: 2, guidance: 0 },
      },
      {
        label: "Confidence as a practitioner or teacher",
        description: "I want to support others and develop real depth in my practice.",
        scores: { reikiRising: 1, embodiedHealer: 4, guidance: 0 },
      },
      {
        label: "Clarity about what comes next",
        description: "I want perspective, reflection and grounded direction.",
        scores: { reikiRising: 0, embodiedHealer: 1, guidance: 4 },
      },
    ],
  },
  {
    question: "Where are you in your Reiki journey right now?",
    options: [
      {
        label: "I am ready to begin with others",
        description: "A supportive cohort feels energizing and right for me.",
        scores: { reikiRising: 4, embodiedHealer: 0, guidance: 0 },
      },
      {
        label: "I feel deeply called to a personal path",
        description: "I am ready for individualized training and close support.",
        scores: { reikiRising: 0, embodiedHealer: 4, guidance: 0 },
      },
      {
        label: "I am still discerning",
        description: "I want to talk it through before making a larger commitment.",
        scores: { reikiRising: 0, embodiedHealer: 0, guidance: 4 },
      },
      {
        label: "I have already learned Reiki and want to deepen my education",
        description:
          "I want to revisit my foundations, deepen my practice or learn a different form of Reiki such as Holy Fire®.",
        scores: { reikiRising: 3, embodiedHealer: 3, guidance: 0 },
      },
      {
        label: "I have already learned Reiki and want extra support",
        description:
          "I want guidance, perspective or mentorship without beginning another training program.",
        scores: { reikiRising: 0, embodiedHealer: 0, guidance: 4 },
      },
    ],
  },
  {
    question: "How do you most want to feel after receiving this training or support?",
    options: [
      {
        label: "Grounded and connected",
        description:
          "I want to feel more present, centered and connected to myself.",
        scores: { reikiRising: 0, embodiedHealer: 0, guidance: 0 },
        resultReflection:
          "You shared that you want to feel grounded and connected. Keep that desire close as you explore this path. It can be a compass for the support you choose.",
      },
      {
        label: "Confident and capable",
        description:
          "I want to trust what I know and feel comfortable putting it into practice.",
        scores: { reikiRising: 0, embodiedHealer: 0, guidance: 0 },
        resultReflection:
          "You shared that you want to feel confident and capable. This path can help you build greater trust in what you know and how you carry it forward.",
      },
      {
        label: "Clear and aligned",
        description:
          "I want to understand my next step and feel peaceful about moving forward.",
        scores: { reikiRising: 0, embodiedHealer: 0, guidance: 0 },
        resultReflection:
          "You shared that you want to feel clear and aligned. Let this recommendation offer a grounded next step while you continue listening to what feels true for you.",
      },
      {
        label: "Supported and encouraged",
        description:
          "I want to feel held in my growth rather than figuring everything out alone.",
        scores: { reikiRising: 0, embodiedHealer: 0, guidance: 0 },
        resultReflection:
          "You shared that you want to feel supported and encouraged. You do not have to navigate your growth alone and this path offers a place to begin receiving support.",
      },
      {
        label: "All of the above",
        description:
          "I want to feel grounded, confident, clear and supported as I move forward.",
        scores: { reikiRising: 0, embodiedHealer: 0, guidance: 0 },
        resultReflection:
          "You shared that you want to feel grounded, confident, clear and supported. Keep these feelings close as you explore this path and consider what will best nurture your growth.",
      },
    ],
  },
];

const pathOrder: PathKey[] = ["reikiRising", "embodiedHealer", "guidance"];

export function TrainingPathQuiz() {
  const quizRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null),
  );
  const [complete, setComplete] = useState(false);

  const selectedOption = answers[step];
  const progress = complete ? 100 : ((step + 1) / questions.length) * 100;
  const closingAnswer = answers[questions.length - 1];
  const closingReflection =
    closingAnswer === null
      ? null
      : questions[questions.length - 1].options[closingAnswer].resultReflection;

  useEffect(() => {
    if (!started) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    quizRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [started, step, complete]);

  const resultState = useMemo(() => {
    const totals: Record<PathKey, number> = {
      reikiRising: 0,
      embodiedHealer: 0,
      guidance: 0,
    };

    answers.forEach((answer, questionIndex) => {
      if (answer === null) return;
      const option = questions[questionIndex].options[answer];
      pathOrder.forEach((path) => {
        totals[path] += option.scores[path];
      });
    });

    const readinessAnswer = answers[questions.length - 2];
    const wantsPostTrainingMentorship = readinessAnswer === 4;
    const eligiblePaths = wantsPostTrainingMentorship
      ? pathOrder
      : pathOrder.filter((path) => path !== "guidance");

    const resultKey = eligiblePaths.reduce((best, path) =>
      totals[path] > totals[best] ? path : best,
    );

    const isCloseTrainingMatch =
      readinessAnswer === 2 &&
      Math.abs(totals.reikiRising - totals.embodiedHealer) <= 3;

    return { resultKey, isCloseTrainingMatch };
  }, [answers]);

  function chooseAnswer(optionIndex: number) {
    setAnswers((current) => {
      const next = [...current];
      next[step] = optionIndex;
      return next;
    });
  }

  function continueQuiz() {
    if (selectedOption === null) return;
    if (step === questions.length - 1) {
      setComplete(true);
      return;
    }
    setStep((current) => current + 1);
  }

  function goBack() {
    if (complete) {
      setComplete(false);
      return;
    }
    if (step > 0) setStep((current) => current - 1);
  }

  function restart() {
    setStarted(false);
    setStep(0);
    setAnswers(Array(questions.length).fill(null));
    setComplete(false);
  }

  if (!started) {
    return (
      <section
        ref={quizRef}
        aria-labelledby="training-path-quiz-title"
        className="relative scroll-mt-36 overflow-hidden rounded-[32px] border border-[rgba(115,82,67,0.18)] bg-[#ead8cc] px-6 py-10 shadow-[0_28px_85px_rgba(89,59,45,0.14)] sm:px-10 sm:py-12 lg:px-14"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[rgba(255,247,239,0.5)] blur-3xl" />
        <div className="relative max-w-[46rem]">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Find Your Path
          </span>
          <h2 id="training-path-quiz-title" className="display-section-title max-w-[19ch]">
            Not sure which Reiki course or support is right for you?
          </h2>
          <p className="mt-5 max-w-[39rem] text-[1.03rem] leading-[1.75] text-[var(--color-muted)]">
            Take this short quiz to discover which path best supports where you
            are right now: Reiki Rising, The Embodied Healer, or Personalized
            Guidance.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button type="button" className="button-pill" onClick={() => setStarted(true)}>
              Take the 2-Minute Quiz
              <span aria-hidden="true" className="ml-2">→</span>
            </button>
            <span className="text-sm text-[var(--color-muted)]">
              No email required
            </span>
          </div>
        </div>
      </section>
    );
  }

  const result = resultState.isCloseTrainingMatch
    ? closeTrainingResult
    : paths[resultState.resultKey];
  const question = questions[step];

  return (
    <section
      ref={quizRef}
      aria-labelledby="training-path-quiz-title"
      className="scroll-mt-36 overflow-hidden rounded-[32px] border border-[rgba(115,82,67,0.18)] bg-[#ead8cc] shadow-[0_28px_85px_rgba(89,59,45,0.14)]"
    >
      <div className="h-1.5 bg-[rgba(76,58,48,0.08)]">
        <div
          className="h-full bg-[#8b6f60] transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
        {complete ? (
          <div aria-live="polite" className="grid gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {result.eyebrow}
              </span>
              <h2 id="training-path-quiz-title" className="display-section-title">
                {result.title}
              </h2>
              <p className="mt-5 text-[1.05rem] leading-[1.75] text-[var(--color-muted)]">
                {result.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={result.href} className="button-pill">
                  {result.cta}
                  <span aria-hidden="true" className="ml-2">→</span>
                </Link>
                {result.secondaryCta && result.secondaryHref ? (
                  <Link href={result.secondaryHref} className="button-pill">
                    {result.secondaryCta}
                    <span aria-hidden="true" className="ml-2">→</span>
                  </Link>
                ) : null}
                {result.tertiaryCta && result.tertiaryHref ? (
                  <Link href={result.tertiaryHref} className="button-pill">
                    {result.tertiaryCta}
                    <span aria-hidden="true" className="ml-2">→</span>
                  </Link>
                ) : null}
                <button type="button" onClick={restart} className="button-pill">
                  Retake the Quiz
                </button>
              </div>
            </div>

            <div className="rounded-[26px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,255,255,0.48)] p-6 sm:p-8">
              <h3 className="font-display text-[1.65rem] leading-tight">
                Why this path may fit you
              </h3>
              <ul className="mt-5 grid gap-4 text-[var(--color-muted)]">
                {result.reasons.map((reason) => (
                  <li key={reason} className="flex gap-3 leading-[1.65]">
                    <span aria-hidden="true" className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#8b6f60]" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
              {closingReflection ? (
                <p className="mt-6 rounded-[20px] bg-[rgba(235,218,205,0.42)] p-5 leading-[1.7] text-[var(--color-muted)]">
                  {closingReflection}
                </p>
              ) : null}
              <p className="mt-6 border-t border-[rgba(76,58,48,0.1)] pt-5 text-sm leading-[1.65] text-[var(--color-muted)]">
                This recommendation is here to offer clarity and support. Take
                time to explore the suggested path or paths and notice what
                feels most aligned for you.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-end">
              <span className="text-sm tabular-nums text-[var(--color-muted)]">
                {step + 1} of {questions.length}
              </span>
            </div>
            <h2 id="training-path-quiz-title" className="mt-4 max-w-[25ch] font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1.03] font-light">
              {question.question}
            </h2>

            <div role="radiogroup" aria-label={question.question} className="mt-8 grid gap-3">
              {question.options.map((option, optionIndex) => {
                const selected = selectedOption === optionIndex;
                return (
                  <button
                    key={option.label}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => chooseAnswer(optionIndex)}
                    className={`group flex min-h-24 w-full items-start gap-4 rounded-[22px] border p-5 text-left transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f574b] motion-reduce:transition-none sm:p-6 ${
                      selected
                        ? "border-[#8b6f60] bg-[rgba(235,218,205,0.55)] shadow-[0_10px_30px_rgba(59,41,31,0.07)]"
                        : "border-[rgba(76,58,48,0.1)] bg-[rgba(255,255,255,0.4)] hover:border-[rgba(76,58,48,0.28)] hover:bg-[rgba(255,255,255,0.66)]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        selected ? "border-[#72594c] bg-[#72594c]" : "border-[rgba(76,58,48,0.3)]"
                      }`}
                    >
                      {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                    </span>
                    <span>
                      <strong className="block text-[1.02rem] font-bold text-[var(--color-text)]">
                        {option.label}
                      </strong>
                      <span className="mt-1.5 block leading-[1.6] text-[var(--color-muted)]">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0}
                className="min-h-11 rounded-full px-3 font-semibold text-[var(--color-muted)] transition hover:text-[var(--color-text)] disabled:invisible"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={continueQuiz}
                disabled={selectedOption === null}
                className="button-pill"
              >
                {step === questions.length - 1 ? "See My Path" : "Continue"}
                <span aria-hidden="true" className="ml-2">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


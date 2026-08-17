"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  reikiQuizClosingReflections,
  reikiQuizResults,
  type ReikiQuizResultKey,
  type ScoredReikiPathKey,
} from "@/lib/reiki-quiz-results";

type PathKey = ScoredReikiPathKey;

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
        resultReflection: reikiQuizClosingReflections[0],
      },
      {
        label: "Confident and capable",
        description:
          "I want to trust what I know and feel comfortable putting it into practice.",
        scores: { reikiRising: 0, embodiedHealer: 0, guidance: 0 },
        resultReflection: reikiQuizClosingReflections[1],
      },
      {
        label: "Clear and aligned",
        description:
          "I want to understand my next step and feel peaceful about moving forward.",
        scores: { reikiRising: 0, embodiedHealer: 0, guidance: 0 },
        resultReflection: reikiQuizClosingReflections[2],
      },
      {
        label: "Supported and encouraged",
        description:
          "I want to feel held in my growth rather than figuring everything out alone.",
        scores: { reikiRising: 0, embodiedHealer: 0, guidance: 0 },
        resultReflection: reikiQuizClosingReflections[3],
      },
      {
        label: "All of the above",
        description:
          "I want to feel grounded, confident, clear and supported as I move forward.",
        scores: { reikiRising: 0, embodiedHealer: 0, guidance: 0 },
        resultReflection: reikiQuizClosingReflections[4],
      },
    ],
  },
];

const pathOrder: PathKey[] = ["reikiRising", "embodiedHealer", "guidance"];

declare global {
  interface Window {
    turnstile?: {
      reset: () => void;
    };
  }
}

type TrainingPathQuizProps = {
  turnstileSiteKey?: string;
};

type DeliveryState = {
  status: "idle" | "submitting" | "success" | "error";
  message: string;
};

export function TrainingPathQuiz({ turnstileSiteKey }: TrainingPathQuizProps) {
  const quizRef = useRef<HTMLElement>(null);
  const [quizStartedAt, setQuizStartedAt] = useState(() => Date.now());
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null),
  );
  const [complete, setComplete] = useState(false);
  const [deliveryState, setDeliveryState] = useState<DeliveryState>({
    status: "idle",
    message: "",
  });

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
    setQuizStartedAt(Date.now());
    setStarted(false);
    setStep(0);
    setAnswers(Array(questions.length).fill(null));
    setComplete(false);
    setDeliveryState({ status: "idle", message: "" });
  }

  async function sendResult(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeliveryState({ status: "submitting", message: "" });

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/quiz-result", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        window.turnstile?.reset();
        setDeliveryState({
          status: "error",
          message:
            payload.message ||
            "Your result could not be sent right now. Please try again.",
        });
        return;
      }

      setDeliveryState({
        status: "success",
        message:
          payload.message ||
          "Your result is on its way. Please check your inbox.",
      });
      form.reset();
    } catch {
      window.turnstile?.reset();
      setDeliveryState({
        status: "error",
        message: "Your result could not be sent right now. Please try again.",
      });
    }
  }

  if (!started) {
    return (
      <section
        ref={quizRef}
        aria-labelledby="training-path-quiz-title"
        className="relative scroll-mt-36 overflow-hidden rounded-[32px] border border-[rgba(115,82,67,0.18)] bg-[#ead8cc] px-6 py-10 shadow-[0_28px_85px_rgba(89,59,45,0.14)] sm:px-10 sm:py-12 lg:px-14"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[rgba(255,247,239,0.5)] blur-3xl" />
        <div className="relative mx-auto max-w-[50rem] text-center">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Find Your Path
          </span>
          <h2 id="training-path-quiz-title" className="mx-auto max-w-[30ch] display-section-title">
            Not sure which Reiki course or support is right for you?
          </h2>
          <p className="mx-auto mt-5 max-w-[42rem] text-[1.03rem] leading-[1.75] text-[var(--color-muted)]">
            Take this short quiz to discover which path best supports where you
            are right now: Reiki Rising, The Embodied Healer, or Personalized
            Guidance.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
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

  const resultKey: ReikiQuizResultKey = resultState.isCloseTrainingMatch
    ? "trainingMatch"
    : resultState.resultKey;
  const result = reikiQuizResults[resultKey];
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
          <div aria-live="polite">
            <div className="grid gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
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

            <div className="mt-9 rounded-[26px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,250,245,0.7)] p-6 sm:p-8">
              {deliveryState.status === "success" ? (
                <div role="status">
                  <span className="mb-3 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    Saved for Later
                  </span>
                  <h3 className="font-display text-[1.75rem] leading-tight">
                    Your result is on its way.
                  </h3>
                  <p className="mt-3 max-w-[42rem] leading-[1.7] text-[var(--color-muted)]">
                    {deliveryState.message}
                  </p>
                </div>
              ) : (
                <div className="grid gap-7 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
                  <div>
                    <span className="mb-3 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Completely Optional
                    </span>
                    <h3 className="font-display text-[1.75rem] leading-tight">
                      Would you like to keep your result?
                    </h3>
                    <p className="mt-3 leading-[1.7] text-[var(--color-muted)]">
                      Your full result is already here. If you would like a copy
                      for later, I can send it to your inbox.
                    </p>
                  </div>

                  <form onSubmit={sendResult} className="grid gap-4">
                    <input type="hidden" name="resultKey" value={resultKey} />
                    <input
                      type="hidden"
                      name="reflectionIndex"
                      value={closingAnswer ?? ""}
                    />
                    <input type="hidden" name="startedAt" value={quizStartedAt} />
                    <label
                      aria-hidden="true"
                      className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
                    >
                      Website
                      <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-bold text-[var(--color-text)]">
                        First name
                        <input
                          type="text"
                          name="firstName"
                          required
                          autoComplete="given-name"
                          maxLength={80}
                          className="min-h-12 rounded-[16px] border border-[rgba(76,58,48,0.16)] bg-[rgba(255,255,255,0.72)] px-4 font-normal outline-none transition focus:border-[#8b6f60] focus:ring-2 focus:ring-[rgba(139,111,96,0.18)]"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-bold text-[var(--color-text)]">
                        Email address
                        <input
                          type="email"
                          name="email"
                          required
                          autoComplete="email"
                          maxLength={254}
                          className="min-h-12 rounded-[16px] border border-[rgba(76,58,48,0.16)] bg-[rgba(255,255,255,0.72)] px-4 font-normal outline-none transition focus:border-[#8b6f60] focus:ring-2 focus:ring-[rgba(139,111,96,0.18)]"
                        />
                      </label>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-[18px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,255,255,0.42)] p-4 text-sm leading-[1.6] text-[var(--color-muted)]">
                      <input
                        type="checkbox"
                        name="reikiUpdates"
                        value="yes"
                        className="mt-1 h-4 w-4 shrink-0 accent-[#72594c]"
                      />
                      <span>
                        Yes, I would also like occasional Reiki course and
                        support updates from Kate. I can unsubscribe at any
                        time.
                      </span>
                    </label>

                    {turnstileSiteKey ? (
                      <>
                        <Script
                          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                          async
                          defer
                          strategy="afterInteractive"
                        />
                        <div className="overflow-hidden rounded-[18px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.72)] p-3">
                          <div
                            className="cf-turnstile"
                            data-sitekey={turnstileSiteKey}
                            data-action="quiz_result"
                            data-theme="light"
                          />
                        </div>
                      </>
                    ) : null}

                    {deliveryState.status === "error" ? (
                      <p role="alert" className="text-sm font-semibold text-[#7f3f36]">
                        {deliveryState.message}
                      </p>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-4">
                      <button
                        type="submit"
                        disabled={deliveryState.status === "submitting"}
                        className="button-pill disabled:cursor-wait disabled:opacity-65"
                      >
                        {deliveryState.status === "submitting"
                          ? "Sending..."
                          : "Send My Result"}
                      </button>
                      <span className="text-sm text-[var(--color-muted)]">
                        No signup required
                      </span>
                    </div>
                  </form>
                </div>
              )}
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

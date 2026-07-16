"use client";

import { useNavigate } from "@/app/TransitionProvider";

// Autism-perception research content. A self-contained, mobile-first single
// scrollable column (no chat/API) — inspired by the main AURA research page's
// dark cinematic aesthetic, adapted for aura-explore.

const ACCENT = ["#FFC99D", "#FFC1BB", "#BCC2FF"];

type Topic = {
  label: string;
  finding: string;
  findingText: string;
  description: string;
  quote: string;
};

const TOPICS: Topic[] = [
  {
    label: "Sensory Processing",
    finding: "90%",
    findingText: "of autistic individuals experience atypical sensory perception across every modality.",
    description:
      "Sensory information often arrives more intensely — or all at once. What a neurotypical brain filters out automatically stays present and demanding. Ordinary places like supermarkets or classrooms can become genuinely painful.",
    quote: "It's not that we notice more things. It's that everything arrives at once.",
  },
  {
    label: "Social Interaction",
    finding: "The Double Empathy Problem",
    findingText: "understanding breaks down in BOTH directions — it is mutual, not a one-sided deficit.",
    description:
      "Autistic social experience means navigating a world built around neurotypical norms. Milton's Double Empathy Problem reframes miscommunication as a genuine two-way mismatch rather than an autistic failing.",
    quote: "I understand the words but not the music underneath them.",
  },
  {
    label: "Overload & Meltdowns",
    finding: "~100%",
    findingText: "of meltdowns are preceded by a detectable buildup of sensory or social overload.",
    description:
      "Meltdowns and shutdowns are neurological responses to overwhelm — not behavioral choices. Once cumulative load exceeds threshold, the nervous system goes into crisis and needs recovery time and safety.",
    quote: "A meltdown isn't a tantrum. It's a nervous system saying it has nothing left.",
  },
  {
    label: "Masking & Camouflaging",
    finding: "Linked to burnout",
    findingText: "chronic masking is tied to exhaustion, depression, and delayed diagnosis.",
    description:
      "Masking is the effortful performance of neurotypical behavior — suppressing stimming, forcing eye contact, scripting conversation. It hides autistic traits at great cost to wellbeing and identity.",
    quote: "I spent so long performing 'normal' that I forgot what I actually was.",
  },
  {
    label: "Autistic Strengths",
    finding: "Enhanced Perception",
    findingText: "detail-focused processing and pattern recognition are genuine cognitive advantages.",
    description:
      "Mottron's Enhanced Perceptual Functioning model shows autistic cognition brings real strengths: deep focus, superior pattern recognition, and structured expertise built through sustained perceptual engagement.",
    quote: "My brain doesn't miss details. It collects them until they form something no one else sees.",
  },
];

export default function ResearchPage() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-black text-white">
      {/* Radial vignette */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      {/* Single scrollable column */}
      <div className="mx-auto flex w-full max-w-2xl flex-col px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
        {/* Header */}
        <header className="mb-12 text-center">
          <img
            src="/icons/New_logo_eye.svg"
            alt=""
            className="mx-auto mb-6 w-12 opacity-80 sm:w-14"
          />
          <h1
            className="mb-4 font-serif text-4xl font-normal leading-[1.05] text-white sm:text-6xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Understanding<br />Autistic Perception
          </h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-white/50 sm:text-base">
            Every perception tells a different story. These findings — drawn from
            research and lived experience — trace what it can mean to experience the
            world through an autistic lens.
          </p>
        </header>

        {/* Topics */}
        <div className="flex flex-col gap-6">
          {TOPICS.map((t, i) => {
            const accent = ACCENT[i % ACCENT.length];
            return (
              <section
                key={t.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
              >
                <h2
                  className="mb-4 font-serif text-2xl italic sm:text-3xl"
                  style={{ fontFamily: "var(--font-heading)", color: accent }}
                >
                  {t.label}
                </h2>

                {/* Key finding */}
                <div className="mb-5">
                  <span
                    className="font-serif text-3xl leading-none sm:text-4xl"
                    style={{ fontFamily: "var(--font-heading)", color: accent }}
                  >
                    {t.finding}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    {t.findingText}
                  </p>
                </div>

                <p className="mb-5 text-[15px] leading-relaxed text-white/75">
                  {t.description}
                </p>

                {/* Participant quote */}
                <blockquote
                  className="border-l-2 pl-4 text-[15px] italic leading-relaxed text-white/60"
                  style={{ borderColor: accent, fontFamily: "var(--font-heading)" }}
                >
                  “{t.quote}”
                </blockquote>
              </section>
            );
          })}
        </div>

        {/* Back to Start */}
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.boxShadow = "0 0 16px rgba(255,201,157,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.8";
              e.currentTarget.style.boxShadow = "none";
            }}
            style={{
              background: "#FFC99D",
              color: "#1a0f00",
              border: "none",
              borderRadius: 12,
              padding: "14px 40px",
              fontSize: 14,
              letterSpacing: "0.06em",
              fontWeight: 600,
              cursor: "pointer",
              opacity: 0.8,
              transition: "all 0.2s ease",
              fontFamily: "var(--font-body)",
            }}
          >
            ← Back to Start
          </button>
        </div>
      </div>
    </main>
  );
}

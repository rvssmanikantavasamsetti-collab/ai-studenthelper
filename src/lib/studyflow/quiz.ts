import type { QuizQuestion } from "./types";

interface Seed {
  q: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

const BANKS: Record<string, Seed[]> = {
  thermodynamics: [
    {
      q: "The first law of thermodynamics is a statement of",
      options: ["Conservation of energy", "Entropy increase", "Momentum conservation", "Heat death"],
      answerIndex: 0,
      explanation: "ΔU = Q − W expresses conservation of energy for a closed system.",
    },
    {
      q: "In an isothermal process for an ideal gas,",
      options: ["ΔU = 0", "Q = 0", "W = 0", "ΔS = 0"],
      answerIndex: 0,
      explanation: "Internal energy depends only on temperature, so constant T means ΔU = 0.",
    },
    {
      q: "Entropy of an isolated system during a spontaneous process",
      options: ["Increases", "Decreases", "Stays constant", "Becomes zero"],
      answerIndex: 0,
      explanation: "The second law requires ΔS ≥ 0 for isolated systems.",
    },
  ],
  physics: [
    {
      q: "A 40 N force acts on an 8 kg mass. The acceleration is",
      options: ["5 m/s²", "0.2 m/s²", "320 m/s²", "48 m/s²"],
      answerIndex: 0,
      explanation: "a = F/m = 40/8 = 5 m/s².",
    },
    {
      q: "Newton's third law states that forces",
      options: ["Come in equal and opposite pairs", "Always cancel motion", "Depend on mass only", "Are always attractive"],
      answerIndex: 0,
      explanation: "Every action has an equal and opposite reaction on a different body.",
    },
  ],
  calculus: [
    {
      q: "The derivative of sin(x) is",
      options: ["cos(x)", "−cos(x)", "sin(x)", "−sin(x)"],
      answerIndex: 0,
      explanation: "d/dx sin(x) = cos(x).",
    },
    {
      q: "∫ 2x dx equals",
      options: ["x² + C", "2 + C", "x + C", "2x² + C"],
      answerIndex: 0,
      explanation: "Reverse the power rule: ∫2x dx = x² + C.",
    },
    {
      q: "A function is continuous at a point if",
      options: [
        "The limit exists and equals the function value",
        "The derivative exists",
        "It is increasing",
        "It is bounded",
      ],
      answerIndex: 0,
      explanation: "Continuity requires lim(x→a) f(x) = f(a).",
    },
  ],
  biology: [
    {
      q: "Photosynthesis mainly occurs in the",
      options: ["Chloroplast", "Mitochondrion", "Nucleus", "Ribosome"],
      answerIndex: 0,
      explanation: "Chloroplasts hold chlorophyll and carry out the light reactions.",
    },
    {
      q: "DNA replication is described as",
      options: ["Semi-conservative", "Conservative", "Dispersive", "Random"],
      answerIndex: 0,
      explanation: "Each new double helix keeps one parental strand.",
    },
  ],
};

function genericSeeds(topic: string): Seed[] {
  const t = topic.trim() || "this topic";
  return [
    {
      q: `Which statement best defines the core idea of ${t}?`,
      options: [
        `The central principle that organises how ${t} behaves`,
        `An unrelated historical footnote about ${t}`,
        `A purely decorative term with no definition`,
        `A rule that only applies outside ${t}`,
      ],
      answerIndex: 0,
      explanation: `Start every topic by naming its governing principle — for ${t}, that definition anchors every later problem.`,
    },
    {
      q: `When solving a problem in ${t}, what should you identify first?`,
      options: [
        "The known quantities and what is being asked",
        "The final numeric answer",
        "The longest possible formula",
        "A random worked example",
      ],
      answerIndex: 0,
      explanation: "Listing knowns and unknowns turns a wordy problem into a solvable equation.",
    },
    {
      q: `A common misconception about ${t} is that`,
      options: [
        "Memorising results replaces understanding the reasoning",
        "Practice problems help retention",
        "Definitions matter",
        "Units and assumptions matter",
      ],
      answerIndex: 0,
      explanation: "Memorisation fails on unfamiliar variations; reasoning transfers.",
    },
    {
      q: `Which study strategy gives the strongest retention for ${t}?`,
      options: [
        "Spaced retrieval practice",
        "Re-reading notes once",
        "Highlighting the textbook",
        "Watching a video passively",
      ],
      answerIndex: 0,
      explanation: "Active recall spread over days beats passive review in every major study.",
    },
    {
      q: `How can you check whether an answer in ${t} is reasonable?`,
      options: [
        "Verify units, magnitude and limiting cases",
        "Trust the first result",
        "Compare with an unrelated topic",
        "Round until it looks clean",
      ],
      answerIndex: 0,
      explanation: "Sanity checks on units and extremes catch most algebra slips.",
    },
    {
      q: `Which of these is the best next step after finishing a ${t} practice set?`,
      options: [
        "Review every mistake and redo it unaided",
        "Move on immediately",
        "Only check the score",
        "Delete the worksheet",
      ],
      answerIndex: 0,
      explanation: "Error review is where the learning actually happens.",
    },
  ];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateQuiz(topic: string, count: number): QuizQuestion[] {
  const key = topic.trim().toLowerCase();
  const matched = Object.keys(BANKS).find((k) => key.includes(k) || k.includes(key));
  const seeds = [...(matched ? BANKS[matched] : []), ...genericSeeds(topic)];

  return shuffle(seeds)
    .slice(0, Math.max(1, Math.min(count, seeds.length)))
    .map((seed, i) => {
      const correct = seed.options[seed.answerIndex];
      const options = shuffle(seed.options);
      return {
        id: `q-${i}-${Math.random().toString(36).slice(2, 8)}`,
        question: seed.q,
        options,
        answerIndex: options.indexOf(correct),
        explanation: seed.explanation,
      };
    });
}

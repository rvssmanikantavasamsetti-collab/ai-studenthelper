import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Shell } from "@/components/studyflow/Shell";
import { generateQuiz } from "@/lib/studyflow/quiz";
import { useStudyFlow } from "@/lib/studyflow/store";
import type { QuizQuestion } from "@/lib/studyflow/types";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "AI Quiz Generator — StudyFlow AI" },
      {
        name: "description",
        content:
          "Enter any topic and number of questions to get instant MCQ practice with answers, explanations and a score.",
      },
      { property: "og:title", content: "AI Quiz Generator — StudyFlow AI" },
      {
        property: "og:description",
        content: "Instant multiple-choice practice with explanations and scoring for any study topic.",
      },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const { attempts, addAttempt } = useStudyFlow();
  const [topic, setTopic] = useState("Thermodynamics");
  const [count, setCount] = useState("5");
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const score = questions
    ? questions.filter((q) => answers[q.id] === q.answerIndex).length
    : 0;

  const generate = () => {
    setLoading(true);
    window.setTimeout(() => {
      setQuestions(generateQuiz(topic, Number(count) || 5));
      setAnswers({});
      setSubmitted(false);
      setLoading(false);
    }, 500);
  };

  const submit = () => {
    if (!questions) return;
    setSubmitted(true);
    addAttempt({
      id: `a-${Date.now()}`,
      topic: topic.trim() || "Untitled topic",
      score: questions.filter((q) => answers[q.id] === q.answerIndex).length,
      total: questions.length,
      takenAt: new Date().toISOString(),
    });
  };

  return (
    <Shell>
      <div className="mt-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">AI Quiz Generator</h1>
        <p className="mt-1 text-muted-foreground">
          Pick a topic, choose how many questions, and practise with instant explanations.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <label className="block">
            <span className="text-xs text-muted-foreground">Topic</span>
            <input
              className="field mt-1"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Thermodynamics"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-xs text-muted-foreground">Number of questions</span>
            <select className="field mt-1" value={count} onChange={(e) => setCount(e.target.value)}>
              <option value="3">3 questions</option>
              <option value="5">5 questions</option>
              <option value="8">8 questions</option>
              <option value="10">10 questions</option>
            </select>
          </label>
          <button
            onClick={generate}
            disabled={loading}
            className="gradient-brand mt-5 w-full rounded-xl py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-brand/30 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Writing questions…" : "Generate quiz"}
          </button>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent attempts
            </p>
            <div className="mt-2 space-y-2">
              {attempts.slice(0, 5).map((a) => (
                <div key={a.id} className="glass-soft flex items-center justify-between rounded-xl p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.topic}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(a.takenAt).toLocaleString(undefined, {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-success/15 px-2 py-1 text-[10px] font-semibold text-success">
                    {a.score}/{a.total}
                  </span>
                </div>
              ))}
              {attempts.length === 0 && (
                <p className="text-xs text-muted-foreground">No attempts yet.</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          {!questions && (
            <p className="text-sm text-muted-foreground">
              Your generated questions will appear here. Answer them all, then submit to see your score and
              the explanation for every question.
            </p>
          )}

          {questions && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold">{topic || "Practice quiz"}</h2>
                {submitted ? (
                  <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                    Score {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {Object.keys(answers).length}/{questions.length} answered
                  </span>
                )}
              </div>

              <div className="mt-5 space-y-4">
                {questions.map((q, qi) => (
                  <div key={q.id} className="glass-soft rounded-2xl p-4">
                    <p className="text-sm font-semibold">
                      Q{qi + 1}. {q.question}
                    </p>
                    <div className="mt-3 space-y-2">
                      {q.options.map((opt, oi) => {
                        const picked = answers[q.id] === oi;
                        const correct = q.answerIndex === oi;
                        const state = submitted
                          ? correct
                            ? "border-success/40 bg-success/10 text-success"
                            : picked
                              ? "border-danger/40 bg-danger/10 text-danger"
                              : "border-border text-muted-foreground"
                          : picked
                            ? "border-brand/60 bg-brand/15 text-foreground"
                            : "border-border text-muted-foreground hover:text-foreground";
                        return (
                          <button
                            key={oi}
                            disabled={submitted}
                            onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                            className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${state}`}
                          >
                            {String.fromCharCode(65 + oi)}. {opt}
                          </button>
                        );
                      })}
                    </div>
                    {submitted && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        <span className="font-semibold text-accent">Answer:</span>{" "}
                        {q.options[q.answerIndex]} — {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {!submitted ? (
                  <button
                    onClick={submit}
                    disabled={Object.keys(answers).length < questions.length}
                    className="gradient-brand rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-brand/30 transition hover:brightness-110 disabled:opacity-50"
                  >
                    Submit answers
                  </button>
                ) : (
                  <button
                    onClick={generate}
                    className="gradient-brand rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-brand/30 transition hover:brightness-110"
                  >
                    New quiz on this topic
                  </button>
                )}
                <button
                  onClick={() => {
                    setAnswers({});
                    setSubmitted(false);
                  }}
                  className="glass-soft rounded-xl px-5 py-2.5 text-sm text-muted-foreground transition hover:text-foreground"
                >
                  Reset answers
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </Shell>
  );
}

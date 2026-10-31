"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

function formatVisitTime(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatChange(current, previous) {
  const difference = current - previous;

  if (difference === 0) return "No change";
  return `${difference > 0 ? "+" : ""}${difference}`;
}

export default function VisitHistory({
  visits,
  currentVisit,
  previousVisit,
  status,
  error,
  onClear,
}) {
  const chronologicalVisits = [...visits].reverse();
  const chartData = {
    labels: chronologicalVisits.map((visit) => formatVisitTime(visit.checkedAt)),
    datasets: [
      {
        label: "Privacy score",
        data: chronologicalVisits.map((visit) => visit.score),
        yAxisID: "score",
        borderColor: "#818cf8",
        backgroundColor: "rgba(129, 140, 248, 0.18)",
        pointBackgroundColor: "#a5b4fc",
        tension: 0.25,
      },
      {
        label: "Available metadata signals",
        data: chronologicalVisits.map((visit) => visit.networkSignals + visit.browserSignals),
        yAxisID: "signals",
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34, 211, 238, 0.16)",
        pointBackgroundColor: "#67e8f9",
        tension: 0.25,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        labels: { color: "#cbd5e1", usePointStyle: true, boxWidth: 8 },
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8", maxRotation: 0, autoSkip: true },
        grid: { color: "rgba(148, 163, 184, 0.1)" },
      },
      score: {
        type: "linear",
        position: "left",
        min: 0,
        max: 100,
        ticks: { color: "#a5b4fc" },
        title: { display: true, text: "Score", color: "#a5b4fc" },
        grid: { color: "rgba(148, 163, 184, 0.1)" },
      },
      signals: {
        type: "linear",
        position: "right",
        min: 0,
        max: 16,
        ticks: { color: "#67e8f9", stepSize: 4 },
        title: { display: true, text: "Signals", color: "#67e8f9" },
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <section
      aria-labelledby="visit-history-heading"
      className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="visit-history-heading" className="text-sm font-semibold text-white">
            Recent checks
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            The last five checks are saved only in this browser. Only the time, score, and signal counts are stored.
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            A higher score or signal count means more fields were available to this page; it does not prove tracking occurred.
          </p>
        </div>
        {(visits.length > 0 || status === "error") && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-xs font-medium text-slate-400 underline decoration-slate-600 underline-offset-4 hover:text-white"
          >
            Clear history
          </button>
        )}
      </div>

      {status === "loading" && (
        <p className="mt-4 text-sm text-slate-400">Loading saved checks...</p>
      )}

      {status === "error" && (
        <p role="status" className="mt-4 text-sm text-amber-200">
          {error}
        </p>
      )}

      {status === "ready" && visits.length === 0 && (
        <p className="mt-4 text-sm text-slate-400">
          No saved checks yet. Your first completed check will appear here.
        </p>
      )}

      {status === "ready" && visits.length > 0 && (
        <>
          {currentVisit && previousVisit ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <HistoryMetric
                label="Last visit"
                value={formatVisitTime(previousVisit.checkedAt)}
              />
              <HistoryMetric
                label="Score change"
                value={`${formatChange(currentVisit.score, previousVisit.score)} points`}
              />
              <HistoryMetric
                label="Signal count change"
                value={`${formatChange(
                  currentVisit.networkSignals + currentVisit.browserSignals,
                  previousVisit.networkSignals + previousVisit.browserSignals,
                )} signals`}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-300">
              {currentVisit
                ? "This is your first saved check. Return later to compare changes."
                : "A check is saved after the current network lookup completes."}
            </p>
          )}

          <div className="relative mt-5 h-64">
            <Line
              data={chartData}
              options={chartOptions}
              role="img"
              aria-label="Trend chart of privacy score and available metadata signal counts across recent visits."
            />
          </div>
          {visits.length === 1 && (
            <p className="mt-2 text-xs text-slate-400">
              A trend will appear after another completed check.
            </p>
          )}

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-xs">
              <caption className="sr-only">Recent saved privacy checks</caption>
              <thead className="text-slate-400">
                <tr>
                  <th scope="col" className="pb-2 pr-4 font-medium">Checked</th>
                  <th scope="col" className="pb-2 pr-4 font-medium">Score</th>
                  <th scope="col" className="pb-2 pr-4 font-medium">Network signals</th>
                  <th scope="col" className="pb-2 font-medium">Browser signals</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.checkedAt} className="border-t border-slate-800 text-slate-200">
                    <td className="py-2 pr-4">{formatVisitTime(visit.checkedAt)}</td>
                    <td className="py-2 pr-4">{visit.score} / 100</td>
                    <td className="py-2 pr-4">{visit.networkSignals} / 6</td>
                    <td className="py-2">{visit.browserSignals} / 10</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function HistoryMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

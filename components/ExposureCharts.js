"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#cbd5e1",
        usePointStyle: true,
        boxWidth: 8,
      },
    },
    tooltip: {
      callbacks: {
        label: (context) => ` ${context.dataset.label}: ${context.raw}`,
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      min: 0,
      ticks: { color: "#94a3b8", precision: 0 },
      grid: { color: "rgba(148, 163, 184, 0.12)" },
    },
    y: {
      stacked: true,
      ticks: { color: "#cbd5e1" },
      grid: { display: false },
    },
  },
};

function getExposureLevel(score) {
  const normalizedScore = score * 4;

  if (normalizedScore < 40) return "Low";
  if (normalizedScore < 70) return "Moderate";
  return "High";
}

export default function ExposureCharts({
  exposureCategories,
  networkSignalCount,
  browserSignalCount,
}) {
  const levelCounts = {
    Low: 0,
    Moderate: 0,
    High: 0,
  };

  exposureCategories.forEach((category) => {
    levelCounts[getExposureLevel(category.score)] += 1;
  });

  const categoryScores = {
    labels: exposureCategories.map((category) => category.label),
    datasets: [
      {
        label: "Exposure points",
        data: exposureCategories.map((category) => category.score),
        backgroundColor: ["#818cf8", "#22d3ee", "#fbbf24", "#fb7185"],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const exposureLevels = {
    labels: ["Low", "Moderate", "High"],
    datasets: [
      {
        label: "Categories",
        data: [levelCounts.Low, levelCounts.Moderate, levelCounts.High],
        backgroundColor: ["#34d399", "#fbbf24", "#fb7185"],
        borderColor: "#0f172a",
        borderWidth: 3,
      },
    ],
  };

  const signalCounts = {
    labels: ["Network", "Browser"],
    datasets: [
      {
        label: "Available",
        data: [networkSignalCount, browserSignalCount],
        backgroundColor: "#818cf8",
      },
      {
        label: "Unavailable",
        data: [6 - networkSignalCount, 10 - browserSignalCount],
        backgroundColor: "#334155",
      },
    ],
  };

  return (
    <section aria-labelledby="charts-heading">
      <div className="mb-4">
        <h2 id="charts-heading" className="text-sm font-semibold text-white">
          Exposure charts
        </h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Visual summaries of the same available fields used by the dashboard.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartPanel title="Risk by category" description="Heuristic points out of 25 per category.">
          <Bar
            data={categoryScores}
            role="img"
            aria-label="Horizontal bar chart showing exposure points for each category, out of 25."
            options={{
              ...chartOptions,
              indexAxis: "y",
              scales: {
                x: {
                  ...chartOptions.scales.x,
                  max: 25,
                  title: { display: true, text: "Points (0–25)", color: "#94a3b8" },
                },
                y: chartOptions.scales.y,
              },
            }}
          />
        </ChartPanel>
        <ChartPanel title="Categories by exposure level" description="Each category is normalized to a 0–100 scale.">
          <Doughnut
            data={exposureLevels}
            role="img"
            aria-label={`Category exposure level distribution: ${levelCounts.Low} low, ${levelCounts.Moderate} moderate, ${levelCounts.High} high.`}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: "62%",
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    color: "#cbd5e1",
                    usePointStyle: true,
                    boxWidth: 8,
                  },
                },
              },
            }}
          />
        </ChartPanel>
        <ChartPanel title="Metadata signal counts" description="Available fields compared with fields unavailable from the browser or IP lookup.">
          <Bar
            data={signalCounts}
            role="img"
            aria-label={`Stacked bar chart: network ${networkSignalCount} of 6 and browser ${browserSignalCount} of 10 fields available.`}
            options={chartOptions}
          />
        </ChartPanel>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-400">
        Category levels and signal counts are illustrative summaries, not evidence of actual tracking activity or a validated risk assessment.
      </p>
    </section>
  );
}

function ChartPanel({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
      <h3 className="text-sm font-medium text-slate-200">{title}</h3>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
      <div className="relative mt-4 h-56">{children}</div>
    </div>
  );
}

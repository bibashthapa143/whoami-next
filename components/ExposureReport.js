"use client";

import { useState } from "react";

export default function ExposureReport({
  score,
  level,
  networkSignals,
  browserSignals,
  categories,
  available,
}) {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  function downloadReportFile(content, filename, contentType) {
    try {
      downloadFile(content, filename, contentType);
      setError("");
    } catch (downloadError) {
      setError(downloadError.message || `Could not download ${filename}.`);
    }
  }

  function generateReport() {
    setReport({
      generatedAt: new Date().toISOString(),
      score,
      level,
      networkSignals,
      browserSignals,
      categories: categories.map(({ label, score: categoryScore, detail }) => ({
        label,
        score: categoryScore,
        detail,
      })),
    });
    setError("");
  }

  function downloadText() {
    if (!report) return;

    const categoryLines = report.categories
      .map((category) => `- ${category.label}: ${category.score}/25 (${category.detail})`)
      .join("\n");
    const content = [
      "Privacy Snapshot",
      `Generated: ${formatReportTimestamp(report.generatedAt)}`,
      `Estimated exposure: ${report.score}/100 (${report.level})`,
      `Metadata signals: network ${report.networkSignals}/6; browser ${report.browserSignals}/10`,
      "",
      "Category breakdown",
      categoryLines,
      "",
      "This is an educational heuristic, not a validated privacy or security assessment. Signal availability does not prove tracking occurred.",
      "This report does not include raw IP addresses, precise coordinates, or browser detail values.",
    ].join("\n");

    downloadReportFile(content, "privacy-snapshot.txt", "text/plain;charset=utf-8");
  }

  function downloadHtml() {
    if (!report) return;

    const categoryRows = report.categories
      .map(
        (category) =>
          `<tr><th scope="row">${escapeHtml(category.label)}</th><td>${category.score}/25</td><td>${escapeHtml(category.detail)}</td></tr>`,
      )
      .join("");
    const content = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Privacy Snapshot</title>
  <style>
    body{font:16px/1.5 system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#172033}
    h1{margin-bottom:4px} .muted{color:#526078} .score{font-size:2rem;font-weight:700;margin:24px 0}
    table{width:100%;border-collapse:collapse;margin:24px 0} th,td{text-align:left;padding:10px;border-bottom:1px solid #d9e0ea}
    footer{margin-top:32px;padding-top:16px;border-top:1px solid #d9e0ea;color:#526078;font-size:.875rem}
  </style>
</head>
<body>
  <main>
    <h1>Privacy Snapshot</h1>
    <p class="muted">Generated ${escapeHtml(formatReportTimestamp(report.generatedAt))}</p>
    <p class="score">${report.score}/100 — ${escapeHtml(report.level)}</p>
    <p>Available metadata signals: network ${report.networkSignals}/6; browser ${report.browserSignals}/10.</p>
    <h2>Category breakdown</h2>
    <table><thead><tr><th>Category</th><th>Points</th><th>Available details</th></tr></thead><tbody>${categoryRows}</tbody></table>
    <footer>This is an educational heuristic, not a validated privacy or security assessment. Signal availability does not prove tracking occurred. This report excludes raw IP addresses, precise coordinates, and browser detail values.</footer>
  </main>
</body>
</html>`;

    downloadReportFile(content, "privacy-snapshot.html", "text/html;charset=utf-8");
  }

  function downloadCard() {
    if (!report) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas is not available in this browser.");
      }

      const background = context.createLinearGradient(0, 0, 1200, 630);
      background.addColorStop(0, "#0f172a");
      background.addColorStop(1, "#1e1b4b");
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = "#a5b4fc";
      context.font = "600 24px system-ui, sans-serif";
      context.fillText("PRIVACY SNAPSHOT", 72, 76);

      context.fillStyle = "#f8fafc";
      context.font = "700 64px system-ui, sans-serif";
      context.fillText(`${report.score} / 100`, 72, 170);

      context.fillStyle = "#cbd5e1";
      context.font = "500 28px system-ui, sans-serif";
      context.fillText(report.level, 72, 220);

      context.fillStyle = "#94a3b8";
      context.font = "22px system-ui, sans-serif";
      context.fillText(
        `Available signals: network ${report.networkSignals}/6  |  browser ${report.browserSignals}/10`,
        72,
        270,
      );

      context.fillStyle = "#f8fafc";
      context.font = "600 23px system-ui, sans-serif";
      context.fillText("Category breakdown", 72, 334);

      context.font = "21px system-ui, sans-serif";
      report.categories.forEach((category, index) => {
        const y = 382 + index * 45;
        context.fillStyle = "#cbd5e1";
        context.fillText(category.label, 72, y);
        context.textAlign = "right";
        context.fillStyle = "#f8fafc";
        context.fillText(`${category.score} / 25`, 1128, y);
        context.textAlign = "left";
      });

      context.fillStyle = "#94a3b8";
      context.font = "18px system-ui, sans-serif";
      context.fillText(`Generated ${formatReportTimestamp(report.generatedAt)}`, 72, 560);
      context.fillText("Educational estimate, not a validated risk assessment.", 72, 590);

      canvas.toBlob((blob) => {
        if (!blob) {
          setError("Could not create the summary card image in this browser.");
          return;
        }

        downloadReportFile(blob, "privacy-summary-card.png", "image/png");
      }, "image/png");
    } catch (downloadError) {
      setError(downloadError.message || "Could not create the summary card image.");
    }
  }

  return (
    <section
      aria-labelledby="report-heading"
      className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5"
    >
      <div>
        <h2 id="report-heading" className="text-sm font-semibold text-white">
          Share a report
        </h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Generate a shareable summary in your browser; no file is uploaded. Exports include scores and signal counts only—not raw IP, precise location, or browser detail values.
        </p>
      </div>

      {!report ? (
        <button
          type="button"
          onClick={generateReport}
          disabled={!available}
          className="mt-4 rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-4 py-2.5 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Generate report
        </button>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={downloadText} className={exportButtonClass}>
            Download plain text
          </button>
          <button type="button" onClick={downloadHtml} className={exportButtonClass}>
            Download HTML
          </button>
          <button type="button" onClick={downloadCard} className={exportButtonClass}>
            Download summary card
          </button>
          <button
            type="button"
            onClick={() => {
              setReport(null);
              setError("");
            }}
            className="rounded-xl px-3 py-2 text-sm text-slate-400 underline underline-offset-4 hover:text-white"
          >
            Generate again
          </button>
        </div>
      )}

      {!available && (
        <p className="mt-3 text-xs text-slate-400">
          The report is available after the network lookup completes.
        </p>
      )}
      {error && (
        <p role="status" className="mt-3 text-sm text-amber-200">
          {error}
        </p>
      )}
      {report && (
        <p className="mt-3 text-xs text-emerald-200" role="status">
          Report generated. Choose a format to download and share.
        </p>
      )}
    </section>
  );
}

const exportButtonClass =
  "rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-indigo-400/50 hover:text-white";

function downloadFile(content, filename, contentType) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  try {
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

function formatReportTimestamp(value) {
  const formattedDate = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));

  return `${formattedDate} UTC`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

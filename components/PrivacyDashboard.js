"use client";

import { useState, useEffect, useRef } from "react";
import ExposureCharts from "./ExposureCharts";
import VisitHistory from "./VisitHistory";

const HISTORY_STORAGE_KEY = "whoami-next-visit-history";
const MAX_SAVED_VISITS = 5;

export default function PrivacyDashboard() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [locationStatus, setLocationStatus] = useState("idle");
  const [preciseLocation, setPreciseLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [activeTab, setActiveTab] = useState("current");
  const [browserInfoReady, setBrowserInfoReady] = useState(false);
  const [visitHistory, setVisitHistory] = useState([]);
  const [currentSavedVisit, setCurrentSavedVisit] = useState(null);
  const [historyStatus, setHistoryStatus] = useState("loading");
  const [historyError, setHistoryError] = useState("");
  const hasSavedVisit = useRef(false);

  const [browserInfo, setBrowserInfo] = useState({
    language: "",
    screen: "",
    platform: "",
    userAgent: "",
    timezone: "",
    utcOffset: "",
    deviceMemory: "",
    hardwareConcurrency: "",
    connectionType: "",
    webglInfo: "",
  });

  useEffect(() => {
    const connection = navigator.connection;

    setBrowserInfo({
      language: navigator.language,
      screen: `${window.screen.width} x ${window.screen.height}`,
      platform: navigator.userAgentData?.platform || navigator.platform,
      userAgent: navigator.userAgent,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      utcOffset: formatUtcOffset(new Date().getTimezoneOffset()),
      deviceMemory: navigator.deviceMemory ? `about ${navigator.deviceMemory} GB` : "",
      hardwareConcurrency: navigator.hardwareConcurrency
        ? `${navigator.hardwareConcurrency} logical cores`
        : "",
      connectionType: connection
        ? [connection.effectiveType, connection.type].filter(Boolean).join(" / ")
        : "",
      webglInfo: getWebGlInfo(),
    });
    setBrowserInfoReady(true);

    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((result) => {
        if (result.error) {
          setStatus("error");
          return;
        }

        setData(result);
        setStatus("done");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    try {
      const savedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY);

      if (savedHistory === null) {
        setHistoryStatus("ready");
        return;
      }

      const parsedHistory = JSON.parse(savedHistory);
      if (!Array.isArray(parsedHistory) || !parsedHistory.every(isValidVisit)) {
        throw new Error("Saved visit history has an invalid format.");
      }

      setVisitHistory(
        parsedHistory
          .sort((first, second) => Date.parse(second.checkedAt) - Date.parse(first.checkedAt))
          .slice(0, MAX_SAVED_VISITS)
          .map(({ checkedAt, score, networkSignals, browserSignals }) => ({
            checkedAt,
            score,
            networkSignals,
            browserSignals,
          })),
      );
      setHistoryStatus("ready");
    } catch {
      setHistoryError(
        "Saved visit history could not be read. Clear the saved history to start a new one.",
      );
      setHistoryStatus("error");
    }
  }, []);

  function requestPreciseLocation() {
    if (!window.isSecureContext) {
      setLocationError("Precise location requires a secure context, such as HTTPS or localhost.");
      setLocationStatus("error");
      return;
    }

    if (!navigator.geolocation) {
      setLocationError("Location is not supported by this browser.");
      setLocationStatus("error");
      return;
    }

    setLocationError("");
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPreciseLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        });
        setLocationStatus("success");
      },
      (error) => {
        const messages = {
          1: "Location permission was denied. You can allow it in your browser settings and try again.",
          2: "Your device could not determine a location. Try again somewhere with a clearer signal.",
          3: "The location request timed out. Please try again.",
        };

        setLocationError(messages[error.code] || "Your location could not be retrieved.");
        setLocationStatus("error");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    );
  }

  function clearPreciseLocation() {
    setPreciseLocation(null);
    setLocationError("");
    setLocationStatus("idle");
  }

  const networkSignalCount = data
    ? [data.ip, data.city, data.region, data.country_name, data.org, data.timezone].filter(Boolean).length
    : 0;
  const browserSignalCount = [
    browserInfo.platform,
    browserInfo.language,
    browserInfo.screen,
    browserInfo.userAgent,
    browserInfo.timezone,
    browserInfo.utcOffset,
    browserInfo.deviceMemory,
    browserInfo.hardwareConcurrency,
    browserInfo.connectionType,
    browserInfo.webglInfo,
  ].filter(Boolean).length;
  const signalCount = networkSignalCount + browserSignalCount;
  const browserIdentityCount = [
    browserInfo.language,
    browserInfo.screen,
    browserInfo.userAgent,
  ].filter(Boolean).length;
  const fingerprintSignalCount = [
    browserInfo.platform,
    browserInfo.timezone,
    browserInfo.utcOffset,
    browserInfo.deviceMemory,
    browserInfo.hardwareConcurrency,
    browserInfo.connectionType,
    browserInfo.webglInfo,
  ].filter(Boolean).length;
  const observedSignalGroups = [
    networkSignalCount > 0,
    fingerprintSignalCount > 0,
    browserIdentityCount > 0,
  ].filter(Boolean).length;
  const exposureCategories = [
    {
      label: "Network exposure",
      score: Math.round((networkSignalCount / 6) * 25),
      detail: `${networkSignalCount} of 6 network fields available`,
    },
    {
      label: "Device fingerprinting",
      score: Math.round((fingerprintSignalCount / 7) * 25),
      detail: `${fingerprintSignalCount} of 7 device attributes available`,
    },
    {
      label: "Browser identity",
      score: Math.round((browserIdentityCount / 3) * 25),
      detail: `${browserIdentityCount} of 3 browser details available`,
    },
    {
      label: "Tracking risk",
      score: Math.round((observedSignalGroups / 3) * 25),
      detail: `${observedSignalGroups} of 3 signal groups represented`,
    },
  ];
  const exposureScore = exposureCategories.reduce((total, category) => total + category.score, 0);
  const exposureLevel =
    exposureScore < 40 ? "Low exposure" : exposureScore < 70 ? "Moderate exposure" : "High exposure";
  const exposureColor =
    exposureScore < 40
      ? "bg-emerald-400"
      : exposureScore < 70
        ? "bg-amber-400"
        : "bg-rose-400";

  useEffect(() => {
    if (
      status !== "done" ||
      !data ||
      !browserInfoReady ||
      historyStatus !== "ready" ||
      hasSavedVisit.current
    ) {
      return;
    }

    hasSavedVisit.current = true;
    const currentVisit = {
      checkedAt: new Date().toISOString(),
      score: exposureScore,
      networkSignals: networkSignalCount,
      browserSignals: browserSignalCount,
    };
    const nextHistory = [currentVisit, ...visitHistory].slice(0, MAX_SAVED_VISITS);

    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
      setVisitHistory(nextHistory);
      setCurrentSavedVisit(currentVisit);
      setHistoryError("");
    } catch {
      setHistoryError("This browser could not save visit history. Check its local storage settings.");
      setHistoryStatus("error");
    }
  }, [
    browserInfoReady,
    browserSignalCount,
    data,
    exposureScore,
    historyStatus,
    networkSignalCount,
    status,
    visitHistory,
  ]);

  function clearVisitHistory() {
    try {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY);
      setVisitHistory([]);
      setCurrentSavedVisit(null);
      setHistoryError("");
      setHistoryStatus("ready");
    } catch {
      setHistoryError("This browser could not clear the saved visit history.");
      setHistoryStatus("error");
    }
  }

  const previousVisit = visitHistory.find(
    (visit) => visit.checkedAt !== currentSavedVisit?.checkedAt,
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-sm sm:p-8">
          <header className="mb-8 flex flex-col gap-5 border-b border-slate-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-200">
                Privacy snapshot
              </span>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  What the internet knows about you
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                  A quick look at the public network and browser details a site can infer just by visiting.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                Signals detected
              </p>
              <div className="mt-2 flex items-end gap-3">
                <span className="text-3xl font-bold text-white">
                  {data || browserSignalCount > 0 ? signalCount : "--"}
                </span>
                <span className="pb-1 text-sm font-medium text-amber-300">/ 16</span>
              </div>
              <p className="mt-2 text-xs text-amber-100">
                {data
                  ? "Observed during this visit"
                  : browserSignalCount > 0
                    ? "Browser details available"
                    : "Waiting for data"}
              </p>
            </div>
          </header>

          <nav aria-label="Dashboard sections" className="mb-6 flex flex-wrap gap-2 border-b border-slate-800 pb-4">
            {[
              { id: "current", label: "Current visit" },
              { id: "score", label: "Privacy score" },
              { id: "comparison", label: "Comparison" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-pressed={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-400/40"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {activeTab === "current" && status === "loading" && (
            <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60">
              <p className="animate-pulse text-sm text-slate-400">Checking your public profile...</p>
            </div>
          )}

          {activeTab === "current" && status === "error" && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              Couldn&apos;t fetch this — check your connection and try again.
            </div>
          )}

          {activeTab === "score" && (
            <div role="region" aria-label="Privacy score">
          <section
            aria-labelledby="exposure-score-heading"
            className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="exposure-score-heading" className="text-sm font-semibold text-white">
                  Estimated exposure score
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  An educational estimate based on the signals available to this page.
                </p>
              </div>
              <p className="text-2xl font-bold text-white" aria-live="polite">
                {status === "done" && data ? `${exposureScore} / 100` : "-- / 100"}
                {status === "done" && data && (
                  <span className="ml-2 text-sm font-medium text-slate-300">{exposureLevel}</span>
                )}
              </p>
            </div>

            <div
              className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800"
              role="meter"
              aria-label="Estimated exposure score"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={status === "done" && data ? exposureScore : undefined}
              aria-valuetext={status === "done" && data ? `${exposureScore} out of 100, ${exposureLevel}` : "Score unavailable"}
            >
              {status === "done" && data && (
                <div
                  className={`h-full rounded-full transition-all ${exposureColor}`}
                  style={{ width: `${exposureScore}%` }}
                />
              )}
            </div>

            {status === "done" && data ? (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {exposureCategories.map((category) => (
                    <div key={category.label} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-medium text-slate-200">{category.label}</h3>
                        <span className="text-sm font-semibold text-white">{category.score} / 25</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{category.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-200">0–39 Low</span>
                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-amber-200">40–69 Moderate</span>
                  <span className="rounded-full bg-rose-400/10 px-3 py-1 text-rose-200">70–100 High</span>
                </div>
                <p className="mt-4 text-xs leading-5 text-slate-400">
                  Categories are equally weighted. Tracking risk reflects how many signal groups are present, not actual tracking activity. This score is a simple heuristic, not a validated privacy or security assessment.
                </p>
              </>
            ) : (
              <p className="mt-3 text-xs leading-5 text-slate-400">
                {status === "error"
                  ? "Score unavailable because the network lookup did not complete; missing network data is not counted as zero exposure."
                  : "Waiting for the network lookup so the score can include both network and browser signals."}
              </p>
            )}
          </section>

              {status === "done" && data && (
                <div className="mt-6">
                  <ExposureCharts
                    exposureCategories={exposureCategories}
                    networkSignalCount={networkSignalCount}
                    browserSignalCount={browserSignalCount}
                  />
                </div>
              )}
              <VisitHistory
                visits={visitHistory}
                currentVisit={currentSavedVisit}
                previousVisit={previousVisit}
                status={historyStatus}
                error={historyError}
                onClear={clearVisitHistory}
              />
            </div>
          )}

          {activeTab === "current" && (
            <div role="region" aria-label="Current visit details">
          <section
            aria-labelledby="precise-location-heading"
            className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="precise-location-heading" className="text-sm font-semibold text-white">
                  Precise location
                </h2>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">
                  Optional: ask your browser for your device&apos;s location. Coordinates are shown here and are not sent to the IP lookup service.
                </p>
              </div>
              {locationStatus !== "success" && (
                <button
                  type="button"
                  onClick={requestPreciseLocation}
                  disabled={locationStatus === "loading"}
                  className="shrink-0 rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-4 py-2.5 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/25 disabled:cursor-wait disabled:opacity-60"
                >
                  {locationStatus === "loading" ? "Getting location..." : "Use my precise location"}
                </button>
              )}
            </div>

            {locationStatus === "error" && (
              <p role="status" className="mt-4 text-sm text-amber-200">
                {locationError}
              </p>
            )}

            {preciseLocation && locationStatus === "success" && (
              <div role="status" className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <LocationValue
                    label="Latitude"
                    value={preciseLocation.latitude.toFixed(6)}
                    explanation="One coordinate that helps pinpoint your location."
                  />
                  <LocationValue
                    label="Longitude"
                    value={preciseLocation.longitude.toFixed(6)}
                    explanation="The other coordinate used to pinpoint your location."
                  />
                  <LocationValue
                    label="Reported accuracy"
                    value={`about ${Math.round(preciseLocation.accuracy)} m`}
                    explanation="The device's estimated radius of accuracy."
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Accuracy is an estimate from your device and browser, not a guarantee of GPS precision.
                </p>
                <button
                  type="button"
                  onClick={clearPreciseLocation}
                  className="mt-4 text-xs font-medium text-slate-400 underline decoration-slate-600 underline-offset-4 hover:text-white"
                >
                  Clear coordinates
                </button>
              </div>
            )}
          </section>

          {(data || browserSignalCount > 0) && (
            <div className="space-y-6">
              <section className={`grid gap-4 ${data ? "sm:grid-cols-3" : "sm:grid-cols-1"}`}>
                {data && (
                  <>
                    <MetricCard label="Network signals" value={`${networkSignalCount} / 6`} detail="returned by IP lookup" />
                    <MetricCard label="IP location" value={data.city ? "Approximate" : "Unavailable"} detail="not GPS location" />
                      </>
                    )}
                    <MetricCard label="Browser signals" value={`${browserSignalCount} / 10`} detail="read locally by this page" />
              </section>

              <section className={`grid gap-6 ${data ? "lg:grid-cols-2" : ""}`}>
                {data && (
                  <InfoPanel
                    title="Network"
                    accent="indigo"
                    rows={[
                      { label: "IP Address", value: data.ip, explanation: "Identifies your internet connection and can estimate your general location." },
                      { label: "City", value: data.city, explanation: "An approximate location inferred from your public IP, not GPS." },
                      { label: "Region", value: data.region, explanation: "A broader area estimated from your public IP." },
                      { label: "Country", value: data.country_name, explanation: "The country associated with your public IP address." },
                      { label: "ISP", value: data.org, explanation: "Shows the provider or organization associated with your connection." },
                      { label: "Timezone", value: data.timezone, explanation: "A time zone estimate returned by the IP lookup service." },
                    ]}
                  />
                )}

                <InfoPanel
                  title="Your device"
                  accent="cyan"
                  rows={[
                    { label: "Language", value: browserInfo.language, explanation: "Helps a site choose language and regional formatting." },
                    { label: "Screen size", value: browserInfo.screen, explanation: "Helps adapt page layout and can contribute to a device profile." },
                    { label: "User agent", value: browserInfo.userAgent, explanation: "Describes browser software and platform for compatibility; it may also help distinguish browsers.", multiline: true },
                  ]}
                />
              </section>

              <InfoPanel
                title="Device fingerprint"
                accent="cyan"
                rows={[
                  { label: "OS / platform", value: browserInfo.platform || "Not exposed by this browser", explanation: "Identifies the operating system family or platform." },
                  { label: "Time zone", value: browserInfo.timezone, explanation: "Can suggest your region and contributes to a browser profile." },
                  { label: "UTC offset", value: browserInfo.utcOffset, explanation: "Shows your local offset from UTC; it can vary with daylight saving time." },
                  { label: "Device memory", value: browserInfo.deviceMemory || "Not exposed by this browser", explanation: "A browser-provided, rounded estimate that can help distinguish device classes." },
                  { label: "CPU threads", value: browserInfo.hardwareConcurrency || "Not exposed by this browser", explanation: "Reports logical processor count and may help distinguish device configurations." },
                  { label: "Connection type", value: browserInfo.connectionType || "Not exposed by this browser", explanation: "A coarse network estimate that can affect content or performance choices." },
                  {
                    label: "WebGL vendor / renderer / version",
                    value: browserInfo.webglInfo || "Unavailable or restricted by browser",
                    explanation: "Graphics details can vary between devices and may contribute to browser fingerprinting.",
                    multiline: true,
                  },
                ]}
              />

              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:p-5">
                <div className="grid gap-6 lg:grid-cols-2">
                  <section aria-labelledby="why-matters-heading">
                    <h2 id="why-matters-heading" className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Why this matters
                    </h2>
                    <p className="text-sm leading-6 text-slate-300">
                      Websites can use network and browser details to adapt content, estimate your general location, or help recognize a device when several attributes are combined. This page shows the attributes but does not create a fingerprint ID or store them. The IP lookup provider receives your public IP to return network details.
                    </p>
                  </section>
                  <section aria-labelledby="reduce-exposure-heading">
                    <h2 id="reduce-exposure-heading" className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      How to reduce it
                    </h2>
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300">
                      <li>Use browser privacy protections that limit cross-site tracking and fingerprinting.</li>
                      <li>Review site permissions and allow precise location only when needed.</li>
                      <li>A VPN can hide your usual public IP from a site, but shifts trust to the VPN provider and does not hide browser details.</li>
                    </ul>
                  </section>
                </div>
                <p className="mt-4 border-t border-slate-800 pt-4 text-xs leading-5 text-slate-400">
                  Browser settings affect which details are available. Values read through browser APIs are not added to the IP lookup data, though standard request headers may expose some browser details. The signal count is not a privacy or risk score.
                </p>
              </div>
            </div>
          )}
            </div>
          )}

          {activeTab === "comparison" && (
            <section aria-labelledby="comparison-heading" className="space-y-6">
              <div>
                <h2 id="comparison-heading" className="text-lg font-semibold text-white">
                  What kind of data is this?
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Compare data associated with your public internet connection with details this page reads from your browser.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <ComparisonPanel
                  title="Public network data"
                  badge="IP lookup"
                  description="The IP lookup service uses your public IP to return network-related details. IP-based location is approximate."
                  items={[
                    `Public IP address${data?.ip ? `: ${data.ip}` : ""}`,
                    "Approximate city, region, and country",
                    "Internet provider or network organization",
                    "Network-derived timezone",
                  ]}
                />
                <ComparisonPanel
                  title="Browser-only metadata"
                  badge="Read on this page"
                  description="This page reads these values through browser APIs; it does not add them to the IP lookup data. Standard HTTP request headers may still reveal some browser details."
                  items={[
                    "Language, screen size, and user agent",
                    "Platform, local timezone, and UTC offset",
                    "Approximate memory and logical CPU threads",
                    "Connection hints and WebGL information when exposed",
                  ]}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <ComparisonPanel
                  title="May help recognize a browser"
                  badge="Potential tracking signals"
                  description="These values can contribute to recognition when combined, but their presence does not mean a site is tracking you."
                  items={[
                    "Public IP address across visits",
                    "User agent and operating-system platform",
                    "Screen size, timezone, and UTC offset",
                    "Device capabilities and WebGL details",
                  ]}
                />
                <ComparisonPanel
                  title="Often used for site functionality"
                  badge="Context and preferences"
                  description="These details can help a site adapt its behavior; they may also contribute to a profile when combined with other data."
                  items={[
                    "Language for content and formatting",
                    "Screen size for responsive page layout",
                    "Connection hints for performance choices",
                    "Timezone for displaying local times",
                  ]}
                />
              </div>

              <p className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-6 text-amber-100">
                These groups are not a strict tracking / non-tracking split: the same signal can support useful features or contribute to tracking. This page does not observe whether another site stores, shares, or uses these values to track you. The IP lookup provider receives your public IP and may receive standard request headers.
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function MetricCard({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

function isValidVisit(visit) {
  return (
    visit !== null &&
    typeof visit === "object" &&
    typeof visit.checkedAt === "string" &&
    Number.isFinite(Date.parse(visit.checkedAt)) &&
    Number.isInteger(visit.score) &&
    visit.score >= 0 &&
    visit.score <= 100 &&
    Number.isInteger(visit.networkSignals) &&
    visit.networkSignals >= 0 &&
    visit.networkSignals <= 6 &&
    Number.isInteger(visit.browserSignals) &&
    visit.browserSignals >= 0 &&
    visit.browserSignals <= 10
  );
}

function ComparisonPanel({ title, badge, description, items }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="rounded-full border border-slate-700 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300">
          {badge}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-5 text-slate-300">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function LocationValue({ label, value, explanation }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 break-all text-sm font-medium text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">{explanation}</p>
    </div>
  );
}

function InfoPanel({ title, rows, accent }) {
  const accentStyles = {
    indigo: "border-indigo-500/30 bg-indigo-500/10 text-indigo-200",
    cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
      <div className={`mb-4 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${accentStyles[accent]}`}>
        {title}
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <Row
            key={row.label}
            label={row.label}
            value={row.value}
            explanation={row.explanation}
            multiline={row.multiline}
          />
        ))}
      </div>
    </div>
  );
}

function Row({ label, value, explanation, multiline }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-800 pb-2.5 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="sm:max-w-[55%]">
        <p className="text-sm text-slate-300">{label}</p>
        <p className="mt-0.5 text-xs leading-5 text-slate-500">{explanation}</p>
      </div>
      <span
        className={`${multiline ? "sm:max-w-[45%] break-all" : "sm:max-w-[220px] sm:truncate"} text-sm font-medium text-slate-100 sm:text-right`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function formatUtcOffset(offsetMinutes) {
  const offset = -offsetMinutes;
  const sign = offset >= 0 ? "+" : "-";
  const hours = Math.floor(Math.abs(offset) / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (Math.abs(offset) % 60).toString().padStart(2, "0");

  return `UTC${sign}${hours}:${minutes}`;
}

function getWebGlInfo() {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl");

  if (!gl) {
    return "";
  }

  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  const vendor = gl.getParameter(debugInfo ? debugInfo.UNMASKED_VENDOR_WEBGL : gl.VENDOR);
  const renderer = gl.getParameter(debugInfo ? debugInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER);
  const version = gl.getParameter(gl.VERSION);
  const info = [vendor, renderer, version].filter(Boolean).join(" / ");

  gl.getExtension("WEBGL_lose_context")?.loseContext();

  return info;
}
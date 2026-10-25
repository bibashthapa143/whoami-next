"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [locationStatus, setLocationStatus] = useState("idle");
  const [preciseLocation, setPreciseLocation] = useState(null);
  const [locationError, setLocationError] = useState("");

  const [browserInfo, setBrowserInfo] = useState({
    language: "",
    screen: "",
    platform: "",
    userAgent: "",
  });

  useEffect(() => {
    setBrowserInfo({
      language: navigator.language,
      screen: `${window.screen.width} x ${window.screen.height}`,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
    });

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
  ].filter(Boolean).length;
  const signalCount = networkSignalCount + browserSignalCount;

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
                  {status === "done" && data ? signalCount : "--"}
                </span>
                <span className="pb-1 text-sm font-medium text-amber-300">/ 10</span>
              </div>
              <p className="mt-2 text-xs text-amber-100">
                {status === "done" && data ? "Observed during this visit" : "Waiting for data"}
              </p>
            </div>
          </header>

          {status === "loading" && (
            <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60">
              <p className="animate-pulse text-sm text-slate-400">Checking your public profile...</p>
            </div>
          )}

          {status === "error" && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              Couldn&apos;t fetch this — check your connection and try again.
            </div>
          )}

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
                  <LocationValue label="Latitude" value={preciseLocation.latitude.toFixed(6)} />
                  <LocationValue label="Longitude" value={preciseLocation.longitude.toFixed(6)} />
                  <LocationValue label="Reported accuracy" value={`about ${Math.round(preciseLocation.accuracy)} m`} />
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

          {status === "done" && data && (
            <div className="space-y-6">
              <section className="grid gap-4 sm:grid-cols-3">
                <MetricCard label="Network signals" value={`${networkSignalCount} / 6`} detail="returned by IP lookup" />
                <MetricCard label="IP location" value={data.city ? "Approximate" : "Unavailable"} detail="not GPS location" />
                <MetricCard label="Browser signals" value={`${browserSignalCount} / 4`} detail="read by this page" />
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <InfoPanel
                  title="Network"
                  accent="indigo"
                  rows={[
                    { label: "IP Address", value: data.ip },
                    { label: "City", value: data.city },
                    { label: "Region", value: data.region },
                    { label: "Country", value: data.country_name },
                    { label: "ISP", value: data.org },
                    { label: "Timezone", value: data.timezone },
                  ]}
                />

                <InfoPanel
                  title="Your device"
                  accent="cyan"
                  rows={[
                    { label: "Platform", value: browserInfo.platform },
                    { label: "Language", value: browserInfo.language },
                    { label: "Screen size", value: browserInfo.screen },
                    { label: "User agent", value: browserInfo.userAgent },
                  ]}
                />
              </section>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Why this matters
                </p>
                <p className="text-sm leading-6 text-slate-300">
                  This is a small privacy-awareness demo — it uses your public IP and browser data, the same kind of metadata nearly every website collects automatically. It&apos;s useful for awareness, not for storing or selling personal information.
                </p>
              </div>
            </div>
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

function LocationValue({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 break-all text-sm font-medium text-white">{value}</p>
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
          <Row key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2.5 last:border-b-0 last:pb-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="max-w-[220px] truncate text-right text-sm font-medium text-slate-100">
        {value || "—"}
      </span>
    </div>
  );
}
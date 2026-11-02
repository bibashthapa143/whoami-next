"use client";

import { useState } from "react";

const simulatedRequests = [
  { id: "analytics", name: "Analytics script", purpose: "Illustrative audience measurement" },
  { id: "advertising", name: "Advertising pixel", purpose: "Illustrative ad measurement" },
  { id: "social", name: "Social media embed", purpose: "Illustrative third-party content" },
  { id: "essential", name: "Essential site resource", purpose: "Example required for page delivery", essential: true },
];

const privacyProfiles = {
  standard: {
    label: "Standard browser setup",
    cookieBehavior: "Depends on browser settings; third-party storage may be available.",
    fingerprintBehavior: "Browser APIs are generally available, though some may be restricted.",
    ipBehavior: "Websites can see the public IP used for the connection.",
  },
  private: {
    label: "Private browsing mode",
    cookieBehavior: "Usually isolates session data and clears it when the private session closes.",
    fingerprintBehavior: "Most device/browser APIs may still look similar to a normal session.",
    ipBehavior: "Private mode does not normally hide your public IP from websites.",
  },
  hardened: {
    label: "Privacy-hardened browser",
    cookieBehavior: "May block or partition third-party cookies, depending on settings.",
    fingerprintBehavior: "May limit or standardize some fingerprinting signals.",
    ipBehavior: "A browser alone does not necessarily hide your public IP.",
  },
};

export default function PrivacyTools({ data, browserSignalCount, networkSignalCount }) {
  const [blockedExamples, setBlockedExamples] = useState(true);
  const [consent, setConsent] = useState({ analytics: false, advertising: false });
  const [selectedProfile, setSelectedProfile] = useState("private");
  const hasIpCoordinates =
    data?.latitude !== null &&
    data?.latitude !== undefined &&
    data?.latitude !== "" &&
    data?.longitude !== null &&
    data?.longitude !== undefined &&
    data?.longitude !== "" &&
    Number.isFinite(Number(data.latitude)) &&
    Number.isFinite(Number(data.longitude)) &&
    Number(data.latitude) >= -90 &&
    Number(data.latitude) <= 90 &&
    Number(data.longitude) >= -180 &&
    Number(data.longitude) <= 180;
  const profile = privacyProfiles[selectedProfile];

  function updateConsent(category, enabled) {
    setConsent((current) => ({ ...current, [category]: enabled }));
  }

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="privacy-tools-heading"
        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5"
      >
        <h2 id="privacy-tools-heading" className="text-lg font-semibold text-white">
          Privacy tools
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          Explore approximate location, consent choices, and illustrative browser protections. Simulations here do not scan your browser or send test requests.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          aria-labelledby="region-map-heading"
          className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 id="region-map-heading" className="text-sm font-semibold text-white">
                Approximate IP region
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                {data?.city || data?.region || data?.country_name
                  ? [data.city, data.region, data.country_name].filter(Boolean).join(", ")
                  : "Region unavailable"}
              </p>
            </div>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-200">
              IP estimate
            </span>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <svg
              viewBox="0 0 720 340"
              role="img"
              aria-label={
                hasIpCoordinates
                  ? `Stylized world map with an approximate IP region marker for ${data.city || data.country_name || "your region"}.`
                  : "Stylized world map. No IP region marker is available."
              }
              className="block h-auto w-full"
            >
              <rect width="720" height="340" fill="#0f172a" />
              {[90, 180, 270, 360, 450, 540, 630].map((x) => (
                <line key={`lon-${x}`} x1={x} y1="0" x2={x} y2="340" stroke="#334155" strokeWidth="1" />
              ))}
              {[68, 136, 204, 272].map((y) => (
                <line key={`lat-${y}`} x1="0" y1={y} x2="720" y2={y} stroke="#334155" strokeWidth="1" />
              ))}
              <g fill="#334155" stroke="#475569" strokeWidth="2">
                <path d="M66 74 105 42 160 38 181 57 220 65 235 91 214 108 203 139 181 155 170 187 149 194 134 172 114 163 98 136 78 125 61 101Z" />
                <path d="m193 197 29 10 23 32-7 39-19 40-17-12-9-38-16-30Z" />
                <path d="m312 74 34-17 42 7 12 20-25 16-39-5Z" />
                <path d="m357 111 42-9 37 21 21 43-12 44-27 21-23 45-25 16-16-26-10-47-21-38 4-40Z" />
                <path d="m384 58 64-25 75 4 41 23 68 8 34 31-23 30-58-5-26 24-37-15-41 19-30-31-39-4-25-23-40 1Z" />
                <path d="m578 211 40-14 40 12 18 28-29 26-44-8-28-20Z" />
                <path d="m271 68 17-11 13 8-7 20-19 2Z" />
              </g>
              {hasIpCoordinates && (
                <g
                  transform={`translate(${longitudeToX(Number(data.longitude))} ${latitudeToY(Number(data.latitude))})`}
                >
                  <circle r="15" fill="#818cf8" opacity=".3" />
                  <circle r="7" fill="#a5b4fc" stroke="#f8fafc" strokeWidth="2" />
                </g>
              )}
              <text x="16" y="324" fill="#94a3b8" fontSize="12">
                Illustrative map projection · not a street map
              </text>
            </svg>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-400">
            {hasIpCoordinates
              ? "The marker uses approximate coordinates from the IP lookup, not device GPS. It can be inaccurate, especially with VPNs or mobile networks."
              : "The lookup did not provide usable coordinates, so no marker is shown. This map is illustrative and does not request precise location."}
          </p>
        </section>

        <ExtensionStatus browserSignalCount={browserSignalCount} networkSignalCount={networkSignalCount} />

        <section
          aria-labelledby="tracker-simulation-heading"
          className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 id="tracker-simulation-heading" className="text-sm font-semibold text-white">
                Simulated tracker panel
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Example request categories only. This page does not detect or block real trackers.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={blockedExamples}
              onClick={() => setBlockedExamples((blocked) => !blocked)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
                blockedExamples
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : "border-slate-700 bg-slate-900 text-slate-300"
              }`}
            >
              {blockedExamples ? "Examples blocked" : "Examples allowed"}
            </button>
          </div>
          <ul className="mt-4 divide-y divide-slate-800">
            {simulatedRequests.map((request) => {
              const blocked = !request.essential && blockedExamples;

              return (
                <li key={request.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{request.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{request.purpose}</p>
                  </div>
                  <span className={`text-xs font-medium ${blocked ? "text-emerald-300" : "text-slate-400"}`}>
                    {request.essential ? "Essential example" : blocked ? "Would be blocked" : "Would be allowed"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          aria-labelledby="consent-awareness-heading"
          className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5"
        >
          <h3 id="consent-awareness-heading" className="text-sm font-semibold text-white">
            Consent and cookie awareness
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Try changing optional consent categories. These controls demonstrate a consent UI only; they do not set cookies or change browser storage.
          </p>
          <div className="mt-4 space-y-3">
            <ConsentRow label="Necessary storage" description="Required for a site feature; always on in this example." checked disabled />
            <ConsentRow
              label="Analytics"
              description="Optional measurement category."
              checked={consent.analytics}
              onChange={(checked) => updateConsent("analytics", checked)}
            />
            <ConsentRow
              label="Advertising"
              description="Optional advertising category."
              checked={consent.advertising}
              onChange={(checked) => updateConsent("advertising", checked)}
            />
          </div>
          <p className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-400" role="status">
            Demo preference: {consent.analytics || consent.advertising ? "optional categories selected" : "optional categories off"} · not saved
          </p>
        </section>
      </div>

      <BrowserComparison
        selectedProfile={selectedProfile}
        onProfileChange={setSelectedProfile}
        profile={profile}
        browserSignalCount={browserSignalCount}
        hasNetworkData={Boolean(data)}
      />
    </div>
  );
}

function ExtensionStatus({ browserSignalCount, networkSignalCount }) {
  const statusText = networkSignalCount > 0 ? "Visit check complete" : "Waiting for network data";

  return (
    <section
      aria-labelledby="extension-status-heading"
      className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5"
    >
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-indigo-400/30 bg-indigo-500/10 text-lg text-indigo-200">
          ◈
        </div>
        <div>
          <h3 id="extension-status-heading" className="text-sm font-semibold text-white">
            Browser-style privacy status
          </h3>
          <p className="mt-1 text-xs text-slate-400">Local dashboard summary · not a browser extension</p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
        <div>
          <p className="text-sm font-medium text-slate-200">{statusText}</p>
          <p className="mt-1 text-xs text-slate-400">Signals available to this page</p>
        </div>
        <span className="text-lg font-semibold text-white">{networkSignalCount + browserSignalCount}/16</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        This panel reports this demo&apos;s observations; it does not inspect extensions, permissions, or protection settings.
      </p>
    </section>
  );
}

function BrowserComparison({ selectedProfile, onProfileChange, profile, browserSignalCount, hasNetworkData }) {
  return (
    <section
      aria-labelledby="browser-comparison-heading"
      className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 id="browser-comparison-heading" className="text-sm font-semibold text-white">
            Compare browser privacy modes
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Compare typical behavior; this page cannot tell which browser mode you are using.
          </p>
        </div>
        <label className="text-xs text-slate-400">
          Compare with
          <select
            value={selectedProfile}
            onChange={(event) => onProfileChange(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 sm:min-w-56"
          >
            {Object.entries(privacyProfiles).map(([id, option]) => (
              <option key={id} value={id}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[38rem] text-left text-sm">
          <thead className="text-xs text-slate-400">
            <tr>
              <th scope="col" className="pb-3 pr-4 font-medium">Area</th>
              <th scope="col" className="pb-3 pr-4 font-medium">This visit</th>
              <th scope="col" className="pb-3 font-medium">{profile.label}</th>
            </tr>
          </thead>
          <tbody>
            <ComparisonRow
              label="Public IP"
              current={hasNetworkData ? "Returned by the IP lookup" : "IP lookup unavailable"}
              comparison={profile.ipBehavior}
            />
            <ComparisonRow
              label="Browser signals"
              current={`${browserSignalCount} browser fields available on this visit`}
              comparison={profile.fingerprintBehavior}
            />
            <ComparisonRow
              label="Cookies and storage"
              current="Not audited by this dashboard"
              comparison={profile.cookieBehavior}
            />
            <ComparisonRow
              label="Tracking activity"
              current="Not measured"
              comparison="Cannot be concluded from browser mode alone."
            />
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        These are general tendencies, not guarantees. Private browsing mainly limits persistence between sessions; it usually does not hide your IP or make all browser APIs anonymous. Browser protections vary by product and settings.
      </p>
    </section>
  );
}

function ComparisonRow({ label, current, comparison }) {
  return (
    <tr className="border-t border-slate-800 align-top">
      <th scope="row" className="py-3 pr-4 font-medium text-slate-200">{label}</th>
      <td className="py-3 pr-4 text-slate-400">{current}</td>
      <td className="py-3 text-slate-300">{comparison}</td>
    </tr>
  );
}

function ConsentRow({ label, description, checked, onChange, disabled = false }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
      <span>
        <span className="block text-sm font-medium text-slate-200">{label}</span>
        <span className="mt-0.5 block text-xs text-slate-400">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        className="h-4 w-4 accent-indigo-400 disabled:opacity-70"
      />
    </label>
  );
}

function longitudeToX(longitude) {
  return Math.max(12, Math.min(708, ((longitude + 180) / 360) * 720));
}

function latitudeToY(latitude) {
  return Math.max(12, Math.min(328, ((90 - latitude) / 180) * 340));
}

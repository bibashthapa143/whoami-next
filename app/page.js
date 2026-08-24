"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | done | error
  const [browserInfo, setBrowserInfo] = useState({
    browser: "",
    language: "",
    screen: "",
    platform: "",
  });

  useEffect(() => {
    setBrowserInfo({
      browser: navigator.userAgent,
      language: navigator.language,
      screen: `${window.screen.width} x ${window.screen.height}`,
      platform: navigator.platform,
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div>
          <h1 className="text-xl font-semibold">
            What The Internet Knows About You
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Every website can silently see this the moment you visit — no
            login, no permission needed.
          </p>
        </div>

        {status === "loading" && (
          <p className="text-slate-400 text-sm animate-pulse">
            Looking you up...
          </p>
        )}

        {status === "error" && (
          <p className="text-red-400 text-sm">
            Couldn't fetch this — check your connection.
          </p>
        )}

        {status === "done" && data && (
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg p-4 space-y-2">
              <p className="text-indigo-300 text-xs font-medium uppercase tracking-wide">
                Network
              </p>
              <Row label="IP Address" value={data.ip} />
              <Row label="City" value={data.city} />
              <Row label="Region" value={data.region} />
              <Row label="Country" value={data.country_name} />
              <Row label="ISP" value={data.org} />
              <Row label="Timezone" value={data.timezone} />
            </div>

            <div className="bg-slate-800 rounded-lg p-4 space-y-2">
              <p className="text-indigo-300 text-xs font-medium uppercase tracking-wide">
                Your Device
              </p>
              <Row label="Platform" value={browserInfo.platform} />
              <Row label="Language" value={browserInfo.language} />
              <Row label="Screen size" value={browserInfo.screen} />
            </div>

            <p className="text-slate-500 text-xs leading-relaxed">
              This is a small privacy-awareness demo — it uses your public
              IP and browser data, the same info nearly every website
              collects automatically. Nothing here is stored anywhere.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-100 text-right ml-4 truncate max-w-[220px]">
        {value || "—"}
      </span>
    </div>
  );
}
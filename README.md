# whoami-next

A small privacy-awareness demo built with Next.js that shows what information a website can infer about a visitor from their public IP address and browser metadata.

## Overview

This app fetches public network information from `ipapi.co` and combines it with browser details such as language, screen size, and platform. It presents the data in a clean, dark-themed UI designed to raise awareness about everyday web tracking and metadata exposure.

The project is intentionally simple: it demonstrates how much information is available to a site without any login or special permissions.

## Features

- Public IP address lookup
- City, region, country, and timezone detection
- ISP and network metadata display
- A separate device fingerprint section showing OS/platform, time zone, UTC offset, approximate device memory, CPU thread count, connection type, and WebGL details when exposed
- Browser language, screen size, and user agent
- Estimated exposure meter with network, device fingerprinting, browser identity, and tracking-risk breakdowns
- Chart.js visualizations for category scores, exposure-level distribution, and metadata signal counts
- On-demand shareable reports in plain text, HTML, and PNG summary-card formats
- Local history of the last five completed checks with privacy-score and signal-count trends
- Dashboard tabs for the current visit, privacy score, and comparisons between public network data, browser metadata, potential tracking signals, and common functionality signals
- Privacy tools tab with an approximate IP-region map, simulated tracker panel, consent-awareness demo, extension-style status card, and browser/privacy-mode comparison
- Optional, permission-based precise location with reported accuracy
- Minimal, privacy-focused UI
- No persistent database or user account system

## Tech Stack

- Next.js 16
- React 19
- JavaScript
- Tailwind CSS

## Project Structure

```text
whoami-next/
├── app/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   ├── ExposureCharts.js
│   ├── ExposureReport.js
│   ├── PrivacyDashboard.js
│   ├── PrivacyTools.js
│   └── VisitHistory.js
├── public/
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── package-lock.json
└── README.md
```

The `app/` directory contains the route and shared layout. The interactive dashboard lives in `components/`, while `public/` holds static assets and project configuration remains at the root.

## Running the Project

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the app in your browser:

```text
http://localhost:3000
```

## Notes

- This app uses a public API (`ipapi.co`) to retrieve location and network information.
- IP-based location is approximate. Precise location is requested only after you select the location button and grant browser permission.
- Precise coordinates are displayed in the page, are not sent to the IP lookup service, and are not stored by this project.
- Browser and WebGL details are read through browser APIs and are not added to the IP lookup data. Standard HTTP request headers may still reveal some browser details, such as the user agent. The device fingerprint section displays attributes only; it does not generate a unique fingerprint ID or store these values. Availability and precision vary by browser; the signal count reports available fields and is not a risk score.
- Each displayed data point includes a short explanation of how it may be used. The dashboard also explains why the data matters and lists practical ways to reduce exposure.
- The exposure meter is a simple, equally weighted heuristic (25 points per category), not a validated privacy or security assessment. It labels 0–39 low, 40–69 moderate, and 70–100 high. Tracking risk reflects how many signal groups are represented, not actual tracking activity. A failed network lookup leaves the score unavailable instead of treating missing data as zero exposure.
- The last five completed checks are stored in this browser's `localStorage` (timestamp, score, and signal counts only). Raw IP addresses, coordinates, and browser details are not included. Use **Clear history** to remove them; clearing browser site data also deletes the history.
- Reports are generated only when requested in the browser and can be downloaded as plain text, HTML, or a PNG summary card; no file is uploaded. They contain the score, signal counts, category summaries, and a UTC timestamp, but omit raw IP addresses, precise coordinates, and browser detail values.
- The privacy-tools map uses only approximate latitude/longitude from the IP lookup; it does not use precise device location. The tracker panel is a local simulation and does not inspect network requests or block trackers. Consent toggles are an educational demo and do not set cookies or change storage. The extension-style card is not an installed extension or a protection service.
- Browser/privacy-mode comparisons show general tendencies selected by the user. The app does not detect private browsing, and private mode does not necessarily hide a public IP address or prevent browser fingerprinting.
- Precise location requires a secure context (HTTPS or localhost); reported accuracy depends on the device and environment.
- Internet access is required for the IP lookup to work.

## Purpose

This project is best used as a teaching or demonstration app for privacy awareness, browser metadata, and basic full-stack web app patterns in Next.js.

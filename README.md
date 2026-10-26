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
│   └── PrivacyDashboard.js
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
- Browser and WebGL details are read locally in your browser and are not sent to the IP lookup service. The device fingerprint section displays attributes only; it does not generate a unique fingerprint ID or store these values. Availability and precision vary by browser; the signal count reports available fields and is not a risk score.
- Precise location requires a secure context (HTTPS or localhost); reported accuracy depends on the device and environment.
- Internet access is required for the IP lookup to work.

## Purpose

This project is best used as a teaching or demonstration app for privacy awareness, browser metadata, and basic full-stack web app patterns in Next.js.

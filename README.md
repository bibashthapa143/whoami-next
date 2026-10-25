# whoami-next

A small privacy-awareness demo built with Next.js that shows what information a website can infer about a visitor from their public IP address and browser metadata.

## Overview

This app fetches public network information from `ipapi.co` and combines it with browser details such as language, screen size, and platform. It presents the data in a clean, dark-themed UI designed to raise awareness about everyday web tracking and metadata exposure.

The project is intentionally simple: it demonstrates how much information is available to a site without any login or special permissions.

## Features

- Public IP address lookup
- City, region, country, and timezone detection
- ISP and network metadata display
- Browser language and platform detection
- Screen size reporting
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
├── public/
├── .gitignore
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
├── postcss.config.mjs
└── README.md
```

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
- The data is displayed only in the browser and is not stored by this project.
- Internet access is required for the IP lookup to work.

## Purpose

This project is best used as a teaching or demonstration app for privacy awareness, browser metadata, and basic full-stack web app patterns in Next.js.

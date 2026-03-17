# Mohr Ads Dashboard

## Project Overview
A full-stack web application for Mohr Insurance Services to track Medicare webinar
Facebook ad campaign performance from Meta ad spend through to client acquisition
and revenue.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Node.js (Express)
- **Database**: SQLite (via better-sqlite3)
- **Meta Integration**: Meta Marketing API (Graph API)
- **Deployment**: Railway (single service — Express serves API + static frontend)

## Commands
- `pnpm install` — Install all dependencies
- `pnpm dev` — Run both frontend and backend in development
- `pnpm build` — Build frontend for production
- `pnpm start` — Start production server

## Architecture
Express backend serves API routes at `/api/*` and the built React frontend as static files.
SQLite DB must be stored on a Railway Volume mount at `/data/`.

## Metric Definitions
### Meta API Fields (auto-pulled)
- Spend, Impressions, Clicks, CPM, CTR, CPC, Leads, Cost Per Lead, Landing Page Views
- Connect Rate = (Landing Page Views / Link Clicks) × 100

### Manual Input Fields
- Attendees, Autobooked Appts, Total Appts, Appts Due, Live Calls
- New Clients, Future Sales, Proj Close Rate (default 65%), Revenue, Avg FYC, Notes

### Auto-Calculated Fields
- Attendee %, Autobook Rate, Lead to Appt Rate, Cost per Appt
- Appt to Live Rate, Close Rate, CPA, Total Sales incl Projected
- Projected CPA, Conversion Rate, Projected Conversion Rate, ROAS

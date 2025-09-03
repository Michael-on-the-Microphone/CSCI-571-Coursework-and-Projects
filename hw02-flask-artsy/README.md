# Assignment 2 — Flask + Vanilla JS + Artsy API

**Course context:** Completed as part of USC **CSCI 571 Web Technologies** (Spring 2025), under **Professor Marco Papa**.

## What this project is
A lightweight web app that lets users **search artists** via the **Artsy API**, display scrollable artist cards, and show **artist details** (name, birthday, deathday, nationality, biography). The **Flask** backend proxies Artsy, and the **vanilla JS** frontend never talks to Artsy directly (keys stay server‑side).

## Key features
- Search bar with validation and loading state.
- Scrollable result cards with circular thumbnails and hover/focus states.
- Details panel with graceful handling of missing fields and placeholders for missing images.
- All frontend→backend over **GET** to simplify grading links.

## Tech stack
- **Python 3.11**, **Flask** (server‑render + JSON endpoints)
- **Vanilla JavaScript**, HTML, CSS (no frameworks, no Bootstrap per rubric)
- **Artsy API** (Authentication, Search, Artists)
- Hosted on **Google Cloud**

## Engineering highlights
- Token caching for Artsy XAPP token to minimize latency.
- Strict same‑origin calls (frontend⇄backend) for clean security model.
- DOM updates and CSS states implemented without frameworks (demonstrates fundamentals).

## Live links
- **Home Page:** https://usc-web-tech.uw.r.appspot.com/
- **Cloud Service:** https://usc-web-tech.uw.r.appspot.com/docs

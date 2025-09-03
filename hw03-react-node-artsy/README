# Assignment 3 — React + Node/Express + MongoDB + Artsy API

**Course context:** Completed as part of USC **CSCI 571 Web Technologies** (Spring 2025), under **Professor Marco Papa**.

## What this project is
A production‑style **full‑stack** app that extends A2 with: **auth** (register/login/logout/delete), **favorites** (newest‑first + global notifications), **similar artists**, **artworks**, and **categories**. The **backend serves the React build**, so the SPA and API share an origin — **no CORS headaches**.

## Key features
- **Artist search** → card list → **detail view** with tabs: **Artist Info**, **Artworks**, **(Auth) Similar**.
- **Categories modal** per artwork with async loading.
- **Authentication** with **JWT in HTTP‑only cookies** (~1h), **bcrypt** password hashing, and Gravatar avatar.
- **Favorites:** add/remove from cards and detail view; global, stackable notifications; **newest‑first** ordering with live relative time.
- **Resilient UI:** clear button to reset state; preserves selection; responsive layout.

## Tech stack
- **Frontend:** **React** (SPA), responsive styling (Bootstrap‑style or equivalent), global notification system.
- **Backend:** **Node.js (Express)**; REST under `/api/*`; serves static React build in production.
- **Auth/Security:** **JWT + HTTP‑only cookies**, **bcrypt**; CORS avoided by same‑origin serving.
- **Database:** **MongoDB Atlas** (users, favorites schemas).
- **External APIs:** **Artsy** (Authentication, Search, Artists, Artworks, Genes).
- **Hosting:** **Google Cloud** (App Engine or Cloud Run).

## Engineering highlights
- **Same‑origin** architecture eliminates CORS and simplifies cookies/session security.
- Cohesive domain model: favorites are denormalized for fast listing and ordering.
- Clean separation: `/api` routers for auth, favorites, and Artsy proxy; SPA assets from `/dist`.
- Attention to UX polish: notifications, disabled states, and predictable navigation.

## Live links
- **Home Page:** https://webtechassignment2-455603.uw.r.appspot.com/
- **Cloud Service (sample endpoint):** https://webtechassignment2-455603.uw.r.appspot.com/api/fetchArtistData?artistId=4d8b928b4eb68a1b2c0001f2

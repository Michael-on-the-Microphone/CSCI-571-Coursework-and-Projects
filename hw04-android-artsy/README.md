# Assignment 4 — Android (Kotlin / Jetpack Compose) + Artsy API

**Course context:** Completed as part of USC **CSCI 571 Web Technologies** (Spring 2025), under **Professor Marco Papa**.

## What this project is
An **Android** app (Jetpack Compose) that consumes the A3 backend. Users can **search artists**, view **details**, browse **artworks** (with a **categories** dialog), see **similar artists** when logged in, and manage **favorites**. Includes **login/register** with **persistent** session cookies.

## Key features
- Compose UI with App Bar, Search, Tabbed Details (**Details/Artworks/Similar**), and Favorites list on Home.
- **Coil** image loading with placeholders; dialog for **Categories** with loading states.
- **Auth flow:** Register/Login screens with validation and snackbars; profile dropdown for **Log out** / **Delete account**.
- Persistent auth using OkHttp **PersistentCookieJar** (SharedPreferences) for seamless relaunch.

## Tech stack
- **Kotlin**, **Jetpack Compose**, **Material Design 3**
- **Retrofit** + **OkHttp** (+ **PersistentCookieJar**), **kotlinx.serialization** (or Moshi)
- **Coil** for image loading
- Target: **Pixel 8 Pro**, **API 34**; backend: **A3** endpoints

## Engineering highlights
- Composable architecture with unidirectional data flow for predictable state.
- Network layer abstracts A3 endpoints; emulator‑safe base URL handling.
- Snackbars and relative‑time UI match the web experience for cross‑platform parity.

## Live link
- **Cloud Service (uses A3 backend):** https://webtechassignment2-455603.uw.r.appspot.com/api/fetchArtistData?artistId=4d8b928b4eb68a1b2c0001f2

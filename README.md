# VenueLookup

A responsive event-venue discovery prototype built with React, TypeScript, and Vite. It is designed to run locally without paid services, API keys, or a backend.

> **Prototype scope:** This deliverable is an offline, browser-only MVP. User actions are implemented with local business rules and browser `localStorage`; they are not sent to a Spring Boot API. Role selection is a demo convenience, not authentication or authorization. The requested Java/Spring Boot backend, persistent database, API docs, and production security are not included in this iteration. Java and Maven were unavailable in the build environment, so backend code could not be built or verified.

## Run locally (Windows)

Requirements: Node.js 20.19+ or 22.12+ and npm.

```powershell
cd C:\Users\admin\OneDrive\Desktop\WORK\VenueLookup
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Production build and preview:

```powershell
npm run build
npm run preview
```

Quality checks:

```powershell
npm run lint
npm run build
```

## GitHub Pages

The public demo is deployed from the `main` branch by the **Deploy VenueLookup to GitHub Pages** Actions workflow:

<https://vivekraj2205.github.io/VenueLookup/>

The workflow runs on pushes to `main` and can also be started manually from the repository’s **Actions** tab. It installs dependencies, runs lint and the production build, then deploys `dist/` to Pages. The Vite base path is configured for this repository name.

To confirm or change the Pages publishing source in GitHub, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**. The project data is demo-only, but Pages makes this site publicly accessible.

## Demo walkthrough

1. Use **Explore** or the homepage search to filter seeded venues by city, occasion, guest capacity, budget, and amenities. Sort by recommendation, price, or rating.
2. Open a venue to inspect its details and live price estimate; save it or add it to comparison.
3. Use **AI planner** to extract supported event, city, guest count, budget, and amenity terms from a natural-language request. Edit the extracted preferences and view ranked matches. The planner is a deterministic keyword simulator; no language model is connected.
4. Open **Dashboard** as the customer and submit a booking request from a venue detail page. The customer flow validates date, time range, and capacity, then saves the request locally.
5. Switch to **Venue owner** using the account menu, review and accept/reject eligible requests, or submit a new venue for moderation.
6. Switch to **Platform admin** and approve or reject pending venue listings.
7. Switch back to **Event planner** to check the booking and run a simulated deposit success or failure after an owner accepts it.

The role picker displays the sample identities: `alex@demo.com`, `jordan@demo.com`, and `admin@demo.com`. No passwords are used in this local demo. Seeded venue, booking, saved-space, role, and comparison state is stored in this browser under `venue-lookup-*` local-storage keys. Clearing those keys restores the original sample state.

## What is implemented

- Responsive marketplace landing page, venue cards, detail dialog, seeded venue imagery, pricing estimate, and amenity details.
- Backend-style search behavior implemented locally: city, event compatibility, capacity, budget, required amenities, and sorting.
- Deterministic planner extraction and transparent venue match explanations based on seeded fields.
- Saved venues and up-to-three-venue comparison persisted in local storage.
- Customer booking requests, capacity/date/time validation, booking status tracking, and demo payment success/failure states.
- Venue-owner listing submission and booking request actions; administrator listing moderation.
- Role-specific dashboards, sample activity, responsive layouts, empty states, accessible labels, and inline feedback.

## Known limitations

- No Spring Boot service, REST API, database, session/JWT security, real account registration, backend role enforcement, or API documentation.
- Browser storage is device-local and can be edited by the user; it is not suitable for real user or business data.
- Messaging, reviews, coupons, notifications, calendar availability/conflict checks, payment-provider integration, and full admin/user management are not implemented.
- Demo payment actions do not move money. Venue photography is loaded from Unsplash and needs an internet connection; the UI still works if an image fails to load.
- Demo account switching is intentionally not an authentication mechanism. Do not deploy this prototype as-is.

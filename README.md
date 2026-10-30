# Atlas — Expedition Log

Atlas is a responsive static website for a guided expedition company. The experience combines an editorial expedition catalog, field stories, destination discovery, and a prototype for finding or proposing group trips.

It also includes **Atlas SafeTrail**, a local-only safety workflow demonstration with simulated route coordinates, manual online/offline delivery state, trusted contacts, a contact preview, notifications, and an optional check-in timer.

## Technologies

- Semantic HTML5
- CSS3 responsive layouts, transitions, and reduced-motion support
- Vanilla JavaScript and a small service worker for filters, sensor access, local story storage, dialogs, and offline shell caching
- Device Orientation API where supported by the browser and device
- Browser `localStorage` for locally saved experience stories
- Browser `localStorage` for SafeTrail demo contacts, session, queue, notifications, and location history
- Google Fonts and Unsplash-hosted photography

## Run locally

No build step or package installation is required. Open `index.html` in a browser or serve this folder with a static file server. On a secure host, the service worker caches the local HTML, CSS, and JavaScript shell after the first online visit and the static interface remains available offline. Opening the file directly does not enable service-worker caching. Remote photography and web fonts need an internet connection and are not cached offline.

## Prototype behavior and limitations

- **Themes:** Forest and Night color themes are available in the main navigation. The selected theme is saved in this browser.

- **Experience stories:** New stories and uploaded image data are saved in this browser's `localStorage`. They are not uploaded, public, or synchronized across devices. Browser storage may be cleared or full; image uploads are limited to three images at 800 KB each to reduce storage failures.
- **Atlas Connections:** Destination cards and sample group schedules are illustrative. Join requests are simulated and are not sent to organizers. Proposed trips appear only in the current page session and are not published or saved.
- **SafeTrail:** Coordinates follow the selected illustrative route; the app never requests real location permission. The online/offline switch is a manual simulation, while the separate connectivity test reads `navigator.onLine`. Queued items, contact preferences, and notifications are local browser data. No email, SMS, push notification, emergency alert, or real synchronization is performed. SafeTrail is not a secure location database or an emergency service.
- **Safety and privacy:** Use public meeting areas, verify trip organizers independently, and share plans with someone you trust. Avoid entering private contact information or personal addresses.
- **Inquiry form:** This is a frontend demo. It validates in the browser and displays a confirmation, but does not send or store inquiries.

## Repository and deployment

Public repository: <https://github.com/windchime0805/atlas-expedition-website>

The repository includes a GitHub Actions workflow at `.github/workflows/pages.yml`. To publish with GitHub Pages, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source. GitHub Pages will show the site URL after the workflow succeeds. No deployment is claimed by this README until Pages is configured and the workflow completes.

## SafeTrail demo walkthrough

1. Choose a destination and start a session.
2. Use **Record demo location now** to add simulated points without waiting for the interval timer.
3. Switch the manual network simulation offline, record several points, then return demo network online to synchronize the pending queue.
4. Add or remove demo contacts and toggle who receives simulated updates. Use **Trusted Contact View** to preview only records marked as delivered to that contact.
5. Try the notification read controls and optional local check-in reminder.

The service worker caches the local page shell for repeat offline visits on HTTPS. Photos and fonts remain external. SafeTrail data uses browser `localStorage`, which is editable, can be cleared, and is not suitable for real sensitive tracking.

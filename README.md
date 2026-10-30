<div align="center">
  <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=88" alt="Sunlight on a line of high alpine peaks" width="100%">
  <h1>ATLAS | EXPEDITION LOG</h1>
  <p><strong>Small teams. Far horizons. Go a little further.</strong></p>
  <p>A responsive editorial site for guided journeys into the world's wild places.</p>
  <p>
    <a href="https://github.com/windchime0805/atlas-expedition-website"><img alt="HTML5" src="https://img.shields.io/badge/HTML5-semantic-E76532?style=flat-square&logo=html5&logoColor=white"></a>
    <img alt="CSS3" src="https://img.shields.io/badge/CSS3-responsive-4B789C?style=flat-square&logo=css3&logoColor=white">
    <img alt="Vanilla JavaScript" src="https://img.shields.io/badge/JavaScript-vanilla-C9A24A?style=flat-square&logo=javascript&logoColor=white">
    <img alt="No frameworks" src="https://img.shields.io/badge/framework-none-0B211C?style=flat-square">
  </p>
</div>

---

## The field guide

Atlas pairs a forest-green and warm-paper visual system with large landscape photography, condensed editorial headlines, and quiet field-note details. The site includes an expedition catalog, an inquiry form, traveler stories, destination and group-trip discovery, and **SafeTrail**, a local-only safety workflow prototype.

<table>
  <tr>
    <td width="33%"><img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=700&q=80" alt="Mountain lake below a rugged alpine range"></td>
    <td width="33%"><img src="https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=700&q=80" alt="Green mountain valley opening toward a distant trail"></td>
    <td width="33%"><img src="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=700&q=80" alt="Northern lights above a mountain landscape"></td>
  </tr>
</table>

## Explore

- **Expeditions** — browse six journeys and filter them by difficulty.
- **Field stories** — open sample reflections or save your own story and up to three photos in this browser.
- **Atlas Connections** — explore illustrative destinations and proposed group trips.
- **SafeTrail** — preview simulated route check-ins, offline queue behavior, notifications, and trusted-contact views.
- **Forest / Night themes** — choose a palette from the navigation; the preference is saved in this browser.
- **Hero motion** — the landscape image slowly zooms in and out. The animation is disabled when the device requests reduced motion.

## Built with

- Semantic HTML5
- CSS3, responsive layouts, and reduced-motion support
- Vanilla JavaScript
- Browser `localStorage` for local story and SafeTrail prototype data
- A small service worker for caching the static site shell on supported secure hosts
- Unsplash photography and Google Fonts

## Run locally

No package installation or build step is needed.

1. Clone or download this repository.
2. Open `index.html` in a browser, or run a static server from the project folder.
3. For service-worker caching, use `localhost` or an HTTPS host. Opening the file directly does not enable service workers.

The layout and app shell can be revisited offline after the shell is cached. Remote photography and fonts still need an internet connection.

## Prototype notes

- **Field stories:** New stories and uploaded image data stay in this browser's `localStorage`. They are not uploaded, public, or synchronized between devices. Storage can be cleared or run out; uploads are limited to three images at 800 KB each.
- **Atlas Connections:** Sample destinations and group schedules are illustrative. Join requests are simulated, and proposed trips are not published or persisted.
- **SafeTrail:** All route coordinates are simulated; the site never requests real location permission. The online/offline control is a demo switch. No email, SMS, push notification, emergency alert, or real synchronization occurs. SafeTrail is not a secure tracking service or an emergency service.
- **Privacy and safety:** Avoid entering private contact details or personal addresses. Verify organizers independently, choose public meeting points, and share plans with someone you trust.
- **Inquiry form:** This frontend demo validates the form and displays a confirmation. It does not send or save inquiries; a backend would be needed for that.

## Publish with GitHub Pages

The repository contains a GitHub Actions workflow at `.github/workflows/pages.yml`.

1. Push the project to GitHub.
2. In repository **Settings — Pages**, choose **GitHub Actions** as the deployment source.
3. Confirm the workflow completes successfully, then use the Pages URL shown in repository settings.

A deployment is not claimed here; GitHub Pages must be configured and the workflow must succeed first.

## SafeTrail demo walkthrough

1. Choose an illustrative destination and start a session.
2. Use **Record demo location now** to add a simulated point immediately.
3. Switch the demo network offline, record a few points, then switch it online to simulate queue synchronization.
4. Add or remove demo contacts and adjust their simulated update preferences.
5. Open **Trusted Contact View** to preview updates marked as delivered, then explore notification and check-in controls.

All SafeTrail records are local browser data. They can be edited or cleared and should not be used for real-world tracking.

---

<div align="center">
  <sub>Made for the long way around — <a href="https://github.com/windchime0805/atlas-expedition-website">View the repository</a></sub>
</div>

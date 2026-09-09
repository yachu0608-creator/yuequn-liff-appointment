# LINE LIFF frontend setup

This project initializes the official `@line/liff` SDK without requiring a backend.

## LIFF ID

The shared value is stored in `.env` and the deployment value is repeated in `.env.production`:

```env
VITE_LIFF_ID=7554812
```

For a developer-specific local override, create `.env.local` with the same variable. A LIFF ID is a public frontend identifier; never place a Channel Secret, channel access token, or other credential in any `VITE_` variable.

## Runtime behavior

- `src/liff.ts` calls `liff.init()` when the High-fi entry loads.
- Inside LINE, it exposes `isInClient`, login state, OS, and the in-memory profile returned by `liff.getProfile()` when the user is already logged in.
- Outside LINE, automatic login is disabled and the existing website continues normally.
- No profile or token is written to storage or sent to a server.
- The document attributes `data-liff-status` and `data-liff-environment` can be inspected during testing.

## GitHub Pages

1. Push the repository to GitHub with `main` as the deployment branch.
2. Open **Settings → Pages → Build and deployment** and choose **GitHub Actions**.
3. The workflow `.github/workflows/deploy-pages.yml` builds `dist-high-fi` with the repository base path and deploys it over HTTPS.
4. Wait for the `Deploy LIFF frontend to GitHub Pages` workflow to finish.

For a project repository, the appointment endpoint will be:

```text
https://YOUR-GITHUB-USER.github.io/YOUR-REPOSITORY/high-fi/?liff=appointment
```

Use that exact HTTPS URL as the **Endpoint URL** in LINE Developers. Keep the path and `liff=appointment` query parameter unchanged. URL fragments are not used.

## Testing

1. Confirm the GitHub Pages endpoint opens in a normal browser and the appointment flow still works.
2. Open `https://liff.line.me/7554812` from LINE. LINE redirects to the configured Endpoint URL.
3. In LINE, confirm the page opens in the LIFF browser and the UI remains usable.
4. For local inspection, open browser developer tools and check the `<html>` element:
   - `data-liff-status="ready"`
   - `data-liff-environment="line"` inside LINE
   - `data-liff-environment="browser"` in a normal browser

This stage intentionally does not submit appointment data and does not include a database, backend API, admin interface, Channel Secret, or access token.

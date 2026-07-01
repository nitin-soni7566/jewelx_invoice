# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally
- `npx oxlint` — lint (config: `.oxlintrc.json`); there is no separate `lint` npm script
- No test suite/framework is configured in this repo

## Architecture

This is a single-page jewellery invoice generator built with React 19 + Vite, styled with Tailwind CSS. It has no backend, no routing, and no persistence — all state lives in memory for the current browser session.

Nearly the entire application is one component: `src/App.jsx`. It renders two mutually exclusive views controlled by a single `tab` state (`'form'` | `'preview'`):

- **`form` tab**: editable inputs for shop details, bank/UPI details, gold/silver rates, invoice metadata, buyer details, and a dynamic list of line items.
- **`preview` tab**: a read-only, print-formatted rendition of the invoice (id=`invoice`), styled to look correct both on screen and via `window.print()`.

Key data flow / logic in `App.jsx`:
- `items` is an array of line-item objects; `updateItem(id, field, val)` mutates one item and recomputes its `amount` via `calcAmount()` on every change (net weight × rate/gram + making charge, as fixed ₹/g or percent).
- Invoice totals (subtotal, discount, taxable amount, CGST/SGST, round-off, grand total) are derived directly in the component body on every render — not memoized, recomputed from `items`/`discount`/`cgstRate`/`sgstRate` each time.
- `numToWords()` converts the rounded total to Indian-English words (Lakh/Crore grouping) for the printed "Amount in Words" line.
- A UPI deep link (`upiString`) is built from shop UPI ID + rounded total and rendered as a QR code via `qrcode.react` (`QRCodeSVG`) so buyers can scan-to-pay.
- `handlePrint()` switches to the preview tab, then calls `window.print()` after a short timeout to let the DOM update first.
- Print-specific CSS lives in `src/index.css` under `@media print` (hides `.no-print` elements, strips shadows from `.print-area`).

There is a small reusable `Field` component (label + input) used throughout the form tab; everything else is inlined JSX rather than split into subcomponents.

`defaultShop`/`defaultBuyer`/initial `items` in `App.jsx` are hardcoded seed data (a real shop's details) used to pre-fill the form — replace or clear these when adapting for a different business.

`src/App.css` is unused leftover boilerplate from the default Vite React template (not imported by `App.jsx`) — `src/index.css` is the stylesheet actually in use.

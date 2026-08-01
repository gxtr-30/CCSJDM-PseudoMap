# CCSJDM Campus Navigator

A static, client-side web app that helps students, visitors, and faculty locate rooms, offices, buildings, and facilities inside the **City College of San Jose Del Monte** campus.

> **No backend. No database. No build tools.**  
> Pure HTML + CSS + Vanilla JS. Hosted on GitHub Pages.

---

## Live Demo

Once deployed: `https://<your-username>.github.io/<repo-name>/`

---

## Features

- **Smart search** — type a room name, office, or building and instantly find it
- **Fuzzy matching** — handles typos ("registar" → Registrar), partial words, aliases
- **Interactive campus map** — clickable 3D buildings with zoom, pan, and route lines
- **Walking directions** — step-by-step guide from the nearest gate to any location
- **Category browsing** — filter by Offices, Academic, Facilities, Parks, Sports, etc.
- **Dark mode toggle** — reads system preference, persists your choice
- **Responsive** — works on desktop, tablet, and mobile (bottom-sheet info panel on phone)
- **Excel-driven data** — edit `campus_data.xlsx` in Excel, re-export as CSV, and the site updates on refresh

---

## Project Structure

```
ccsjdm-campus-navigator/
├── index.html              ← single-page entry point
├── css/
│   ├── style.css           ← theme, layout, glassmorphism, animations
│   ├── map.css             ← campus map: shapes, markers, routes, controls
│   └── mobile.css          ← responsive breakpoints, bottom-sheet
├── js/
│   ├── app.js              ← bootstrap, wires everything together
│   ├── data.js             ← seed data, categories, runtime store
│   ├── excel.js            ← loads XLSX (SheetJS) or CSV fallback
│   ├── map.js              ← SVG map rendering, zoom/pan, route drawing
│   ├── search.js           ← smart search engine with fuzzy matching
│   ├── ui.js               ← suggestions, info panel, chips, toast
│   └── vendor/
│       └── xlsx.full.min.js ← SheetJS CDN stub (app uses CDN at runtime)
├── assets/
│   ├── images/             ← (placeholder — add campus photos here)
│   ├── icons/              ← (placeholder — add favicons here)
│   └── map/
│       └── campus.svg      ← campus map image (3D-style block drawing)
├── data/
│   ├── campus_data.xlsx    ← THE source of truth (edit in Excel)
│   └── campus_data.csv     ← auto-generated CSV fallback
├── tools/
│   └── generate-data.js    ← rebuilds .xlsx + .csv from seed rows
└── README.md
```

---

## Quick Start (Local)

1. Clone the repo:
   ```bash
   git clone https://github.com/<you>/ccsjdm-campus-navigator.git
   cd ccsjdm-campus-navigator
   ```

2. Open `index.html` in your browser.  
   That's it — no server needed, everything runs from `file://`.

> **Note:** If the XLSX file doesn't load locally (CORS), the app automatically falls back to the CSV file. Both contain identical data.

---

## Deploying to GitHub Pages

### Step-by-step:

1. **Create the repo** on GitHub (you already did this).

2. **Push your files:**
   ```bash
   cd ccsjdm-campus-navigator
   git add .
   git commit -m "Initial commit: CCSJDM Campus Navigator"
   git remote add origin https://github.com/<you>/ccsjdm-campus-navigator.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repo → **Settings** → **Pages**
   - Under **Source**, select **Deploy from a branch**
   - Branch: `main` / Folder: `/ (root)`
   - Click **Save**

4. **Wait 1–2 minutes.**  
   GitHub will build your site. The URL will appear at the top of the Pages settings:
   ```
   https://<you>.github.io/ccsjdm-campus-navigator/
   ```

5. **That's it!** Every push to `main` auto-deploys.

---

## Editing Campus Data

### Option A: Edit the Excel file (recommended)

1. Open `data/campus_data.xlsx` in Microsoft Excel.
2. Add/edit/remove rows. Each row = one location.
3. **Save As** → `CSV UTF-8 (Comma delimited)` → overwrite `data/campus_data.csv`.
4. Commit and push both files.

### Option B: Edit the seed rows in code

1. Open `js/data.js` and edit the `SEED_ROWS` array.
2. Run the generator to rebuild both data files:
   ```bash
   node tools/generate-data.js
   ```
3. Commit and push.

### Excel Columns (exact headers)

| Column | Description | Example |
|---|---|---|
| `Keyword` | Primary search term | `Registrar` |
| `Alias` | Alternative search terms (comma-separated) | `Enrollment, Records` |
| `Building` | Parent building name | `Main Building` |
| `Floor` | Floor number or name | `1` or `Basement` |
| `Room` | Room/office name (displayed) | `Registrar` |
| `Category` | One of: Office, Academic, Building, Facility, Park, Sports, Service, Restroom, Shop | `Office` |
| `Description` | What this location is for | `Handles enrollment…` |
| `Nearby` | Landmarks nearby | `Gallery Walk` |
| `Directions` | Walking guide from gate | `Enter Main Building then 1st Floor` |
| `Latitude` | Optional Y coordinate on the map | `400` |
| `Longitude` | Optional X coordinate on the map | `810` |

> **Tip:** The Latitude/Longitude values are map coordinates on a 1000×700 grid. See [Map Coordinates](#map-coordinates) below.

---

## Adding a New Building

1. Add a row to `campus_data.xlsx` with `Room` = building name and `Category` = `Building`.
2. Add a footprint path to `FOOTPRINTS` in `js/map.js` (SVG `<path>` data).
3. Place a marker coordinate (`Latitude`/`Longitude` columns) near the building center.
4. Regenerate CSV if needed: `node tools/generate-data.js`.
5. Commit and push.

---

## How the Search Works

The search engine in `js/search.js` uses a multi-layer scoring system:

1. **Exact name match** (highest priority) — `"Library"` → Library
2. **Word-boundary match** — `"park"` prefers "Campus Park" (exact word) over "Parking Area" (word prefix)
3. **Alias matching** — comma-separated aliases are checked individually: `"enroll"` → Registrar
4. **Fuzzy/typo tolerance** — Levenshtein distance + Jaro-Winkler similarity: `"registar"` → Registrar
5. **Multi-word queries** — `"computer lab"` checks that every token appears somewhere: `"library 3rd"` → Library

---

## Map Coordinates

All map positions use a **1000 × 700** coordinate grid that maps 1:1 onto the SVG viewBox in `assets/map/campus.svg`.

To find coordinates for a new location:

1. Open `assets/map/campus.svg` in a browser or SVG editor.
2. Find the X, Y position of the building.
3. Put `X` in the `Longitude` column and `Y` in the `Latitude` column of the Excel file.

The campus map (`campus.svg`) is a schematic drawing. To replace it with a real campus image:

1. Keep the `width="1000" height="700" viewBox="0 0 1000 700"` attributes.
2. Place your image as the first child element (it fills the background automatically).
3. Update `FOOTPRINTS` paths and marker coordinates to match.

---

## Customizing the Design

### Colors

Edit the CSS custom properties in `css/style.css`:

```css
:root {
  --blue-600: #2563eb;   /* primary accent */
  --blue-700: #1d4ed8;   /* darker accent */
  --ink-900: #0f172a;    /* text color */
  --bg: #f4f7fb;         /* page background */
}
```

### Dark Mode

Dark mode colors are in `[data-theme="dark"]` in the same file. Toggle is saved in `localStorage`.

### Building Footprints

Each building has an SVG path in the `FOOTPRINTS` object in `js/map.js`. Edit these to match a real campus map.

### Categories

Add or reorder categories in the `CATEGORIES` array in `js/data.js`.

---

## Tech Stack

| Technology | Role |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling, animations, glassmorphism, dark mode |
| Vanilla ES6 | All application logic |
| SheetJS (CDN) | Reads `.xlsx` files in the browser |
| SVG | Campus map rendering |
| CSV | Fallback data format (auto-generated) |

**Zero dependencies. Zero build step. Zero backend.**

---

## Browser Support

- Chrome / Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari / Chrome on iOS/Android

---

## License

Free to use and modify for City College of San Jose Del Monte.

# Spot Research

## Task 1 — Original Sdot Yam VWS station descriptions

### Finding: the descriptive titles never existed in git history

I walked every commit in the repo that touches the `wind.co.il/weather/lab/vws*.jpg` images. In every historical version the alt/title text was a placeholder — NOT a descriptive sensor name. The "VWS 739 / VWS 1325 / ..." generic labels in the current `index.html` are not a regression from a previous descriptive version in git; the descriptive titles the user remembers came from the wind.co.il page itself (which rendered Hebrew station labels next to each image), not from this repo.

Evidence per commit (all the VWS-bearing revisions of `index.html` / `oceanstatus.html`):

| Commit | File | Alt / title text used |
|---|---|---|
| `8d82889` first version | oceanstatus.html | no VWS images yet |
| `7ef0857` Rename oceanstatus.html to index.html | index.html | `alt="alt_text"` for every vws*.jpg and broadcast.jpg |
| `3a9896b` Rename OceanStatus.html | index.html | `alt="alt_text"` for every image |
| `1ed3659` fix alignment of gallery | index.html | `alt="Lights"` for every image (Bootstrap template placeholder) |
| `f6f43b1` update analytics, fix images refresh | index.html | `alt="Lights"` for every image |
| `f3b5a16` Rebrand to GUSTON | index.html | first appearance of generic `VWS 739 / VWS 1325 / ...` labels |
| `99d31e5` UI overhaul | index.html | same generic labels |
| `cc7107a` (HEAD) | index.html | same generic labels |

Stations that appear across history (for reference):

- `broadcast.jpg` — always present, labelled "Lights" / "alt_text" historically; currently "Broadcast · Sdot Yam master"
- `vws736.jpg` — present in older commits (`1ed3659`, `3a9896b`, `7ef0857`), dropped in current version
- `vws737.jpg`, `vws738.jpg`, `vws741.jpg`, `vws743.jpg` — present throughout
- `vws739.jpg`, `vws740.jpg`, `vws758.jpg` — present in `7ef0857` only
- `vws1325.jpg` — present throughout

### What to do

Because git does not contain the original descriptive titles, they have to be recovered from the source page `https://lab.wind.co.il/weather/` (or `https://wind.co.il/weather/lab/`). Automated fetching is blocked (403 / 404 from this environment), so the staff engineer should:

1. Open `https://lab.wind.co.il/weather/` in a browser and read the Hebrew label rendered next to each `vws*.jpg` thumbnail. Those labels are the "original descriptions" the user remembers (things like "צפוני / פנים לגונה / חיצוני / ..." — north, inside lagoon, outside, etc.).
2. Or ask the user directly — they know the mapping by heart.

Suggested replacement markup shape (once titles are known):

```html
<div class="vws-label"><span class="live-dot"></span><Hebrew name> &middot; <English gloss></div>
```

This section of `index.html` to update is around lines 2152–2194.

---

## Task 2 — Windguru station IDs and Windy coordinates for IL kite spots

Existing widget uses Beit Yanai station `895899`. The other three are currently using generic regional forecasts, which is why only Beit Yanai "works".

### 1. Hof Hatzuk — Herzliya (חוף הצוק)

- **Spot name**: Hof Hatzuk / Hatzuk Beach, Herzliya
- **Windguru station ID**: Windguru does **not** host a station named "Hatzuk" specifically. The closest live Herzliya kite/windsurf stations are:
  - `507461` — "חוף צופי ים - הרצליה / HERZLIA SEA SCOUTS" (live station 73) — this is the sea-scouts beach which is effectively the Hatzuk kite spot (same stretch of coast, ~800 m south of Hatzuk). **Best match**, verified live.
  - `2354` — generic "Herzliyya" (GFS-only, no live sensor)
  - `880653` / `567856` — Marina Herzliya stations (wrong location, behind breakwater)
- **Recommended**: use `507461` (Herzlia Sea Scouts) — it is the live station closest to the Hatzuk kite break.
- **Windguru URL**: `https://www.windguru.cz/507461`
- **Windy marker (Hof Hatzuk)**: **lat 32.1830, lon 34.7955**
- **Confidence**: best-guess for the station (Windguru has no entry literally named "Hatzuk"); Sea Scouts is the nearest live sensor and the one Israeli kiters actually watch for Hatzuk conditions.

### 2. Hof Hilton — Tel Aviv (חוף הילטון)

- **Spot name**: Hilton Beach Tel Aviv / Hof Hilton
- **Windguru station ID**: `307083` — titled exactly "hilton tel aviv"
- **Windguru URL**: `https://www.windguru.cz/307083`
- **Alternate / fallback**: `308` = generic "Tel-Aviv" (GFS only, no sensor)
- **Windy marker (Hilton Beach TLV)**: **lat 32.0880, lon 34.7688**
- **Confidence**: verified (exact name match on Windguru)

### 3. Bat Yam kite beach — Tayo Beach (חוף טאיו)

- **Spot name**: Tayo Beach, Bat Yam (חוף טאיו, בת ים). Confirmed via KDI's official IL kite-spot list (`kdi.org.il/en/info/forecasts-israel/midseaforecast`) which lists the Bat Yam kite spot as "Bat Yam (Taio Beach)". This is the beach the kiting community uses in Bat Yam — not Riviera, not the main beach.
- **Windguru station ID**: `952215` — titled "Tayo Beach - Bat Yam"
- **Windguru URL**: `https://www.windguru.cz/952215`
- **Fallback**: `769` generic "Bat Yam" (GFS only)
- **Windy marker (Tayo Beach, Bat Yam)**: **lat 32.0125, lon 34.7370**
- **Confidence**: verified (Windguru station literally named Tayo Beach - Bat Yam; KDI confirms this is the kite spot).

### 4. Sdot Yam (שדות ים)

- **Spot name**: Sdot Yam / Cesarea — Freegull Sea Sports
- **Windguru station ID**: `905468` — titled "Cesarea Sdot Yam, Freegull Sea Sports" (live station, operated by Freegull surf/kite school on the Sdot Yam beach itself)
- **Windguru URL**: `https://www.windguru.cz/905468`
- **Alternates**:
  - `279262` — "Sdot Yam - Freegull" (older ID, may be same physical sensor — prefer 905468)
  - `371238` — "Caesarea - Sdot Yam" (GFS only)
- **Windy marker (Sdot Yam beach / Freegull)**: **lat 32.4870, lon 34.8820**
- **Confidence**: verified (Freegull is the Sdot Yam kite club; this is the correct station).

### Paste-ready widget IDs

```
Beit Yanai    : 895899   (existing, keep)
Hof Hatzuk    : 507461   (Herzlia Sea Scouts — closest live sensor)
Hof Hilton    : 307083   (hilton tel aviv)
Tayo Bat Yam  : 952215   (Tayo Beach - Bat Yam)
Sdot Yam      : 905468   (Cesarea Sdot Yam, Freegull Sea Sports)
```

### Paste-ready Windy lat/lon for map markers

```
Hof Hatzuk   : 32.1830, 34.7955
Hof Hilton   : 32.0880, 34.7688
Tayo Bat Yam : 32.0125, 34.7370
Sdot Yam     : 32.4870, 34.8820
Beit Yanai   : 32.3920, 34.8570   (for reference)
```

### Sources

- https://www.windguru.cz/507461 — Herzlia Sea Scouts
- https://www.windguru.cz/307083 — hilton tel aviv
- https://www.windguru.cz/952215 — Tayo Beach - Bat Yam
- https://www.windguru.cz/905468 — Cesarea Sdot Yam, Freegull Sea Sports
- https://www.kdi.org.il/en/info/forecasts-israel/midseaforecast — KDI IL kite spot list (confirms Tayo Beach as the Bat Yam kite spot)

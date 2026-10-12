# 🌍 SatQuery — Satellite Change Detection & 3D Topographic Analytics

SatQuery is a production-grade, full-stack satellite change detection and 3D topographic analytics web application. It empowers casual users, investigative journalists, and environmental researchers to select any geographic area on Earth, analyze multi-temporal satellite imagery across chosen years, and instantly comprehend surface dynamics.

---

## 🌟 Key Features

1. **Interactive Geospatial Canvas:**
   - **2D Map Viewport:** High-resolution satellite and topographic basemaps with custom polygon/AOI drawing tools and dynamic spectral change heatmap overlays.
   - **2D Split-Curtain Swiper:** Draggable vertical divider comparing baseline imagery ($T_1$) with target imagery ($T_2$ / heatmap) with synchronized viewport interaction.
   - **3D Topographic Mesh (Three.js):** Real surface terrain extrusion with directional sunlight controls, terrain exaggeration slider, wireframe toggle, and spectral change draping.

2. **Multi-Spectral Differencing Engine:**
   - **NDVI:** Normalized Difference Vegetation Index ($\frac{NIR - RED}{NIR + RED}$) for deforestation, drought, and agricultural expansion.
   - **NDBI:** Normalized Difference Built-up Index ($\frac{SWIR - NIR}{SWIR + NIR}$) for urban sprawl, industrial hubs, and infrastructure expansion.
   - **NDWI:** Normalized Difference Water Index ($\frac{GREEN - NIR}{GREEN + NIR}$) for lake shrinkage, flood inundation, and reservoir shifts.
   - **Sentinel-1 SAR:** Cloud-penetrating synthetic aperture radar backscatter difference ($VV/VH$) for all-weather analysis.

3. **Automated AI Attribution Engine ("The Why Engine"):**
   - Correlates spectral delta percentages with secondary empirical datasets:
     - **NASA FIRMS:** Active thermal anomaly & wildfire cluster tracking.
     - **OpenStreetMap Overpass API:** Linear road extensions and building footprint additions.
   - Synthesizes findings using Google Gemini (`gemini-2.5-flash`) into concise headlines, causal drivers, and confidence scores.

4. **Reverse "Find-the-Change" Search:**
   - Semantic natural language pattern queries (e.g., `"shrinking lakes"`, `"deforestation by fire"`, `"industrial growth"`, `"glacier retreat"`).
   - Pre-seeded with 50+ globally recognized environmental hotspots (Aral Sea, Amazon Basin, Dubai Palms, Oragadam Corridor, Lake Mead, Ilulissat Glacier, etc.) plus global OSM Nominatim geocoding.

5. **Predictive 2035 Trajectory & Tamper-Proof Audit Dossier:**
   - Cellular trend projections for 2028, 2030, and 2035.
   - Cryptographic SHA-256 hash signatures certifying analysis integrity with printable PDF / JSON export.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14+ (App Router, TypeScript, Tailwind CSS, Lucide Icons, Leaflet, Three.js).
- **Backend:** Python 3.11+ FastAPI (asynchronous, Pydantic v2 schemas).
- **Remote Sensing Processing:** Google Earth Engine (`earthengine-api`) with built-in high-fidelity scientific mock fallback.
- **Geospatial Compute:** `shapely`, `numpy`, `pillow`, `rasterio`.
- **AI Intelligence:** Google GenAI SDK (`gemini-2.5-flash`).
- **Data & Containers:** PostgreSQL + PostGIS, Redis, Docker & Docker Compose.

---

## 🚀 Quick Start

### Option A: Local Development (Fastest)

#### 1. Backend Setup
```bash
cd satquery/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API will be running at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

#### 2. Frontend Setup
```bash
cd satquery/frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

### Option B: Docker Compose
```bash
cd satquery
docker compose up --build
```
Open `http://localhost:3000` to interact with SatQuery.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:
```ini
GEE_PROJECT_ID=satquery-cloud
GEE_SERVICE_ACCOUNT=satquery-runner@satquery-cloud.iam.gserviceaccount.com
GEE_PRIVATE_KEY_JSON_BASE64=
GEMINI_API_KEY=your_gemini_api_key_here
NASA_FIRMS_MAP_KEY=your_nasa_firms_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
*Note: Both Google Earth Engine and Gemini include built-in intelligent fallback engines so you can test all features without requiring active cloud credentials.*

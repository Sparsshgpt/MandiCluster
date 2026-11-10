# MandiCluster

### Agricultural Market Segmentation & Price-Pattern Intelligence Platform
**Tagline:** *Discover Markets. Understand Prices. Make Informed Decisions.*

MandiCluster is an agricultural market intelligence web application designed to help farmers and analysts understand agricultural market prices, discover similarities between mandis, analyze historical price patterns, identify unusual price observations, and compare potential selling destinations.

The platform applies unsupervised machine learning algorithms to group agricultural markets with similar price behavior and presents the results through clean, interactive visualizations.

---

## 1. Core Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React, i18next (English, Hindi, Punjabi)
- **Backend API:** Python 3.11, FastAPI, Pydantic, Uvicorn
- **Machine Learning & Analytics:** Scikit-learn, Pandas, NumPy, SciPy
- **Deployment Target:** Vercel (React Frontend + Python Serverless API)

---

## 2. Unsupervised Machine Learning Modules

MandiCluster implements 8 core unsupervised machine learning models and 3 validation metrics:

| Task | Algorithms | Description |
| :--- | :--- | :--- |
| **Market Clustering** | **K-Means**, **MiniBatch K-Means**, **Hierarchical Agglomerative**, **DBSCAN** | Groups mandis by statistical feature vectors (Mean, Median, Standard Deviation, CV %, Trend Slope, and Average Arrivals). |
| **Clustering Evaluation** | **Inertia / WCSS**, **Silhouette Score**, **Davies–Bouldin Index** | Evaluates cluster compactness, boundary separation, and optimal cluster count ($K$) via the Elbow method. |
| **Dimensionality Reduction** | **PCA** (Linear) vs. **t-SNE** (Non-linear) | Visualizes high-dimensional mandi feature vectors in 2D space on identical observations. |
| **Anomaly Detection** | **Isolation Forest**, **Local Outlier Factor (LOF)** | Identifies historical price shocks, weather gluts, and unusual market arrival anomalies. |
| **Decision Support** | **Logistics Net Price Calculator** | Calculates net proceeds after road freight costs to compare potential destination mandis. |

---

## 3. Project Directory Structure

```text
MandiCluster/
├── api/                                # FastAPI Backend
│   ├── index.py                        # API routes & serverless entrypoint
│   ├── schemas/models.py               # Pydantic data schemas
│   ├── data/
│   │   ├── agmarknet_sample.csv        # Realistic Indian mandi dataset (4,482 records)
│   │   └── ingestion.py                # CSV validation, column standardization, cleaning
│   └── ml/                             # Scikit-learn ML implementations
│       ├── features.py                 # Statistical feature engineering
│       ├── clustering.py               # KMeans, MiniBatch, Agglomerative, DBSCAN
│       ├── evaluation.py               # Elbow curve, Silhouette, Davies-Bouldin
│       ├── dim_reduction.py            # PCA vs t-SNE side-by-side
│       ├── anomaly.py                  # Isolation Forest & LOF
│       └── recommendation.py           # Freight-adjusted net proceeds
├── src/                                # React Frontend
│   ├── components/                     # Reusable UI components & layouts
│   ├── pages/                          # Application pages (Home, Clustering, Anomaly, etc.)
│   ├── i18n/                           # English, Hindi, Punjabi multilingual support
│   ├── services/api.ts                 # Typed API client
│   └── types/index.ts                  # TypeScript data interfaces
├── tests/
│   └── test_backend.py                 # Automated backend test suite
├── vercel.json                         # Vercel deployment & rewrite configuration
├── requirements.txt                    # Python serverless dependencies
├── package.json                        # Node.js dependencies & scripts
└── vite.config.ts                      # Vite build & local dev proxy configuration
```

---

## 4. Local Development Setup

### Prerequisites
- Node.js (v18+) & npm
- Python (3.10+)

### 1. Backend Setup
From the project root:
```bash
# Run tests to verify ML pipeline
python tests/test_backend.py

# Start FastAPI development server
python -m uvicorn api.index:app --reload --port 8000
```
API documentation is available at `http://localhost:8000/docs`.

### 2. Frontend Setup
In a separate terminal:
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The application will be available at `http://localhost:3000`.

---

## 5. Vercel Deployment Instructions

The application is pre-configured for a single-project deployment on Vercel:

1. **Push to GitHub:**
   - Initialize git (if not already done), commit the project, and push to a GitHub repository.
2. **Import to Vercel:**
   - Log in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Select your MandiCluster GitHub repository.
3. **Build & Output Settings:**
   - **Framework Preset:** Vite (automatically detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Deploy:**
   - Click **Deploy**. Vercel will build the React frontend and automatically mount `api/index.py` as a serverless Python function.

---

## 6. Vercel Serverless Limitations for ML

When hosting ML workloads on Vercel's serverless infrastructure, note the following platform characteristics:

1. **Stateless / Ephemeral Filesystem:**
   - Serverless functions do not persist local files across invocations. Uploaded CSV datasets are stored in-memory during the warm container session.
2. **Execution Timeout:**
   - Serverless functions have execution limits (10s on Hobby, 60s on Pro). The current algorithms and sample dataset (4,482 rows) execute in < 0.5s, well within these limits.
3. **Bundle Size Limit:**
   - Serverless functions have a 250 MB uncompressed limit. The included packages (`scikit-learn`, `scipy`, `pandas`, `numpy`) fit within this quota.
4. **Cold Starts:**
   - The first request to a cold Python serverless function takes ~2–3 seconds while Python loads binary dependencies, after which subsequent calls remain fast.

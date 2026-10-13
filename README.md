# QUANTUMON: Quantum Kernel Intelligence for Cancer Research

> **Qiskit Fall Fest 2026 — Domain 2: Quantum Kernel Learning for Cancer Prediction**  
> *A scientific research web platform evaluating quantum feature map decision boundaries against tuned classical baselines.*

---

## 1. Executive Summary

**QUANTUMON** evaluates whether Qiskit parameterized quantum feature maps ($\text{ZZFeatureMap}$) can map multi-omic and clinical cancer signatures into higher-dimensional Hilbert spaces to discover non-linear decision boundaries inaccessible to classical models.

The platform rigorously benchmarks candidate **Quantum-Kernel Support Vector Machines (QSVC)** against two established classical baselines:
1. **Gaussian Radial Basis Function SVM (RBF SVM)**
2. **XGBoost Gradient Boosted Decision Trees**

### Supported Research Tasks
- **TCGA-LUAD EGFR Activating Mutation Status**: Predicting exon 19 deletion / L858R substitution from multi-gene transcriptomics and tobacco smoking pack-years.
- **TCGA-LUAD KRAS Mutation Status**: Differentiating codon 12/13/61 oncogenic driver mutations from wild-type tumors.
- **BCNB Axillary Lymph Node Metastasis**: Preoperative classification of nodal positivity ($\text{N}^+$ vs $\text{N}_0$) from tumor size, histological grade, and hormone receptor status.

---

## 2. Research Integrity & Epistemic Safeguards

1. **Patient-Level Split Protection**:
   Biomedical specimens frequently contain multiple tissue cores from the same individual. QUANTUMON enforces `GroupShuffleSplit` on `patient_id` so that samples from the same patient *never cross train/test boundaries*.
2. **Strict Leak-Free Preprocessing**:
   Normalizers (`MinMaxScaler`, `StandardScaler`) and feature selectors (`SelectKBest`) are fitted strictly on training partitions only.
3. **Angle Encoding Boundedness**:
   Features are normalized within $[0, \pi]$ to prevent phase ambiguity in quantum state rotations.
4. **Epistemic Honesty**:
   QUANTUMON is designed for algorithmic benchmarking and scientific inquiry. It is not an approved medical device and does not provide clinical patient diagnoses.

---

## 3. Visual Identity & Design System

Synthesizing an editorial scientific computing laboratory aesthetic:
- **Hero Concept**: Quantum Molecular Compound Eye (*"See like a Quantum Eye"*), featuring an iridescent 3D molecular lattice with glowing covalent bonds, floating hexagonal reflection panels, and HUD telemetry monogram.
- **Color Tokens**:
  - Primary Neon Accent: `#BAF91A` (Neon Lime)
  - Secondary Accent: `#E2FF99` (Pale Lime highlight)
  - Quantum / Class Accent: `#876DFF` (Electric Violet)
  - Deep Canvas: `#101312` (Obsidian Graphite)
  - Card Surfaces: `#161B19` & `#1D2421`
  - Border: `#232B27`
- **Dashboard Architecture**:
  - *Smart Oncogenomic Distribution* telemetry card
  - *Quantum AI Copilot Core* with 3D gradient glowing orb
  - *Class Balance Donut Chart* and *Kernel Fidelity Density* striped visualizations
  - High-density specimen tables with segmented green leakage meters

---

## 4. System Architecture

```
Quantum/
├── backend/                     # FastAPI Python Backend
│   ├── api/                     # API routes (health, datasets, quantum, experiments, reports)
│   ├── data/                    # Benchmark CSV cohorts
│   ├── services/
│   │   ├── data_service.py      # Dataset validation, leakage protection, profiling
│   │   ├── quantum_service.py   # Qiskit 2.5 ZZFeatureMap, Fidelity Kernels, circuit drawing
│   │   ├── ml_service.py        # Tri-model benchmarking (QSVC, RBF SVM, XGBoost)
│   │   └── db_service.py        # SQLite persistence layer (experiments.db)
│   ├── tests/
│   │   └── test_pipeline.py     # 5 automated tests for kernels, leakage, and models
│   ├── config.py                # Supported tasks and path constants
│   ├── requirements.txt         # Pinned Python dependencies
│   ├── Dockerfile               # Container definition for backend
│   └── main.py                  # FastAPI application server
│
├── frontend/                    # Next.js 16 (Turbopack) + TypeScript + Tailwind CSS
│   ├── public/images/           # High-resolution quantum molecular & orb assets
│   ├── src/app/
│   │   ├── page.tsx             # Public editorial landing page
│   │   ├── app/
│   │   │   ├── page.tsx         # Analytical Board Dashboard
│   │   │   ├── data/            # Data Studio (CSV upload, profiling, leakage audit)
│   │   │   ├── quantum-lab/     # Quantum Lab (circuits, gates, fidelity heatmaps)
│   │   │   ├── experiments/new/ # 4-step guided Experiment Builder
│   │   │   ├── benchmarks/      # Model comparison table, ROC & PR curves, confusion matrices
│   │   │   ├── explainability/  # Feature importance & sample error concordance
│   │   │   ├── reports/         # Standalone HTML report generator & printable audit trail
│   │   │   └── settings/        # Backend connection latency ping & reproducibility defaults
│   │   └── docs/                # Scientific documentation & QML mathematical formulations
│   ├── src/lib/api.ts           # Typed API client
│   ├── Dockerfile               # Container definition for frontend
│   └── vercel.json              # Vercel deployment configuration
├── docker-compose.yml           # Multi-container local orchestration
└── .gitignore                   # Production repository ignore rules
```

---

## 5. Quickstart & Publishing Guide

### Local Development

#### 1. Backend
```bash
# In project root
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

#### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Run with Docker Compose (1-Click Publish)
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

---

### Deploy Frontend to Vercel
1. Push this repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Set the Root Directory to `frontend`.
4. Add environment variable `NEXT_PUBLIC_API_URL` pointing to your deployed backend.

---

### Deploy Backend to Render / Railway / Cloud Run
1. Connect repository to Render / Railway / Google Cloud Run.
2. Root directory: `backend`
3. Build command: `pip install -r requirements.txt && python init_experiments.py`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

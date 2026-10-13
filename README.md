# QUANTUMON: Quantum Kernel Intelligence for Cancer Research

[![CI Pipeline](https://github.com/25A31A4264/Quantum-Kernel-Learning-for-Cancer-Prediction/actions/workflows/ci.yml/badge.svg)](https://github.com/25A31A4264/Quantum-Kernel-Learning-for-Cancer-Prediction/actions/workflows/ci.yml)
[![Qiskit 2.5](https://img.shields.io/badge/Qiskit-2.5-6929C4?logo=ibm&logoColor=white)](https://qiskit.org)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

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

### 1-Click Cloud Deployment

| Component | Platform | One-Click Deploy |
| :--- | :--- | :--- |
| **Backend API** (FastAPI + Qiskit) | **Render** | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/25A31A4264/Quantum-Kernel-Learning-for-Cancer-Prediction) |
| **Frontend UI** (Next.js 16) | **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F25A31A4264%2FQuantum-Kernel-Learning-for-Cancer-Prediction&root-directory=frontend) |

---

### Step-by-Step Deployment Instructions

#### 1. Deploy the Backend to Render (Free Tier)
1. Click the **[Deploy to Render](https://render.com/deploy?repo=https://github.com/25A31A4264/Quantum-Kernel-Learning-for-Cancer-Prediction)** button above.
2. Render detects [`render.yaml`](file:///c:/Users/venka/OneDrive/Desktop/Quantum/render.yaml) automatically.
3. Click **Apply**.
4. Once deployed, copy your service URL (e.g., `https://quantumon-backend.onrender.com`).
5. Verify health: `https://quantumon-backend.onrender.com/api/health`

#### 2. Deploy the Frontend to Vercel (Free Tier)
1. Click the **[Deploy with Vercel](https://vercel.com/button)** button above.
2. Set the environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://quantumon-backend.onrender.com` (your Render URL from step 1).
3. Click **Deploy**. Your research portal will be live on `https://<your-project>.vercel.app`!

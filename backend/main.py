"""
QUANTUMON Backend API Server
FastAPI application for Qiskit Fall Fest 2026: Quantum Kernel Learning for Cancer Prediction.
"""
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import shutil
from pathlib import Path
import json

from config import DATA_DIR, SUPPORTED_TASKS
from services.data_service import DataService
from services.quantum_service import QuantumKernelService, QISKIT_AVAILABLE, QISKIT_VERSION
from services.ml_service import MLService
from services.db_service import DBService

app = FastAPI(
    title="QUANTUMON API",
    description="Quantum Kernel Intelligence for Cancer Research - Research & Educational Backend",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

data_service = DataService()
quantum_service = QuantumKernelService()
ml_service = MLService()
db_service = DBService()


# -------------------------------------------------------------------
# Request / Response Schemas
# -------------------------------------------------------------------
class ProfileRequest(BaseModel):
    filename: str
    target_col: Optional[str] = None
    patient_id_col: Optional[str] = None
    task_id: Optional[str] = None

class CircuitPreviewRequest(BaseModel):
    feature_dimension: int = 4
    feature_map_type: str = "ZZFeatureMap"
    reps: int = 2
    entanglement: str = "linear"

class KernelMatrixRequest(BaseModel):
    filename: str
    target_col: str
    feature_cols: List[str]
    n_samples: int = 20
    feature_map_type: str = "ZZFeatureMap"
    reps: int = 2
    entanglement: str = "linear"
    alpha: float = 2.0

class RunExperimentRequest(BaseModel):
    name: str
    task_id: str
    filename: str
    target_col: str
    feature_cols: List[str]
    patient_id_col: Optional[str] = None
    test_size: float = 0.25
    random_seed: int = 42
    scaler_type: str = "minmax"
    n_qubits: int = 6
    feature_reduction: str = "select_k_best"
    max_samples: Optional[int] = 120
    # Quantum config
    feature_map: str = "ZZFeatureMap"
    reps: int = 2
    entanglement: str = "linear"
    alpha: float = 2.0
    quantum_c: float = 1.0
    # Classical config
    rbf_c: float = 1.0
    rbf_gamma: str = "scale"
    xgb_n_estimators: int = 60
    xgb_max_depth: int = 3
    xgb_learning_rate: float = 0.08


# -------------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "QUANTUMON Research API",
        "qiskit_available": QISKIT_AVAILABLE,
        "qiskit_version": QISKIT_VERSION,
        "supported_tasks_count": len(SUPPORTED_TASKS)
    }

@app.get("/api/tasks")
def get_supported_tasks():
    return list(SUPPORTED_TASKS.values())

@app.get("/api/datasets")
def get_datasets():
    return data_service.list_available_datasets()

@app.post("/api/datasets/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    safe_filename = Path(file.filename).name
    dest_path = DATA_DIR / safe_filename
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Run immediate validation profile
    profile = data_service.validate_and_profile(safe_filename)
    return {
        "message": f"Successfully uploaded {safe_filename}",
        "filename": safe_filename,
        "profile": profile
    }

@app.post("/api/datasets/profile")
def profile_dataset(req: ProfileRequest):
    try:
        return data_service.validate_and_profile(
            filename=req.filename,
            target_col=req.target_col,
            patient_id_col=req.patient_id_col,
            task_id=req.task_id
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File {req.filename} not found.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/quantum/circuit-preview")
def preview_circuit(req: CircuitPreviewRequest):
    try:
        analysis = quantum_service.analyze_circuit(
            feature_dimension=req.feature_dimension,
            feature_map_type=req.feature_map_type,
            reps=req.reps,
            entanglement=req.entanglement
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/quantum/kernel-matrix")
def sample_kernel_matrix(req: KernelMatrixRequest):
    try:
        prepared = data_service.prepare_experiment_data(
            filename=req.filename,
            target_col=req.target_col,
            feature_cols=req.feature_cols,
            n_qubits=min(len(req.feature_cols), 8),
            max_samples=req.n_samples,
            test_size=0.3,
            random_seed=42
        )
        X_sample = prepared["X_train"][:req.n_samples]
        
        matrix_res = quantum_service.compute_fidelity_kernel_matrix(
            X1=X_sample,
            feature_map_type=req.feature_map_type,
            reps=req.reps,
            entanglement=req.entanglement,
            alpha=req.alpha
        )
        return matrix_res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/experiments/run")
def run_experiment(req: RunExperimentRequest):
    try:
        # Step 1: Prepare data with leakage protection
        prepared = data_service.prepare_experiment_data(
            filename=req.filename,
            target_col=req.target_col,
            feature_cols=req.feature_cols,
            patient_id_col=req.patient_id_col,
            test_size=req.test_size,
            random_seed=req.random_seed,
            scaler_type=req.scaler_type,
            n_qubits=req.n_qubits,
            feature_reduction=req.feature_reduction,
            max_samples=req.max_samples
        )

        quantum_cfg = {
            "feature_map": req.feature_map,
            "reps": req.reps,
            "entanglement": req.entanglement,
            "alpha": req.alpha,
            "C": req.quantum_c
        }
        classical_svm_cfg = {
            "C": req.rbf_c,
            "gamma": req.rbf_gamma
        }
        xgboost_cfg = {
            "n_estimators": req.xgb_n_estimators,
            "max_depth": req.xgb_max_depth,
            "learning_rate": req.xgb_learning_rate
        }

        # Step 2: Train and evaluate
        benchmark_results = ml_service.train_and_evaluate(
            prepared_data=prepared,
            quantum_config=quantum_cfg,
            classical_svm_config=classical_svm_cfg,
            xgboost_config=xgboost_cfg,
            random_seed=req.random_seed
        )

        task_name = SUPPORTED_TASKS.get(req.task_id, {}).get("name", "Custom Task")
        is_synthetic = "is_synthetic" in req.filename or req.task_id in SUPPORTED_TASKS

        # Step 3: Persist experiment run
        exp_record = {
            "name": req.name,
            "task_id": req.task_id,
            "task_name": task_name,
            "dataset_filename": req.filename,
            "is_synthetic": is_synthetic,
            "status": "completed",
            "config": req.dict(),
            "results": benchmark_results
        }
        exp_id = db_service.save_experiment(exp_record)
        exp_record["id"] = exp_id

        return exp_record

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/experiments")
def list_experiments(limit: int = 50):
    return db_service.list_experiments(limit=limit)

@app.get("/api/experiments/{exp_id}")
def get_experiment(exp_id: str):
    exp = db_service.get_experiment(exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp

@app.delete("/api/experiments/{exp_id}")
def delete_experiment(exp_id: str):
    success = db_service.delete_experiment(exp_id)
    if not success:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return {"message": "Experiment deleted", "id": exp_id}

@app.post("/api/reports/html")
def generate_html_report(exp_id: str):
    exp = db_service.get_experiment(exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    cfg = exp["config"]
    res = exp["results"]
    models = res["models"]
    qsvm = models.get("quantum_svm", {})
    rbf = models.get("classical_rbf_svm", {})
    xgb_m = models.get("xgboost", {})
    verdict = res.get("integrity_assessment", {})

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>QUANTUMON Research Report - {exp['name']}</title>
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; background: #0B0D0F; color: #F2F3EE; padding: 40px; margin: 0; line-height: 1.6; }}
  .header {{ border-bottom: 2px solid #2A3335; padding-bottom: 24px; margin-bottom: 32px; }}
  .badge {{ display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; text-transform: uppercase; font-weight: bold; }}
  .badge-quantum {{ background: #123438; color: #62E6E0; border: 1px solid #62E6E0; }}
  .badge-synthetic {{ background: #382d12; color: #F0B86B; border: 1px solid #F0B86B; }}
  h1 {{ font-size: 28px; margin: 12px 0 6px 0; color: #F2F3EE; }}
  .meta {{ color: #A1AAA9; font-size: 13px; font-family: monospace; }}
  .section {{ background: #121619; border: 1px solid #2A3335; border-radius: 8px; padding: 24px; margin-bottom: 28px; }}
  .section h2 {{ font-size: 18px; color: #62E6E0; margin-top: 0; border-bottom: 1px solid #2A3335; padding-bottom: 8px; }}
  table {{ width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }}
  th, td {{ padding: 10px 14px; text-align: left; border-bottom: 1px solid #2A3335; }}
  th {{ color: #A1AAA9; font-weight: 600; text-transform: uppercase; font-size: 12px; }}
  .val-highlight {{ color: #C4F36B; font-weight: bold; }}
  .alert {{ background: #191F22; border-left: 4px solid #62E6E0; padding: 14px; margin-top: 16px; border-radius: 0 4px 4px 0; font-size: 13px; }}
  .circuit-box {{ background: #0B0D0F; border: 1px solid #2A3335; font-family: monospace; padding: 16px; overflow-x: auto; font-size: 11px; color: #62E6E0; }}
</style>
</head>
<body>
  <div class="header">
    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
      <span class="badge badge-quantum">QUANTUMON RESEARCH REPORT</span>
      {"<span class='badge badge-synthetic'>SYNTHETIC DEMO DATA</span>" if exp.get('is_synthetic') else ""}
    </div>
    <h1>{exp['name']}</h1>
    <div class="meta">
      Task: {exp['task_name']} | Generated: {exp['created_at']} | Experiment ID: {exp['id']}
    </div>
  </div>

  <div class="section">
    <h2>1. Executive Summary & Integrity Assessment</h2>
    <p><strong>Verdict:</strong> {verdict.get('quantum_advantage_verdict', 'Evaluated')}</p>
    <p>Accuracy Delta (Quantum vs RBF): <span class="val-highlight">{verdict.get('accuracy_differential_vs_rbf', 0):+.4f}</span> | Computational Overhead Factor: {verdict.get('computational_overhead_factor', 1)}x</p>
    <div class="alert">
      <strong>Research Integrity Notice:</strong> {verdict.get('reproducibility_notes', '')} This platform is designed for scientific inquiry and algorithmic evaluation, not for clinical diagnosis.
    </div>
  </div>

  <div class="section">
    <h2>2. Model Benchmarking Comparison</h2>
    <table>
      <thead>
        <tr>
          <th>Model</th>
          <th>Accuracy</th>
          <th>Balanced Acc</th>
          <th>Precision</th>
          <th>Recall</th>
          <th>F1-Score</th>
          <th>ROC-AUC</th>
          <th>Train Time</th>
          <th>Infer Time</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="color:#62E6E0; font-weight:bold;">Quantum-Kernel SVM</td>
          <td>{qsvm.get('metrics', {}).get('accuracy', '-')}</td>
          <td>{qsvm.get('metrics', {}).get('balanced_accuracy', '-')}</td>
          <td>{qsvm.get('metrics', {}).get('precision', '-')}</td>
          <td>{qsvm.get('metrics', {}).get('recall', '-')}</td>
          <td>{qsvm.get('metrics', {}).get('f1_score', '-')}</td>
          <td>{qsvm.get('metrics', {}).get('roc_auc', '-')}</td>
          <td>{qsvm.get('runtime', {}).get('train_time_ms', '-')} ms</td>
          <td>{qsvm.get('runtime', {}).get('infer_time_ms', '-')} ms</td>
        </tr>
        <tr>
          <td style="color:#F2F3EE;">Classical RBF SVM</td>
          <td>{rbf.get('metrics', {}).get('accuracy', '-')}</td>
          <td>{rbf.get('metrics', {}).get('balanced_accuracy', '-')}</td>
          <td>{rbf.get('metrics', {}).get('precision', '-')}</td>
          <td>{rbf.get('metrics', {}).get('recall', '-')}</td>
          <td>{rbf.get('metrics', {}).get('f1_score', '-')}</td>
          <td>{rbf.get('metrics', {}).get('roc_auc', '-')}</td>
          <td>{rbf.get('runtime', {}).get('train_time_ms', '-')} ms</td>
          <td>{rbf.get('runtime', {}).get('infer_time_ms', '-')} ms</td>
        </tr>
        <tr>
          <td style="color:#C4F36B;">XGBoost Classifier</td>
          <td>{xgb_m.get('metrics', {}).get('accuracy', '-')}</td>
          <td>{xgb_m.get('metrics', {}).get('balanced_accuracy', '-')}</td>
          <td>{xgb_m.get('metrics', {}).get('precision', '-')}</td>
          <td>{xgb_m.get('metrics', {}).get('recall', '-')}</td>
          <td>{xgb_m.get('metrics', {}).get('f1_score', '-')}</td>
          <td>{xgb_m.get('metrics', {}).get('roc_auc', '-')}</td>
          <td>{xgb_m.get('runtime', {}).get('train_time_ms', '-')} ms</td>
          <td>{xgb_m.get('runtime', {}).get('infer_time_ms', '-')} ms</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>3. Quantum Feature Map Configuration & Resources</h2>
    <p>Feature Map: <strong>{cfg.get('feature_map')}</strong> | Qubits: <strong>{cfg.get('n_qubits')}</strong> | Reps: <strong>{cfg.get('reps')}</strong> | Entanglement: <strong>{cfg.get('entanglement')}</strong></p>
    <div class="circuit-box">
      <pre>{qsvm.get('metadata', {}).get('circuit_analysis', {}).get('circuit_ascii', 'Circuit diagram not available')}</pre>
    </div>
  </div>

  <div class="section">
    <h2>4. Provenance & Reproducibility Parameters</h2>
    <div style="font-family: monospace; font-size: 13px; color: #A1AAA9;">
      Dataset: {cfg.get('filename')} | Test Split Size: {cfg.get('test_size')} | Scaler: {cfg.get('scaler_type')} | Feature Selection: {cfg.get('feature_reduction')}<br>
      Random Seed: {cfg.get('random_seed')} | Selected Features: {", ".join(res.get('features_used', []))}
    </div>
  </div>
</body>
</html>
"""
    return {"html": html_content, "id": exp_id}

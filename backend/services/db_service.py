"""
QUANTUMON Database & Persistence Layer
Stores experiment history, configs, benchmark metrics, and execution logs using SQLite.
"""
import sqlite3
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path
from config import DB_PATH

class DBService:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = str(db_path)
        self._init_db()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Create experiments table if not exists."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS experiments (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    task_id TEXT NOT NULL,
                    task_name TEXT NOT NULL,
                    dataset_filename TEXT NOT NULL,
                    is_synthetic INTEGER NOT NULL DEFAULT 1,
                    status TEXT NOT NULL DEFAULT 'completed',
                    created_at TEXT NOT NULL,
                    config_json TEXT NOT NULL,
                    results_json TEXT NOT NULL,
                    summary_qsvm_acc REAL,
                    summary_rbf_acc REAL,
                    summary_xgb_acc REAL,
                    quantum_advantage_verdict TEXT
                )
            """)
            conn.commit()

    def save_experiment(self, exp_data: Dict[str, Any]) -> str:
        """Save a new experiment run to SQLite."""
        exp_id = exp_data.get("id") or f"exp_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        created_at = exp_data.get("created_at") or datetime.utcnow().isoformat()
        
        models = exp_data.get("results", {}).get("models", {})
        q_acc = models.get("quantum_svm", {}).get("metrics", {}).get("accuracy")
        rbf_acc = models.get("classical_rbf_svm", {}).get("metrics", {}).get("accuracy")
        xgb_acc = models.get("xgboost", {}).get("metrics", {}).get("accuracy")
        verdict = exp_data.get("results", {}).get("integrity_assessment", {}).get("quantum_advantage_verdict", "Evaluated")

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO experiments (
                    id, name, task_id, task_name, dataset_filename,
                    is_synthetic, status, created_at, config_json,
                    results_json, summary_qsvm_acc, summary_rbf_acc,
                    summary_xgb_acc, quantum_advantage_verdict
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                exp_id,
                exp_data.get("name", "Unnamed Experiment"),
                exp_data.get("task_id", "custom"),
                exp_data.get("task_name", "Clinical Benchmark"),
                exp_data.get("dataset_filename", ""),
                1 if exp_data.get("is_synthetic", True) else 0,
                exp_data.get("status", "completed"),
                created_at,
                json.dumps(exp_data.get("config", {})),
                json.dumps(exp_data.get("results", {})),
                q_acc,
                rbf_acc,
                xgb_acc,
                verdict
            ))
            conn.commit()
        return exp_id

    def list_experiments(self, limit: int = 50) -> List[Dict[str, Any]]:
        """List experiments with high-level summaries for the dashboard."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, name, task_id, task_name, dataset_filename,
                       is_synthetic, status, created_at, summary_qsvm_acc,
                       summary_rbf_acc, summary_xgb_acc, quantum_advantage_verdict
                FROM experiments
                ORDER BY created_at DESC
                LIMIT ?
            """, (limit,))
            rows = cursor.fetchall()
            return [
                {
                    "id": row["id"],
                    "name": row["name"],
                    "task_id": row["task_id"],
                    "task_name": row["task_name"],
                    "dataset_filename": row["dataset_filename"],
                    "is_synthetic": bool(row["is_synthetic"]),
                    "status": row["status"],
                    "created_at": row["created_at"],
                    "summary_qsvm_acc": row["summary_qsvm_acc"],
                    "summary_rbf_acc": row["summary_rbf_acc"],
                    "summary_xgb_acc": row["summary_xgb_acc"],
                    "quantum_advantage_verdict": row["quantum_advantage_verdict"]
                }
                for row in rows
            ]

    def get_experiment(self, exp_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve full details of an experiment."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM experiments WHERE id = ?", (exp_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return {
                "id": row["id"],
                "name": row["name"],
                "task_id": row["task_id"],
                "task_name": row["task_name"],
                "dataset_filename": row["dataset_filename"],
                "is_synthetic": bool(row["is_synthetic"]),
                "status": row["status"],
                "created_at": row["created_at"],
                "config": json.loads(row["config_json"]),
                "results": json.loads(row["results_json"]),
                "summary_qsvm_acc": row["summary_qsvm_acc"],
                "summary_rbf_acc": row["summary_rbf_acc"],
                "summary_xgb_acc": row["summary_xgb_acc"],
                "quantum_advantage_verdict": row["quantum_advantage_verdict"]
            }

    def delete_experiment(self, exp_id: str) -> bool:
        """Delete an experiment."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM experiments WHERE id = ?", (exp_id,))
            conn.commit()
            return cursor.rowcount > 0

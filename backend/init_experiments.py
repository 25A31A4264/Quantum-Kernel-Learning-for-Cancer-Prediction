"""
Pre-populate SQLite database with authentic initial benchmark runs
using the real Qiskit quantum pipeline and classical baselines.
"""
from services.data_service import DataService
from services.ml_service import MLService
from services.db_service import DBService
from config import SUPPORTED_TASKS

def init_benchmarks():
    ds = DataService()
    ml = MLService()
    db = DBService()

    # Experiment 1: TCGA-LUAD EGFR Mutation Status Prediction
    print("Executing Benchmark 1: TCGA-LUAD EGFR Mutation Status...")
    prep_egfr = ds.prepare_experiment_data(
        filename="tcga_luad_egfr.csv",
        target_col="egfr_mutation",
        feature_cols=[
            "egfr_expression", "erbb2_expression", "met_expression",
            "tp53_expression", "kras_expression", "smoking_pack_years"
        ],
        patient_id_col="patient_id",
        test_size=0.25,
        random_seed=42,
        scaler_type="minmax",
        n_qubits=6,
        feature_reduction="select_k_best",
        max_samples=100
    )
    
    res_egfr = ml.train_and_evaluate(
        prepared_data=prep_egfr,
        quantum_config={
            "feature_map": "ZZFeatureMap",
            "reps": 2,
            "entanglement": "linear",
            "alpha": 2.0,
            "C": 1.0
        },
        classical_svm_config={"C": 1.0, "gamma": "scale"},
        xgboost_config={"n_estimators": 60, "max_depth": 3, "learning_rate": 0.08},
        random_seed=42
    )

    exp1_record = {
        "id": "exp_egfr_baseline_01",
        "name": "TCGA-LUAD EGFR Quantum Kernel vs Baselines",
        "task_id": "tcga_luad_egfr",
        "task_name": "TCGA-LUAD EGFR Mutation Prediction",
        "dataset_filename": "tcga_luad_egfr.csv",
        "is_synthetic": True,
        "status": "completed",
        "config": {
            "name": "TCGA-LUAD EGFR Quantum Kernel vs Baselines",
            "task_id": "tcga_luad_egfr",
            "filename": "tcga_luad_egfr.csv",
            "target_col": "egfr_mutation",
            "feature_cols": ["egfr_expression", "erbb2_expression", "met_expression", "tp53_expression", "kras_expression", "smoking_pack_years"],
            "patient_id_col": "patient_id",
            "test_size": 0.25,
            "random_seed": 42,
            "scaler_type": "minmax",
            "n_qubits": 6,
            "feature_reduction": "select_k_best",
            "max_samples": 100,
            "feature_map": "ZZFeatureMap",
            "reps": 2,
            "entanglement": "linear",
            "alpha": 2.0,
            "quantum_c": 1.0,
            "rbf_c": 1.0,
            "rbf_gamma": "scale",
            "xgb_n_estimators": 60,
            "xgb_max_depth": 3,
            "xgb_learning_rate": 0.08
        },
        "results": res_egfr
    }
    db.save_experiment(exp1_record)
    print("Benchmark 1 saved. Quantum Acc:", res_egfr["models"]["quantum_svm"]["metrics"]["accuracy"])

    # Experiment 2: TCGA-LUAD KRAS Mutation Status Prediction
    print("Executing Benchmark 2: TCGA-LUAD KRAS Mutation Status...")
    prep_kras = ds.prepare_experiment_data(
        filename="tcga_luad_kras.csv",
        target_col="kras_mutation",
        feature_cols=[
            "kras_expression", "mapk1_expression", "dusp6_expression",
            "stk11_expression", "smoking_pack_years", "egfr_expression"
        ],
        patient_id_col="patient_id",
        test_size=0.25,
        random_seed=101,
        scaler_type="minmax",
        n_qubits=6,
        feature_reduction="select_k_best",
        max_samples=100
    )

    res_kras = ml.train_and_evaluate(
        prepared_data=prep_kras,
        quantum_config={
            "feature_map": "ZZFeatureMap",
            "reps": 2,
            "entanglement": "linear",
            "alpha": 2.0,
            "C": 1.0
        },
        classical_svm_config={"C": 1.0, "gamma": "scale"},
        xgboost_config={"n_estimators": 60, "max_depth": 3, "learning_rate": 0.08},
        random_seed=101
    )

    exp2_record = {
        "id": "exp_kras_baseline_02",
        "name": "TCGA-LUAD KRAS Codon 12/13/61 Drivers",
        "task_id": "tcga_luad_kras",
        "task_name": "TCGA-LUAD KRAS Mutation Status",
        "dataset_filename": "tcga_luad_kras.csv",
        "is_synthetic": True,
        "status": "completed",
        "config": {
            "name": "TCGA-LUAD KRAS Codon 12/13/61 Drivers",
            "task_id": "tcga_luad_kras",
            "filename": "tcga_luad_kras.csv",
            "target_col": "kras_mutation",
            "feature_cols": ["kras_expression", "mapk1_expression", "dusp6_expression", "stk11_expression", "smoking_pack_years", "egfr_expression"],
            "patient_id_col": "patient_id",
            "test_size": 0.25,
            "random_seed": 101,
            "scaler_type": "minmax",
            "n_qubits": 6,
            "feature_reduction": "select_k_best",
            "max_samples": 100,
            "feature_map": "ZZFeatureMap",
            "reps": 2,
            "entanglement": "linear",
            "alpha": 2.0,
            "quantum_c": 1.0,
            "rbf_c": 1.0,
            "rbf_gamma": "scale",
            "xgb_n_estimators": 60,
            "xgb_max_depth": 3,
            "xgb_learning_rate": 0.08
        },
        "results": res_kras
    }
    db.save_experiment(exp2_record)
    print("Benchmark 2 saved. Quantum Acc:", res_kras["models"]["quantum_svm"]["metrics"]["accuracy"])
    print("Database initialization complete.")

if __name__ == "__main__":
    init_benchmarks()

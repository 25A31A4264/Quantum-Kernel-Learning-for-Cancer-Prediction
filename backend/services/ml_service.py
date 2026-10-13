"""
QUANTUMON ML Service
Executes fair, rigorous benchmarking across:
1. Quantum-Kernel SVM (precomputed fidelity kernel)
2. Classical RBF Support Vector Machine
3. XGBoost Gradient Boosted Decision Trees

Calculates metrics (Accuracy, Balanced Acc, Precision, Recall, F1, ROC-AUC, PR curve, Confusion Matrix),
inference timings, resource overheads, and feature importances.
"""
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import time
from sklearn.svm import SVC
from sklearn.inspection import permutation_importance
from sklearn.metrics import (
    accuracy_score, balanced_accuracy_score, precision_score,
    recall_score, f1_score, roc_auc_score, roc_curve,
    precision_recall_curve, confusion_matrix
)
import xgboost as xgb

from services.quantum_service import QuantumKernelService

class MLService:
    def __init__(self):
        self.quantum_service = QuantumKernelService()

    def train_and_evaluate(
        self,
        prepared_data: Dict[str, Any],
        quantum_config: Dict[str, Any],
        classical_svm_config: Dict[str, Any],
        xgboost_config: Dict[str, Any],
        random_seed: int = 42
    ) -> Dict[str, Any]:
        """
        Execute benchmark across all 3 models on the identical train/test splits.
        """
        X_train = prepared_data["X_train"]
        X_test = prepared_data["X_test"]
        y_train = prepared_data["y_train"]
        y_test = prepared_data["y_test"]
        feature_names = prepared_data["selected_feature_names"]

        results = {}

        # -------------------------------------------------------------
        # 1. QUANTUM-KERNEL SVM
        # -------------------------------------------------------------
        fmap_type = quantum_config.get("feature_map", "ZZFeatureMap")
        reps = quantum_config.get("reps", 2)
        entanglement = quantum_config.get("entanglement", "linear")
        alpha = quantum_config.get("alpha", 2.0)
        c_param = quantum_config.get("C", 1.0)

        # Step A: Compute Train Kernel Matrix K_train (N_train x N_train)
        t_kernel_train_start = time.perf_counter()
        k_train_res = self.quantum_service.compute_fidelity_kernel_matrix(
            X1=X_train,
            X2=None,
            feature_map_type=fmap_type,
            reps=reps,
            entanglement=entanglement,
            alpha=alpha
        )
        kernel_train_time = time.perf_counter() - t_kernel_train_start
        K_train = np.array(k_train_res["kernel_matrix"])

        # Step B: Fit SVC on precomputed kernel
        t_qsvm_fit_start = time.perf_counter()
        qsvc = SVC(kernel="precomputed", C=c_param, probability=True, random_state=random_seed)
        qsvc.fit(K_train, y_train)
        qsvm_fit_time = time.perf_counter() - t_qsvm_fit_start

        # Step C: Compute Test Kernel Matrix K_test (N_test x N_train)
        t_kernel_test_start = time.perf_counter()
        k_test_res = self.quantum_service.compute_fidelity_kernel_matrix(
            X1=X_test,
            X2=X_train,
            feature_map_type=fmap_type,
            reps=reps,
            entanglement=entanglement,
            alpha=alpha
        )
        kernel_test_time = time.perf_counter() - t_kernel_test_start
        K_test = np.array(k_test_res["kernel_matrix"])

        # Step D: Predict on test set
        t_qsvm_infer_start = time.perf_counter()
        y_pred_qsvm = qsvc.predict(K_test)
        qsvm_infer_time = (time.perf_counter() - t_qsvm_infer_start) * 1000 # ms
        y_prob_qsvm = qsvc.predict_proba(K_test)[:, 1]

        # Circuit Resource Breakdown
        circuit_analysis = self.quantum_service.analyze_circuit(
            feature_dimension=X_train.shape[1],
            feature_map_type=fmap_type,
            reps=reps,
            entanglement=entanglement
        )

        results["quantum_svm"] = self._compute_model_metrics(
            model_name="Quantum-Kernel SVM",
            model_type="quantum",
            y_true=y_test,
            y_pred=y_pred_qsvm,
            y_prob=y_prob_qsvm,
            train_time_ms=round((kernel_train_time + qsvm_fit_time) * 1000, 2),
            infer_time_ms=round((kernel_test_time * 1000) + qsvm_infer_time, 2),
            extra_metadata={
                "kernel_train_time_ms": round(kernel_train_time * 1000, 2),
                "kernel_test_time_ms": round(kernel_test_time * 1000, 2),
                "fit_time_ms": round(qsvm_fit_time * 1000, 2),
                "support_vectors_count": int(len(qsvc.support_)),
                "support_vector_ratio": round(len(qsvc.support_) / len(X_train), 3),
                "c_param": c_param,
                "circuit_analysis": circuit_analysis,
                "kernel_concentration_warning": k_train_res.get("concentration_warning")
            }
        )

        # -------------------------------------------------------------
        # 2. CLASSICAL RBF SVM
        # -------------------------------------------------------------
        classical_c = classical_svm_config.get("C", 1.0)
        classical_gamma = classical_svm_config.get("gamma", "scale")
        
        t_rbf_fit_start = time.perf_counter()
        rbf_svc = SVC(
            kernel="rbf",
            C=classical_c,
            gamma=classical_gamma,
            probability=True,
            random_state=random_seed
        )
        rbf_svc.fit(X_train, y_train)
        rbf_fit_time = (time.perf_counter() - t_rbf_fit_start) * 1000 # ms

        t_rbf_infer_start = time.perf_counter()
        y_pred_rbf = rbf_svc.predict(X_test)
        rbf_infer_time = (time.perf_counter() - t_rbf_infer_start) * 1000 # ms
        y_prob_rbf = rbf_svc.predict_proba(X_test)[:, 1]

        # Classical permutation importance
        perm_rbf = permutation_importance(rbf_svc, X_test, y_test, n_repeats=5, random_state=random_seed)
        rbf_importance = {
            feature_names[i]: float(perm_rbf.importances_mean[i])
            for i in range(len(feature_names))
        }

        results["classical_rbf_svm"] = self._compute_model_metrics(
            model_name="Classical RBF SVM",
            model_type="classical",
            y_true=y_test,
            y_pred=y_pred_rbf,
            y_prob=y_prob_rbf,
            train_time_ms=round(rbf_fit_time, 2),
            infer_time_ms=round(rbf_infer_time, 2),
            extra_metadata={
                "support_vectors_count": int(len(rbf_svc.support_)),
                "support_vector_ratio": round(len(rbf_svc.support_) / len(X_train), 3),
                "c_param": classical_c,
                "gamma": str(classical_gamma),
                "feature_importance": rbf_importance
            }
        )

        # -------------------------------------------------------------
        # 3. XGBOOST CLASSIFIER
        # -------------------------------------------------------------
        n_estimators = xgboost_config.get("n_estimators", 80)
        max_depth = xgboost_config.get("max_depth", 3)
        learning_rate = xgboost_config.get("learning_rate", 0.08)

        t_xgb_fit_start = time.perf_counter()
        xgb_clf = xgb.XGBClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            learning_rate=learning_rate,
            random_state=random_seed,
            eval_metric="logloss"
        )
        xgb_clf.fit(X_train, y_train)
        xgb_fit_time = (time.perf_counter() - t_xgb_fit_start) * 1000 # ms

        t_xgb_infer_start = time.perf_counter()
        y_pred_xgb = xgb_clf.predict(X_test)
        xgb_infer_time = (time.perf_counter() - t_xgb_infer_start) * 1000 # ms
        y_prob_xgb = xgb_clf.predict_proba(X_test)[:, 1]

        # Feature importances from XGBoost
        raw_imp = xgb_clf.feature_importances_
        xgb_importance = {
            feature_names[i]: float(raw_imp[i])
            for i in range(len(feature_names))
        }

        results["xgboost"] = self._compute_model_metrics(
            model_name="XGBoost Classifier",
            model_type="classical",
            y_true=y_test,
            y_pred=y_pred_xgb,
            y_prob=y_prob_xgb,
            train_time_ms=round(xgb_fit_time, 2),
            infer_time_ms=round(xgb_infer_time, 2),
            extra_metadata={
                "n_estimators": n_estimators,
                "max_depth": max_depth,
                "learning_rate": learning_rate,
                "feature_importance": xgb_importance
            }
        )

        # Detailed Sample-by-Sample Error Review (False Positives & False Negatives)
        sample_error_analysis = []
        for i in range(len(y_test)):
            sample_error_analysis.append({
                "index": int(i),
                "actual": int(y_test[i]),
                "qsvm_pred": int(y_pred_qsvm[i]),
                "qsvm_prob": round(float(y_prob_qsvm[i]), 3),
                "rbf_pred": int(y_pred_rbf[i]),
                "rbf_prob": round(float(y_prob_rbf[i]), 3),
                "xgb_pred": int(y_pred_xgb[i]),
                "xgb_prob": round(float(y_prob_xgb[i]), 3),
                "qsvm_correct": bool(y_pred_qsvm[i] == y_test[i]),
                "rbf_correct": bool(y_pred_rbf[i] == y_test[i]),
                "xgb_correct": bool(y_pred_xgb[i] == y_test[i])
            })

        # Calculate quantum advantage or parity analysis
        q_acc = results["quantum_svm"]["metrics"]["accuracy"]
        rbf_acc = results["classical_rbf_svm"]["metrics"]["accuracy"]
        xgb_acc = results["xgboost"]["metrics"]["accuracy"]
        
        q_time = results["quantum_svm"]["runtime"]["train_time_ms"]
        rbf_time = results["classical_rbf_svm"]["runtime"]["train_time_ms"]

        integrity_assessment = {
            "accuracy_differential_vs_rbf": round(q_acc - rbf_acc, 4),
            "accuracy_differential_vs_xgb": round(q_acc - xgb_acc, 4),
            "computational_overhead_factor": round(q_time / max(rbf_time, 0.01), 1),
            "quantum_advantage_verdict": (
                "Empirical Advantage on Test Set" if q_acc > max(rbf_acc, xgb_acc) + 0.02
                else "Statistical Parity with Classical Baselines" if abs(q_acc - max(rbf_acc, xgb_acc)) <= 0.02
                else "Classical Baselines Outperform"
            ),
            "reproducibility_notes": "Small cohort sizes exhibit inherent variance in test split metrics. Single favourable scores do not guarantee asymptotic quantum advantage."
        }

        return {
            "models": results,
            "sample_errors": sample_error_analysis,
            "integrity_assessment": integrity_assessment,
            "train_sample_count": len(X_train),
            "test_sample_count": len(X_test),
            "features_used": feature_names,
            "random_seed": random_seed
        }

    def _compute_model_metrics(
        self,
        model_name: str,
        model_type: str,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_prob: np.ndarray,
        train_time_ms: float,
        infer_time_ms: float,
        extra_metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Compute standard scientific metrics suite."""
        acc = float(accuracy_score(y_true, y_pred))
        bal_acc = float(balanced_accuracy_score(y_true, y_pred))
        prec = float(precision_score(y_true, y_pred, zero_division=0))
        rec = float(recall_score(y_true, y_pred, zero_division=0))
        f1 = float(f1_score(y_true, y_pred, zero_division=0))

        # ROC AUC
        try:
            auc = float(roc_auc_score(y_true, y_prob))
            fpr, tpr, _ = roc_curve(y_true, y_prob)
            roc_points = [{"fpr": round(float(f), 4), "tpr": round(float(t), 4)} for f, t in zip(fpr, tpr)]
        except Exception:
            auc = 0.5
            roc_points = [{"fpr": 0.0, "tpr": 0.0}, {"fpr": 1.0, "tpr": 1.0}]

        # Precision-Recall Curve
        try:
            pr_p, pr_r, _ = precision_recall_curve(y_true, y_prob)
            pr_points = [{"recall": round(float(r), 4), "precision": round(float(p), 4)} for p, r in zip(pr_p, pr_r)]
        except Exception:
            pr_points = []

        # Confusion Matrix
        cm = confusion_matrix(y_true, y_pred)
        if cm.shape == (2, 2):
            tn, fp, fn, tp = cm.ravel()
        else:
            tn, fp, fn, tp = 0, 0, 0, 0

        # Specificity
        spec = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0

        return {
            "name": model_name,
            "type": model_type,
            "metrics": {
                "accuracy": round(acc, 4),
                "balanced_accuracy": round(bal_acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "specificity": round(spec, 4),
                "f1_score": round(f1, 4),
                "roc_auc": round(auc, 4)
            },
            "confusion_matrix": {
                "true_negative": int(tn),
                "false_positive": int(fp),
                "false_negative": int(fn),
                "true_positive": int(tp),
                "matrix_array": cm.tolist()
            },
            "curves": {
                "roc_curve": roc_points,
                "pr_curve": pr_points
            },
            "runtime": {
                "train_time_ms": train_time_ms,
                "infer_time_ms": infer_time_ms
            },
            "metadata": extra_metadata
        }

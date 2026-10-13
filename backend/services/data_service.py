"""
QUANTUMON Data Studio Service
Handles dataset ingestion, validation, clinical data integrity checks,
patient-level split protection, leakage-free scaling, and statistical profiling.
"""
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import StratifiedShuffleSplit, GroupShuffleSplit
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.feature_selection import SelectKBest, mutual_info_classif, f_classif
from sklearn.decomposition import PCA

from config import DATA_DIR, SUPPORTED_TASKS

class DataService:
    def __init__(self):
        self.data_dir = DATA_DIR

    def list_available_datasets(self) -> List[Dict[str, Any]]:
        """List registered datasets and synthetic benchmark files."""
        results = []
        for task_id, task_info in SUPPORTED_TASKS.items():
            filepath = self.data_dir / task_info["default_dataset"]
            exists = filepath.exists()
            file_size_kb = round(filepath.stat().st_size / 1024, 1) if exists else 0
            
            sample_count = 0
            feature_count = 0
            if exists:
                try:
                    df = pd.read_csv(filepath)
                    sample_count = len(df)
                    feature_count = len(df.columns)
                except Exception:
                    pass

            results.append({
                "task_id": task_id,
                "name": task_info["name"],
                "target_col": task_info["target_col"],
                "patient_id_col": task_info["patient_id_col"],
                "positive_label": task_info["positive_label"],
                "negative_label": task_info["negative_label"],
                "description": task_info["description"],
                "filename": task_info["default_dataset"],
                "is_synthetic": task_info.get("is_synthetic", True),
                "exists": exists,
                "size_kb": file_size_kb,
                "sample_count": sample_count,
                "feature_count": feature_count,
                "citation": task_info.get("citation", "")
            })
        
        # Also check for any custom uploaded CSV files
        for f in self.data_dir.glob("*.csv"):
            if not any(t["default_dataset"] == f.name for t in SUPPORTED_TASKS.values()):
                try:
                    df = pd.read_csv(f)
                    results.append({
                        "task_id": f"custom_{f.stem}",
                        "name": f"Uploaded Dataset: {f.name}",
                        "target_col": None,
                        "patient_id_col": "patient_id" if "patient_id" in df.columns else None,
                        "positive_label": "Class 1",
                        "negative_label": "Class 0",
                        "description": f"User-uploaded research dataset ({f.name})",
                        "filename": f.name,
                        "is_synthetic": False,
                        "exists": True,
                        "size_kb": round(f.stat().st_size / 1024, 1),
                        "sample_count": len(df),
                        "feature_count": len(df.columns),
                        "citation": "User uploaded data."
                    })
                except Exception:
                    pass

        return results

    def load_dataset(self, filename: str) -> pd.DataFrame:
        """Load dataset from disk."""
        filepath = self.data_dir / filename
        if not filepath.exists():
            raise FileNotFoundError(f"Dataset file '{filename}' not found.")
        return pd.read_csv(filepath)

    def validate_and_profile(
        self,
        filename: str,
        target_col: Optional[str] = None,
        patient_id_col: Optional[str] = None,
        task_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Validate dataset columns, patient overlap, missing values,
        data types, and generate statistical profile for Data Studio.
        """
        df = self.load_dataset(filename)
        
        # If task_id provided, autofill recommended target & patient cols
        if task_id in SUPPORTED_TASKS:
            expected_info = SUPPORTED_TASKS[task_id]
            if not target_col:
                target_col = expected_info["target_col"]
            if not patient_id_col:
                patient_id_col = expected_info["patient_id_col"]

        columns_meta = []
        numeric_cols = []
        categorical_cols = []

        for col in df.columns:
            dtype_str = str(df[col].dtype)
            is_num = pd.api.types.is_numeric_dtype(df[col])
            n_missing = int(df[col].isna().sum())
            n_unique = int(df[col].nunique())
            
            if is_num and col not in [target_col, "is_synthetic"]:
                numeric_cols.append(col)
            elif not is_num and col not in [target_col, patient_id_col, "sample_id"]:
                categorical_cols.append(col)

            col_stat = {
                "name": col,
                "dtype": dtype_str,
                "is_numeric": is_num,
                "missing_count": n_missing,
                "missing_pct": round((n_missing / len(df)) * 100, 2),
                "unique_values": n_unique,
            }
            if is_num:
                col_stat.update({
                    "min": float(df[col].min()) if not df[col].isna().all() else None,
                    "max": float(df[col].max()) if not df[col].isna().all() else None,
                    "mean": float(df[col].mean()) if not df[col].isna().all() else None,
                    "std": float(df[col].std()) if not df[col].isna().all() else None,
                    "median": float(df[col].median()) if not df[col].isna().all() else None,
                })
            columns_meta.append(col_stat)

        # Integrity Checks
        warnings = []
        is_valid = True

        if target_col and target_col not in df.columns:
            warnings.append(f"Target column '{target_col}' not found in dataset.")
            is_valid = False

        target_distribution = {}
        class_balance_warning = None
        if target_col and target_col in df.columns:
            # Check target values
            counts = df[target_col].value_counts().to_dict()
            total = len(df)
            target_distribution = {
                str(k): {"count": int(v), "percentage": round((v / total) * 100, 2)}
                for k, v in counts.items()
            }
            # Check binary classification
            if len(counts) != 2:
                warnings.append(f"Target column '{target_col}' must be binary (found {len(counts)} unique classes).")
                is_valid = False
            else:
                min_class_pct = min([v / total for v in counts.values()])
                if min_class_pct < 0.15:
                    class_balance_warning = f"High class imbalance: minority class is only {min_class_pct:.1%}. Stratified evaluation recommended."

        # Patient Identifier and Leakage Analysis
        has_patient_id = bool(patient_id_col and patient_id_col in df.columns)
        patient_stats = None
        if has_patient_id:
            n_patients = int(df[patient_id_col].nunique())
            n_samples = len(df)
            duplicated_patients = int((df[patient_id_col].value_counts() > 1).sum())
            patient_stats = {
                "unique_patients": n_patients,
                "total_samples": n_samples,
                "patients_with_multiple_samples": duplicated_patients,
                "requires_group_split": duplicated_patients > 0,
                "leakage_protection_status": "Active (Patient Group Partitioning enforced)" if duplicated_patients > 0 else "Ready (1:1 Patient to Sample mapping)"
            }
            if duplicated_patients > 0:
                warnings.append(f"{duplicated_patients} patients have multiple specimens. Group-level split protection will be enforced to prevent train-test data leakage.")

        # Duplicate Rows Check
        duplicate_rows = int(df.duplicated().sum())
        if duplicate_rows > 0:
            warnings.append(f"Found {duplicate_rows} duplicate rows in dataset.")

        # Correlation Matrix for Numeric Features (limit to top 15 features for performance & UI clarity)
        corr_matrix = {}
        top_corr_features = numeric_cols[:12]
        if len(top_corr_features) > 1:
            corr_df = df[top_corr_features].corr().fillna(0)
            corr_matrix = {
                "features": top_corr_features,
                "values": corr_df.round(3).values.tolist()
            }

        # First 50 rows preview
        preview_rows = df.head(50).to_dict(orient="records")

        is_synthetic = bool("is_synthetic" in df.columns and df["is_synthetic"].iloc[0] is True)

        return {
            "filename": filename,
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": columns_meta,
            "numeric_columns": numeric_cols,
            "categorical_columns": categorical_cols,
            "target_col": target_col,
            "patient_id_col": patient_id_col,
            "target_distribution": target_distribution,
            "patient_stats": patient_stats,
            "is_valid": is_valid,
            "is_synthetic": is_synthetic,
            "warnings": warnings,
            "class_balance_warning": class_balance_warning,
            "correlation_matrix": corr_matrix,
            "preview_data": preview_rows,
            "status": "ready" if is_valid else "invalid"
        }

    def prepare_experiment_data(
        self,
        filename: str,
        target_col: str,
        feature_cols: List[str],
        patient_id_col: Optional[str] = None,
        test_size: float = 0.25,
        random_seed: int = 42,
        scaler_type: str = "minmax",
        n_qubits: Optional[int] = None,
        feature_reduction: str = "select_k_best",  # 'select_k_best' or 'pca' or 'none'
        max_samples: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Rigorous data pipeline strictly preventing leakage:
        1. Patient-level grouping check
        2. Train/Test partition split FIRST
        3. Fit Scaler ONLY on X_train, then transform X_train and X_test
        4. Fit Feature Selector / PCA ONLY on X_train, then transform X_test
        5. Scale to [0, pi] or [-pi, pi] for quantum angle encoding
        """
        df = self.load_dataset(filename).copy()
        
        # Subsample if max_samples is set (for bounded quantum simulation runtime)
        if max_samples and max_samples < len(df):
            rng = np.random.RandomState(random_seed)
            if target_col in df.columns:
                # Stratified sampling
                classes = df[target_col].unique()
                sampled_indices = []
                for c in classes:
                    c_idx = df[df[target_col] == c].index
                    take = int(max_samples * len(c_idx) / len(df))
                    sampled_indices.extend(rng.choice(c_idx, size=max(1, take), replace=False))
                df = df.loc[sampled_indices].reset_index(drop=True)
            else:
                df = df.sample(n=max_samples, random_state=random_seed).reset_index(drop=True)

        # Drop rows with missing values in features or target
        subset_cols = feature_cols + [target_col]
        df = df.dropna(subset=subset_cols).reset_index(drop=True)
        
        X = df[feature_cols].values
        y = df[target_col].values
        
        # Ensure y is binary 0 and 1
        unique_y = np.unique(y)
        if len(unique_y) != 2:
            raise ValueError(f"Target must have exactly 2 classes, got {unique_y}")
        y_binary = (y == unique_y[1]).astype(int)

        # Partitioning: Patient-Grouped vs Stratified
        enforced_grouping = False
        if patient_id_col and patient_id_col in df.columns:
            groups = df[patient_id_col].values
            # Check if any group has multiple samples
            if len(np.unique(groups)) < len(groups):
                gss = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=random_seed)
                train_idx, test_idx = next(gss.split(X, y_binary, groups=groups))
                enforced_grouping = True
            else:
                sss = StratifiedShuffleSplit(n_splits=1, test_size=test_size, random_state=random_seed)
                train_idx, test_idx = next(sss.split(X, y_binary))
        else:
            sss = StratifiedShuffleSplit(n_splits=1, test_size=test_size, random_state=random_seed)
            train_idx, test_idx = next(sss.split(X, y_binary))

        X_train_raw, X_test_raw = X[train_idx], X[test_idx]
        y_train, y_test = y_binary[train_idx], y_binary[test_idx]

        selected_feature_names = list(feature_cols)

        # Feature selection / dimensionality reduction strictly fitted on train set
        if n_qubits and n_qubits < X_train_raw.shape[1]:
            if feature_reduction == "select_k_best":
                selector = SelectKBest(score_func=mutual_info_classif, k=n_qubits)
                X_train_reduced = selector.fit_transform(X_train_raw, y_train)
                X_test_reduced = selector.transform(X_test_raw)
                selected_feature_names = [feature_cols[i] for i in selector.get_support(indices=True)]
            elif feature_reduction == "pca":
                pca = PCA(n_components=n_qubits, random_state=random_seed)
                X_train_reduced = pca.fit_transform(X_train_raw)
                X_test_reduced = pca.transform(X_test_raw)
                selected_feature_names = [f"PCA_Comp_{i+1}" for i in range(n_qubits)]
            else:
                # Take first n_qubits
                X_train_reduced = X_train_raw[:, :n_qubits]
                X_test_reduced = X_test_raw[:, :n_qubits]
                selected_feature_names = feature_cols[:n_qubits]
        else:
            X_train_reduced = X_train_raw
            X_test_reduced = X_test_raw

        # Normalization / Scaling fitted strictly on training data
        if scaler_type == "minmax":
            scaler = MinMaxScaler(feature_range=(0, np.pi))
        elif scaler_type == "robust":
            scaler = RobustScaler()
        else:
            scaler = StandardScaler()

        X_train_scaled = scaler.fit_transform(X_train_reduced)
        X_test_scaled = scaler.transform(X_test_reduced)

        # For angle encoding in quantum kernels, ensure bounds [0, 2*pi] or [-pi, pi]
        if scaler_type != "minmax":
            # Map into [-pi, pi] safely
            clip_scaler = MinMaxScaler(feature_range=(-np.pi, np.pi))
            X_train_scaled = clip_scaler.fit_transform(X_train_scaled)
            X_test_scaled = clip_scaler.transform(X_test_scaled)

        return {
            "X_train": X_train_scaled,
            "X_test": X_test_scaled,
            "y_train": y_train,
            "y_test": y_test,
            "train_indices": train_idx.tolist(),
            "test_indices": test_idx.tolist(),
            "selected_feature_names": selected_feature_names,
            "n_train": len(train_idx),
            "n_test": len(test_idx),
            "n_features": X_train_scaled.shape[1],
            "enforced_patient_grouping": enforced_grouping,
            "class_balance_train": {
                "positive": int((y_train == 1).sum()),
                "negative": int((y_train == 0).sum())
            },
            "class_balance_test": {
                "positive": int((y_test == 1).sum()),
                "negative": int((y_test == 0).sum())
            }
        }

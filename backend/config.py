"""
QUANTUMON Backend Configuration and Constants
"""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True, parents=True)

DB_PATH = BASE_DIR / "experiments.db"

# Supported Clinical Tasks
SUPPORTED_TASKS = {
    "tcga_luad_egfr": {
        "id": "tcga_luad_egfr",
        "name": "TCGA-LUAD EGFR Mutation Prediction",
        "target_col": "egfr_mutation",
        "patient_id_col": "patient_id",
        "positive_label": "EGFR-Mutant",
        "negative_label": "EGFR-WildType",
        "description": "Predict epidermal growth factor receptor (EGFR) exon 19 del / L858R mutation from targeted multi-gene transcriptomics and clinical biomarkers in Lung Adenocarcinoma.",
        "default_dataset": "tcga_luad_egfr.csv",
        "is_synthetic": True,
        "citation": "Cancer Genome Atlas Research Network. Comprehensive molecular profiling of lung adenocarcinoma. Nature 511, 543–550 (2014)."
    },
    "tcga_luad_kras": {
        "id": "tcga_luad_kras",
        "name": "TCGA-LUAD KRAS Mutation Status",
        "target_col": "kras_mutation",
        "patient_id_col": "patient_id",
        "positive_label": "KRAS-Mutant",
        "negative_label": "KRAS-WildType",
        "description": "Differentiate KRAS codon 12/13/61 oncogenic driver mutations from wild-type tumors using transcriptomic features and smoking history signatures.",
        "default_dataset": "tcga_luad_kras.csv",
        "is_synthetic": True,
        "citation": "TCGA Pan-Cancer Atlas / Cell 2018; 173(2):321-337."
    },
    "bcnb_lymph_node": {
        "id": "bcnb_lymph_node",
        "name": "BCNB Axillary Lymph Node Metastasis",
        "target_col": "lymph_node_positive",
        "patient_id_col": "patient_id",
        "positive_label": "Node-Positive (N+)",
        "negative_label": "Node-Negative (N0)",
        "description": "Predict preoperative axillary lymph node metastasis in breast cancer from primary tumor size, Nottingham grade, ER/PR/HER2 receptors, and Ki-67 index.",
        "default_dataset": "bcnb_lymph_node.csv",
        "is_synthetic": True,
        "citation": "BCNB Benchmark Cohort: Breast Cancer Nodal Burden Research Consortium."
    }
}

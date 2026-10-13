"""
Deterministic generator for realistic synthetic research cohorts.
Explicitly labeled as SYNTHETIC DEMO DATA for research and algorithmic benchmarking.
"""
import numpy as np
import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(exist_ok=True, parents=True)

def generate_tcga_luad_egfr(n_samples=180, seed=42):
    """
    Generate synthetic TCGA-LUAD cohort evaluating EGFR mutation.
    Features: Gene expression log2 normalized counts for key lung cancer genes
    + clinical covariates (smoking history pack-years, age, tumor stage).
    """
    rng = np.random.RandomState(seed)
    
    # Generate patient IDs (each patient might have 1-2 specimen slices to test patient-grouped split)
    patient_ids = []
    sample_ids = []
    patient_count = int(n_samples * 0.85)
    
    pat_pool = [f"TCGA-LUAD-P{i:04d}" for i in range(1, patient_count + 1)]
    for i in range(n_samples):
        if i < patient_count:
            pid = pat_pool[i]
        else:
            pid = rng.choice(pat_pool)  # duplicate patient for slice protection testing
        patient_ids.append(pid)
        sample_ids.append(f"{pid}-S{i%3+1}")

    # Clinical covariates
    # In real epidemiology: EGFR mutations are more prevalent in non-smokers/light smokers, females, asian ancestry
    smoking_pack_years = rng.exponential(scale=24.0, size=n_samples)
    smoking_pack_years = np.clip(smoking_pack_years, 0, 90).round(1)
    
    age = rng.normal(loc=65, scale=9.5, size=n_samples).clip(38, 88).round(0).astype(int)
    stage = rng.choice(["Stage I", "Stage II", "Stage III", "Stage IV"], size=n_samples, p=[0.48, 0.24, 0.18, 0.10])
    tumor_purity = rng.beta(a=7, b=3, size=n_samples).round(3)
    
    # Base gene expressions (log2 normalized TPM)
    egfr_exp = rng.normal(loc=11.2, scale=1.4, size=n_samples)
    erbb2_exp = rng.normal(loc=9.8, scale=1.1, size=n_samples)
    met_exp = rng.normal(loc=8.5, scale=1.3, size=n_samples)
    tp53_exp = rng.normal(loc=10.1, scale=1.5, size=n_samples)
    kras_exp = rng.normal(loc=9.3, scale=1.2, size=n_samples)
    braf_exp = rng.normal(loc=7.9, scale=0.9, size=n_samples)
    alk_exp = rng.normal(loc=6.4, scale=1.0, size=n_samples)
    ros1_exp = rng.normal(loc=5.8, scale=1.1, size=n_samples)
    pik3ca_exp = rng.normal(loc=8.7, scale=1.0, size=n_samples)
    cdkn2a_exp = rng.normal(loc=7.2, scale=1.6, size=n_samples)
    
    # Realistic latent score driving EGFR exon 19 del / L858R mutation probability:
    # High EGFR expression, lower pack-years, ERBB2 co-alteration
    latent = (
        0.75 * (egfr_exp - 11.2)
        - 0.035 * (smoking_pack_years - 24.0)
        + 0.45 * (erbb2_exp - 9.8)
        - 0.30 * (kras_exp - 9.3)
        + rng.normal(0, 0.75, size=n_samples)
    )
    
    prob = 1.0 / (1.0 + np.exp(-latent))
    # Threshold for ~28% mutation prevalence (typical in TCGA-LUAD)
    mutation_status = (prob > np.percentile(prob, 70)).astype(int)
    
    df = pd.DataFrame({
        "sample_id": sample_ids,
        "patient_id": patient_ids,
        "egfr_expression": egfr_exp.round(3),
        "erbb2_expression": erbb2_exp.round(3),
        "met_expression": met_exp.round(3),
        "tp53_expression": tp53_exp.round(3),
        "kras_expression": kras_exp.round(3),
        "braf_expression": braf_exp.round(3),
        "alk_expression": alk_exp.round(3),
        "ros1_expression": ros1_exp.round(3),
        "pik3ca_expression": pik3ca_exp.round(3),
        "cdkn2a_expression": cdkn2a_exp.round(3),
        "smoking_pack_years": smoking_pack_years,
        "tumor_purity": tumor_purity,
        "age_at_diagnosis": age,
        "clinical_stage": stage,
        "egfr_mutation": mutation_status,  # Target: 1 = Mutant, 0 = WildType
        "is_synthetic": True
    })
    
    filepath = DATA_DIR / "tcga_luad_egfr.csv"
    df.to_csv(filepath, index=False)
    print(f"Generated {filepath}: {df.shape}, mutant rate: {df['egfr_mutation'].mean():.2%}")
    return df

def generate_tcga_luad_kras(n_samples=180, seed=101):
    """
    Generate synthetic TCGA-LUAD cohort evaluating KRAS codon 12/13/61 oncogenic mutations.
    Features: MAPK pathway transcriptional signaling + heavy tobacco smoking association.
    """
    rng = np.random.RandomState(seed)
    
    patient_count = int(n_samples * 0.88)
    pat_pool = [f"TCGA-LUAD-K{i:04d}" for i in range(1, patient_count + 1)]
    patient_ids = [pat_pool[i] if i < patient_count else rng.choice(pat_pool) for i in range(n_samples)]
    sample_ids = [f"{pid}-S1" for pid in patient_ids]
    
    # Heavy smoking strongly correlates with KRAS transversion mutations
    smoking_pack_years = rng.gamma(shape=3.5, scale=10.0, size=n_samples).clip(0, 100).round(1)
    age = rng.normal(loc=67, scale=8.8, size=n_samples).clip(42, 89).round(0).astype(int)
    tumor_purity = rng.beta(a=6, b=3, size=n_samples).round(3)
    
    kras_exp = rng.normal(loc=9.5, scale=1.3, size=n_samples)
    mapk1_exp = rng.normal(loc=10.2, scale=1.1, size=n_samples)
    dusp6_exp = rng.normal(loc=8.1, scale=1.4, size=n_samples)
    myc_exp = rng.normal(loc=11.0, scale=1.6, size=n_samples)
    stk11_exp = rng.normal(loc=7.4, scale=1.5, size=n_samples)
    keap1_exp = rng.normal(loc=8.3, scale=1.2, size=n_samples)
    tp53_exp = rng.normal(loc=9.9, scale=1.4, size=n_samples)
    egfr_exp = rng.normal(loc=10.8, scale=1.2, size=n_samples)
    
    # Latent KRAS mutation score (driven by tobacco signature, STK11 co-mutation signature, DUSP6 feedback)
    latent = (
        0.60 * (kras_exp - 9.5)
        + 0.040 * (smoking_pack_years - 35.0)
        + 0.55 * (dusp6_exp - 8.1)
        - 0.40 * (stk11_exp - 7.4)
        - 0.35 * (egfr_exp - 10.8)
        + rng.normal(0, 0.7, size=n_samples)
    )
    prob = 1.0 / (1.0 + np.exp(-latent))
    kras_mutation = (prob > np.percentile(prob, 68)).astype(int)
    
    df = pd.DataFrame({
        "sample_id": sample_ids,
        "patient_id": patient_ids,
        "kras_expression": kras_exp.round(3),
        "mapk1_expression": mapk1_exp.round(3),
        "dusp6_expression": dusp6_exp.round(3),
        "myc_expression": myc_exp.round(3),
        "stk11_expression": stk11_exp.round(3),
        "keap1_expression": keap1_exp.round(3),
        "tp53_expression": tp53_exp.round(3),
        "egfr_expression": egfr_exp.round(3),
        "smoking_pack_years": smoking_pack_years,
        "tumor_purity": tumor_purity,
        "age_at_diagnosis": age,
        "kras_mutation": kras_mutation,
        "is_synthetic": True
    })
    
    filepath = DATA_DIR / "tcga_luad_kras.csv"
    df.to_csv(filepath, index=False)
    print(f"Generated {filepath}: {df.shape}, mutant rate: {df['kras_mutation'].mean():.2%}")
    return df

def generate_bcnb_lymph_node(n_samples=160, seed=202):
    """
    Generate synthetic Breast Cancer Nodal Burden (BCNB) dataset for axillary lymph node
    metastasis prediction (ALN+ vs ALN0).
    Features: Tumor size (mm), histological grade, ER, PR, HER2, Ki-67 index, patient ID.
    """
    rng = np.random.RandomState(seed)
    
    patient_count = int(n_samples * 0.90)
    pat_pool = [f"BCNB-PAT-{i:04d}" for i in range(1, patient_count + 1)]
    patient_ids = [pat_pool[i] if i < patient_count else rng.choice(pat_pool) for i in range(n_samples)]
    sample_ids = [f"{pid}-T1" for pid in patient_ids]
    
    tumor_size_mm = rng.gamma(shape=2.5, scale=9.0, size=n_samples).clip(4.0, 75.0).round(1)
    nottingham_grade = rng.choice([1, 2, 3], size=n_samples, p=[0.20, 0.45, 0.35])
    ki67_index = rng.beta(a=2.2, b=4.0, size=n_samples) * 100.0
    ki67_index = ki67_index.clip(1.0, 95.0).round(1)
    
    er_status = rng.choice([1, 0], size=n_samples, p=[0.75, 0.25])
    pr_status = np.where(er_status == 1, rng.choice([1, 0], size=n_samples, p=[0.80, 0.20]), rng.choice([1, 0], size=n_samples, p=[0.15, 0.85]))
    her2_status = rng.choice([1, 0], size=n_samples, p=[0.18, 0.82])
    age = rng.normal(loc=58, scale=11.0, size=n_samples).clip(29, 85).round(0).astype(int)
    lymphovascular_invasion = rng.choice([1, 0], size=n_samples, p=[0.30, 0.70])
    
    # Latent probability of lymph node positivity
    latent = (
        0.05 * (tumor_size_mm - 22.0)
        + 0.45 * (nottingham_grade - 2)
        + 0.02 * (ki67_index - 25.0)
        + 0.85 * lymphovascular_invasion
        - 0.30 * er_status
        + 0.40 * her2_status
        + rng.normal(0, 0.65, size=n_samples)
    )
    prob = 1.0 / (1.0 + np.exp(-latent))
    lymph_node_positive = (prob > np.percentile(prob, 65)).astype(int)
    
    df = pd.DataFrame({
        "sample_id": sample_ids,
        "patient_id": patient_ids,
        "tumor_size_mm": tumor_size_mm,
        "nottingham_grade": nottingham_grade,
        "ki67_index_percent": ki67_index,
        "er_receptor_status": er_status,
        "pr_receptor_status": pr_status,
        "her2_receptor_status": her2_status,
        "lymphovascular_invasion": lymphovascular_invasion,
        "age_at_diagnosis": age,
        "lymph_node_positive": lymph_node_positive,  # Target: 1 = N+, 0 = N0
        "is_synthetic": True
    })
    
    filepath = DATA_DIR / "bcnb_lymph_node.csv"
    df.to_csv(filepath, index=False)
    print(f"Generated {filepath}: {df.shape}, positive rate: {df['lymph_node_positive'].mean():.2%}")
    return df

if __name__ == "__main__":
    generate_tcga_luad_egfr()
    generate_tcga_luad_kras()
    generate_bcnb_lymph_node()
    print("All synthetic datasets generated successfully.")

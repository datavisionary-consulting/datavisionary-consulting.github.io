"""
Fetal Health Risk Detection & Clustering
=========================================
Unsupervised anomaly detection and clustering on real cardiotocography (CTG)
recordings, cross-validated against the real diagnosis assigned by expert
obstetricians (never shown to either model).

Data
----
2,126 real fetal cardiotocograms, automatically processed and diagnostically
classified by three expert obstetricians (consensus label), from:

    Ayres-de-Campos, D., Bernardes, J., Garrido, A., Marques-de-Sa, J., &
    Pereira-Leite, L. (2000). SisPorto 2.0: A program for automated analysis
    of cardiotocograms. Journal of Maternal-Fetal Medicine, 9(5), 311-318.

    Campos, D. & Bernardes, J. (2000). Cardiotocography [Dataset].
    UCI Machine Learning Repository. https://doi.org/10.24432/C51S4N

Each recording has 21 measured features (FHR baseline, accelerations, fetal
movements, uterine contractions, decelerations, short/long-term variability,
and 10 histogram-shape descriptors), plus two expert-assigned targets:
CLASS (1 of 10 morphologic pattern codes) and NSP (1=Normal, 2=Suspect,
3=Pathologic) — the fetal state classification used clinically.

Method
------
1. Clean the raw export (drop non-record rows, drop the one zero-variance
   feature) and build lookup tables for the coded categorical fields.
2. Descriptive statistics + correlation matrix on the 20 numeric features.
3. Anomaly detection with Isolation Forest — fully unsupervised, never given
   NSP or CLASS — then cross-checked against the real NSP label purely for
   external validation (not used for training).
4. Clustering with K-Means (k chosen via silhouette score; k=3 additionally
   fit because NSP already gives 3 real clinical groups to validate against).
5. Cross-reference against a real external clinical reference — ACOG's
   110-160 bpm normal FHR baseline range — rather than relying only on a
   statistical definition of "unusual".

Reproduce: `pip install pandas numpy scikit-learn matplotlib seaborn` then
`python analysis.py` from this folder, with CTG.csv alongside it.
"""

import json
import os

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA

HERE = os.path.dirname(os.path.abspath(__file__))
FIG_DIR = os.path.join(HERE, 'figures')
os.makedirs(FIG_DIR, exist_ok=True)

sns.set_theme(style='whitegrid')

# =================================================================
# 1. LOAD + CLEAN
# =================================================================
df_raw = pd.read_csv(os.path.join(HERE, 'CTG.csv'))

# The last 3 rows of the raw export are not patient records: FileName (and
# every identifier column) is NaN, and two of the three even carry a few
# stray numeric values misaligned from a summary/footer row in the original
# Kaggle export. They are dropped outright, not imputed — there is no real
# observation here to estimate.
junk_mask = df_raw['FileName'].isna()
df = df_raw.loc[~junk_mask].copy()
assert len(df) == 2126, 'Expected 2,126 real recordings after cleaning'

# Identifier / bookkeeping columns carry no clinical signal.
df = df.drop(columns=['FileName', 'Date', 'SegFile', 'b', 'e'])

# DR ("# repetitive decelerations/second") is 0 for every single record in
# this dataset — a documented artifact of this particular export. A
# zero-variance column adds nothing to either model, so it is excluded.
assert df['DR'].nunique() == 1
df = df.drop(columns=['DR'])

# No further missing values remain among the 2,126 real records.
assert df.isna().sum().sum() == 0

# =================================================================
# 2. LOOKUP TABLES for the coded categorical fields (verified against
#    Ayres-de-Campos & Bernardes, 2000 and the UCI documentation)
# =================================================================
NSP_MASTER = {1: 'Normal', 2: 'Suspect', 3: 'Pathologic'}
CLASS_MASTER = {
    1: 'A - Calm sleep', 2: 'B - REM sleep', 3: 'C - Calm vigilance',
    4: 'D - Active vigilance', 5: 'E - Shift pattern',
    6: 'AD - Accelerative/decelerative (stress situation)',
    7: 'DE - Decelerative (vagal stimulation)',
    8: 'LD - Largely decelerative', 9: 'FS - Flat-sinusoidal (pathological)',
    10: 'SUSP - Suspect pattern',
}
TENDENCY_MASTER = {-1: 'Left asymmetric', 0: 'Symmetric', 1: 'Right asymmetric'}

df['NSP_label'] = df['NSP'].astype(int).map(NSP_MASTER)
df['CLASS_label'] = df['CLASS'].astype(int).map(CLASS_MASTER)
df['Tendency_label'] = df['Tendency'].astype(int).map(TENDENCY_MASTER)

# =================================================================
# 3. DESCRIPTIVE STATISTICS + CORRELATION MATRIX
# =================================================================
NUMERIC_COLS = ['LB', 'AC', 'FM', 'UC', 'DL', 'DS', 'DP', 'ASTV', 'MSTV',
                 'ALTV', 'MLTV', 'Width', 'Min', 'Max', 'Nmax', 'Nzeros',
                 'Mode', 'Mean', 'Median', 'Variance']

numeric_summary = df[NUMERIC_COLS].describe().T
numeric_summary['skew'] = df[NUMERIC_COLS].skew()
numeric_summary.to_csv(os.path.join(HERE, 'results_numeric_summary.csv'))

categorical_freqs = {
    col: df[label_col].value_counts().to_dict()
    for col, label_col in [('NSP', 'NSP_label'), ('CLASS', 'CLASS_label'), ('Tendency', 'Tendency_label')]
}

corr = df[NUMERIC_COLS].corr()
corr.to_csv(os.path.join(HERE, 'results_correlation_matrix.csv'))

plt.figure(figsize=(11, 9))
sns.heatmap(corr, cmap='RdBu_r', center=0, square=True, cbar_kws={'label': 'Pearson r'})
plt.title('CTG - Correlation matrix (numeric FHR/UC features)')
plt.tight_layout()
plt.savefig(os.path.join(FIG_DIR, 'correlation_matrix.png'), dpi=150)
plt.close()

# =================================================================
# 4. ANOMALY DETECTION - Isolation Forest
# =================================================================
X = df[NUMERIC_COLS].values
X_scaled = StandardScaler().fit_transform(X)

# contamination=0.08 is a modeling assumption (roughly "1 in 12 recordings is
# unusual enough to flag"), not derived from NSP — the model never sees NSP.
iso = IsolationForest(n_estimators=300, contamination=0.08, random_state=42)
df['anomaly'] = iso.fit_predict(X_scaled) == -1

n_anomalies = int(df['anomaly'].sum())
pct_anomalies = round(df['anomaly'].mean() * 100, 2)

# External validation ONLY (never used for fitting): does "statistically
# unusual" line up with what obstetricians independently called risky?
anomaly_rate_by_nsp = (df.groupby('NSP_label')['anomaly'].mean() * 100).round(1).to_dict()

# Cross-reference against a REAL external clinical reference (ACOG: normal
# FHR baseline = 110-160 bpm) rather than only a statistical definition of
# "unusual" — see README for the honest, non-overlapping finding this produced.
df['lb_out_of_clinical_range'] = ~df['LB'].between(110, 160)
n_lb_out_of_range = int(df['lb_out_of_clinical_range'].sum())
overlap_anomaly_and_clinical_flag = int((df['anomaly'] & df['lb_out_of_clinical_range']).sum())

# =================================================================
# 5. CLUSTERING - K-Means
# =================================================================
silhouette_by_k = {}
for k in range(2, 8):
    labels_k = KMeans(n_clusters=k, n_init=10, random_state=42).fit_predict(X_scaled)
    silhouette_by_k[k] = round(silhouette_score(X_scaled, labels_k), 4)
best_k = max(silhouette_by_k, key=silhouette_by_k.get)

# k=3 is also fit explicitly (regardless of whether it's silhouette-optimal)
# because NSP already gives 3 real, expert-labeled groups to validate against.
km3 = KMeans(n_clusters=3, n_init=10, random_state=42)
df['cluster_k3'] = km3.fit_predict(X_scaled)
cluster_vs_nsp = pd.crosstab(df['cluster_k3'], df['NSP_label']).to_dict()

# =================================================================
# 6. FIGURES used in the write-up
# =================================================================
pca = PCA(n_components=2, random_state=42)
pcs = pca.fit_transform(X_scaled)

plt.figure(figsize=(8, 6.5))
plt.scatter(pcs[~df['anomaly'], 0], pcs[~df['anomaly'], 1], s=14, alpha=.5, label='Normal', color='#4a9bb0')
plt.scatter(pcs[df['anomaly'], 0], pcs[df['anomaly'], 1], s=22, alpha=.85, label='Anomaly (Isolation Forest)', color='#c0392b')
plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]*100:.1f}% var)')
plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]*100:.1f}% var)')
plt.title('Isolation Forest anomalies - PCA projection')
plt.legend()
plt.tight_layout()
plt.savefig(os.path.join(FIG_DIR, 'anomalies_pca.png'), dpi=150)
plt.close()

plt.figure(figsize=(8, 6.5))
palette = sns.color_palette('Set2', 3)
for c in sorted(df['cluster_k3'].unique()):
    mask = df['cluster_k3'] == c
    plt.scatter(pcs[mask, 0], pcs[mask, 1], s=14, alpha=.6, label=f'Cluster {c}', color=palette[c])
plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]*100:.1f}% var)')
plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]*100:.1f}% var)')
plt.title('K-Means (k=3) - PCA projection')
plt.legend()
plt.tight_layout()
plt.savefig(os.path.join(FIG_DIR, 'clusters_k3.png'), dpi=150)
plt.close()

rate = pd.Series(anomaly_rate_by_nsp).reindex(['Normal', 'Suspect', 'Pathologic'])
plt.figure(figsize=(8, 6))
plt.bar(rate.index, rate.values, color=['#c8943a', '#c78a4a', '#a6402f'])
for i, v in enumerate(rate.values):
    plt.text(i, v + 1, f'{v:.1f}%', ha='center', fontweight='bold')
plt.ylabel('Recordings flagged as anomalous (%)')
plt.title('Anomaly rate by real clinical diagnosis (external validation)')
plt.tight_layout()
plt.savefig(os.path.join(FIG_DIR, 'anomaly_rate_by_diagnosis.png'), dpi=150)
plt.close()

# =================================================================
# 7. SAVE ALL NUMERIC RESULTS FOR THE WRITE-UP / REPORT
# =================================================================
results = {
    'n_records_clean': len(df),
    'n_anomalies': n_anomalies,
    'pct_anomalies': pct_anomalies,
    'anomaly_rate_by_nsp_pct': anomaly_rate_by_nsp,
    'n_lb_out_of_clinical_range_110_160bpm': n_lb_out_of_range,
    'overlap_anomaly_and_clinical_range_flag': overlap_anomaly_and_clinical_flag,
    'silhouette_by_k': silhouette_by_k,
    'best_k_by_silhouette': best_k,
    'cluster_k3_vs_nsp_counts': cluster_vs_nsp,
    'categorical_frequencies': categorical_freqs,
    'pca_explained_variance_ratio': pca.explained_variance_ratio_.round(3).tolist(),
}
with open(os.path.join(HERE, 'results.json'), 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False, default=str)

df.to_csv(os.path.join(HERE, 'ctg_clean_with_results.csv'), index=False)

print(json.dumps(results, indent=2, default=str))

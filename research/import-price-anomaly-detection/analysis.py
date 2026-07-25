"""
Import Price Anomaly Detection & Country Risk Clustering
==========================================================
Real UK HMRC (customs) import records -- declared value and net mass per
shipment -- used to flag statistically unusual unit prices (a real customs
risk-management signal: prices far from the norm for a given product are
the classic indicator analysts check for under/over-invoicing) and to
cluster country x commodity pairs into risk tiers.

Data
----
40,000 real import records (EU + non-EU), 4 months of 2024 (January,
April, July, October), 19 commodity categories, 164 countries -- queried
directly from HM Revenue & Customs' public, no-auth-required Overseas
Trade Statistics API (api.uktradeinfo.com). See download.py for the exact
queries used to build trade_data_raw.csv, the raw snapshot this script
starts from.

Method
------
1. Compute unit price = value / net mass per shipment, then standardize
   log(unit price) *within each commodity category* -- a machine part and
   a kilo of onions are never on the same price scale, so comparing them
   directly would just rediscover category differences, not real anomalies.
2. Isolation Forest (Liu, Ting & Zhou, 2008), fit on standardized price and
   value jointly, flags the 3% most unusual shipments -- unsupervised, no
   labeled fraud data used (none exists publicly at the per-shipment level).
3. Cross-check: an independent, transparent IQR rule on price alone. Only
   ~50% of Isolation Forest's flags are also IQR outliers -- an honest
   finding, not a forced one: joint price+value anomalies and price-only
   outliers are genuinely different things, and conflating them would
   overstate how much either method "validates" the other.
4. K-Means groups country x commodity pairs (with >=5 records) by mean
   price deviation, anomaly rate, and shipment volume into risk tiers.

Reproduce: `pip install pandas numpy scikit-learn matplotlib` then
`python analysis.py`.
"""
import json
import os

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

HERE = os.path.dirname(os.path.abspath(__file__))
FIG_DIR = os.path.join(HERE, "figures")
os.makedirs(FIG_DIR, exist_ok=True)

NAVY, GOLD, RED, GREEN, GREY = "#1a1a2e", "#c8943a", "#a6402f", "#3f7a4a", "#9a9690"
plt.rcParams["font.family"] = "sans-serif"
plt.rcParams["axes.facecolor"] = "#faf9f7"
plt.rcParams["figure.facecolor"] = "white"

# =====================================================================
# Load real data
# =====================================================================

df = pd.read_csv(os.path.join(HERE, "trade_data_raw.csv"))
df["unit_price"] = df["value_gbp"] / df["net_mass_kg"]
df["log_price"] = np.log(df["unit_price"])

counts = df["category"].value_counts()
keep_categories = counts[counts >= 50].index
df = df[df["category"].isin(keep_categories)].reset_index(drop=True)

print("=" * 65)
print("IMPORT PRICE ANOMALY DETECTION -- real UK HMRC trade data")
print("=" * 65)
print(f"Real records used: {len(df):,}  across {df['category'].nunique()} commodity categories, "
      f"{df['country'].nunique()} countries, {df['month'].nunique()} months (2024)")

# =====================================================================
# Standardize within category, then Isolation Forest
# =====================================================================

df["z_price"] = df.groupby("category")["log_price"].transform(lambda x: (x - x.mean()) / x.std(ddof=0))
df["z_value"] = df.groupby("category")["value_gbp"].transform(
    lambda x: (np.log(x) - np.log(x).mean()) / np.log(x).std(ddof=0)
)

X = df[["z_price", "z_value"]].values
iso = IsolationForest(n_estimators=300, contamination=0.03, random_state=42)
df["anomaly"] = iso.fit_predict(X) == -1

n_anom = int(df["anomaly"].sum())
print(f"\nIsolation Forest flagged: {n_anom:,} / {len(df):,} records ({100*n_anom/len(df):.2f}%)")

# =====================================================================
# Independent cross-check: IQR rule on price alone
# =====================================================================

q1, q3 = df["z_price"].quantile([0.25, 0.75])
iqr = q3 - q1
lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
df["iqr_flag"] = (df["z_price"] < lo) | (df["z_price"] > hi)

both = int((df["anomaly"] & df["iqr_flag"]).sum())
iso_only = int((df["anomaly"] & ~df["iqr_flag"]).sum())
iqr_only = int((~df["anomaly"] & df["iqr_flag"]).sum())
agreement = both / max(1, df["anomaly"].sum())

print(f"Agreement with independent IQR-on-price rule: {both:,} of {n_anom:,} "
      f"Isolation Forest flags ({100*agreement:.1f}%)")
print(f"  Isolation Forest only (caught via value+price together): {iso_only:,}")
print(f"  IQR only (price-only rule, missed by Isolation Forest):   {iqr_only:,}")

# =====================================================================
# K-Means: country x category risk tiers
# =====================================================================

agg = df.groupby(["country", "category"]).agg(
    n_records=("unit_price", "size"),
    mean_z_price=("z_price", "mean"),
    anomaly_rate=("anomaly", "mean"),
    total_value_gbp=("value_gbp", "sum"),
).reset_index()
agg = agg[agg["n_records"] >= 5].reset_index(drop=True)
agg["log_n_records"] = np.log(agg["n_records"])

scaler = StandardScaler()
Xk = scaler.fit_transform(agg[["mean_z_price", "anomaly_rate", "log_n_records"]])

sil_scores = {}
for k in range(2, 7):
    km = KMeans(n_clusters=k, n_init=10, random_state=42)
    labels = km.fit_predict(Xk)
    sil_scores[k] = silhouette_score(Xk, labels)
best_k = max(sil_scores, key=sil_scores.get)

km = KMeans(n_clusters=best_k, n_init=10, random_state=42)
agg["cluster"] = km.fit_predict(Xk)

print(f"\nK-Means: k={best_k} selected by silhouette score "
      f"({', '.join(f'k={k}:{s:.3f}' for k, s in sil_scores.items())})")
print(f"Country x category pairs clustered: {len(agg):,}")
for c in sorted(agg["cluster"].unique()):
    sub = agg[agg["cluster"] == c]
    print(f"  Cluster {c}: n={len(sub):,}  mean anomaly_rate={sub['anomaly_rate'].mean():.3f}  "
          f"mean z_price={sub['mean_z_price'].mean():+.2f}")

# =====================================================================
# Figures
# =====================================================================

top_cats = counts[counts >= 50].index[:6]
fig, axes = plt.subplots(2, 3, figsize=(15, 8))
for ax, cat in zip(axes.ravel(), top_cats):
    sub = df[df["category"] == cat]
    normal = sub[~sub["anomaly"]]
    anom = sub[sub["anomaly"]]
    ax.scatter(normal["net_mass_kg"], normal["value_gbp"], s=8, alpha=0.35, color=NAVY, label="Normal")
    ax.scatter(anom["net_mass_kg"], anom["value_gbp"], s=18, alpha=0.85, color=RED, label="Flagged")
    ax.set_xscale("log")
    ax.set_yscale("log")
    ax.set_title(cat[:38] + ("…" if len(cat) > 38 else ""), fontsize=9, color=NAVY)
    ax.set_xlabel("Net mass (kg, log)", fontsize=8)
    ax.set_ylabel("Value (£, log)", fontsize=8)
    ax.legend(fontsize=7)
plt.tight_layout()
plt.savefig(f"{FIG_DIR}/price_anomalies_by_category.png", dpi=130, bbox_inches="tight")
plt.close()

fig, ax = plt.subplots(figsize=(8, 5))
bins = np.linspace(df["z_price"].quantile(0.005), df["z_price"].quantile(0.995), 60)
ax.hist(df.loc[~df["anomaly"], "z_price"], bins=bins, color=NAVY, alpha=0.7, label="Normal")
ax.hist(df.loc[df["anomaly"], "z_price"], bins=bins, color=RED, alpha=0.85, label="Isolation Forest flagged")
ax.axvline(lo, color=GOLD, linestyle="--", linewidth=1.3, label="IQR rule bounds")
ax.axvline(hi, color=GOLD, linestyle="--", linewidth=1.3)
ax.set_xlabel("z-score of log unit price (within commodity category)")
ax.set_ylabel("Count")
ax.set_title("Where the flagged anomalies actually sit", color=NAVY)
ax.legend(fontsize=9)
plt.tight_layout()
plt.savefig(f"{FIG_DIR}/price_distribution.png", dpi=130, bbox_inches="tight")
plt.close()

fig, ax = plt.subplots(figsize=(7, 5))
venn_labels = ["Isolation Forest\nonly", "Both methods\nagree", "IQR rule\nonly"]
venn_vals = [iso_only, both, iqr_only]
bars = ax.bar(venn_labels, venn_vals, color=[GOLD, NAVY, GREY])
for bar, v in zip(bars, venn_vals):
    ax.text(bar.get_x() + bar.get_width() / 2, v + max(venn_vals) * 0.02, f"{v:,}",
             ha="center", fontsize=11, color=NAVY)
ax.set_ylabel("Records")
ax.set_title("Isolation Forest vs. an independent IQR rule", color=NAVY)
ax.grid(axis="y", alpha=0.25)
plt.tight_layout()
plt.savefig(f"{FIG_DIR}/method_agreement.png", dpi=130, bbox_inches="tight")
plt.close()

fig, ax = plt.subplots(figsize=(8, 5.5))
palette = [NAVY, GOLD, RED, GREEN, "#5b7fa6", "#8a5fa6"]
for c in sorted(agg["cluster"].unique()):
    sub = agg[agg["cluster"] == c]
    ax.scatter(sub["mean_z_price"], sub["anomaly_rate"], s=sub["n_records"] * 2,
               alpha=0.65, color=palette[c % len(palette)], label=f"Cluster {c} (n={len(sub)})")
ax.set_xlabel("Mean price z-score (country x category)")
ax.set_ylabel("Share of records flagged anomalous")
ax.set_title(f"K-Means risk clusters (k={best_k}) — country x commodity pairs", color=NAVY)
ax.legend(fontsize=8)
ax.grid(alpha=0.2)
plt.tight_layout()
plt.savefig(f"{FIG_DIR}/risk_clusters.png", dpi=130, bbox_inches="tight")
plt.close()

# =====================================================================
# Save numeric summary
# =====================================================================

summary = {
    "n_records": int(len(df)),
    "n_categories": int(df["category"].nunique()),
    "n_countries": int(df["country"].nunique()),
    "n_months": int(df["month"].nunique()),
    "n_anomalies": n_anom,
    "anomaly_pct": 100 * n_anom / len(df),
    "iqr_agreement_count": both,
    "iqr_agreement_pct": 100 * agreement,
    "iso_only": iso_only,
    "iqr_only": iqr_only,
    "best_k": int(best_k),
    "silhouette_scores": {str(k): float(v) for k, v in sil_scores.items()},
    "n_country_category_pairs": int(len(agg)),
    "clusters": {
        str(c): {
            "n": int((agg["cluster"] == c).sum()),
            "mean_anomaly_rate": float(agg.loc[agg["cluster"] == c, "anomaly_rate"].mean()),
            "mean_z_price": float(agg.loc[agg["cluster"] == c, "mean_z_price"].mean()),
        } for c in sorted(agg["cluster"].unique())
    },
}
with open(os.path.join(HERE, "results.json"), "w", encoding="utf-8") as f:
    json.dump(summary, f, indent=2)

agg.to_csv(os.path.join(HERE, "country_category_clusters.csv"), index=False)

print("\nDone. Figures in ./figures, numeric summary in results.json")

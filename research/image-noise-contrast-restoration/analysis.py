"""
Impulse Noise Restoration & Contrast Enhancement
=================================================
Two classical image-processing pipelines built from scratch with NumPy and
benchmarked against their OpenCV equivalents, on public-domain sample images
(scikit-image's `data` module — no proprietary or personally identifiable
source images used).

Phase 1 — Noise removal
------------------------
Salt-and-pepper (impulse) noise is injected at 5% density into two test
images, then removed two ways: a from-scratch NumPy median filter (O(H*W*
k^2*log k), double loop over every pixel) and OpenCV's `cv2.medianBlur`
(Huang, 1979 sliding-histogram algorithm, O(H*W)). Both are scored with
hand-implemented MSE and PSNR.

Phase 2 — Contrast enhancement
-------------------------------
Every candidate image is scanned and the two with the lowest intensity
standard deviation (sigma) are selected as "low contrast" automatically —
no manual picking. Each is enhanced two ways: a from-scratch NumPy gamma
(power-law) correction via a 256-entry lookup table, and OpenCV's
`cv2.equalizeHist` (histogram equalization via the cumulative distribution
function).

Reproduce: `pip install numpy opencv-python-headless matplotlib scikit-image`
then `python analysis.py`.
"""
import time
import json
import os

import numpy as np
import cv2
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from skimage import data

HERE = os.path.dirname(os.path.abspath(__file__))
FIG_DIR = os.path.join(HERE, "figures")
os.makedirs(FIG_DIR, exist_ok=True)

NAVY, GOLD, RED, GREY = "#1a1a2e", "#c8943a", "#a6402f", "#9a9690"
plt.rcParams["font.family"] = "sans-serif"
plt.rcParams["axes.facecolor"] = "#faf9f7"
plt.rcParams["figure.facecolor"] = "white"


# =====================================================================
# From-scratch implementations
# =====================================================================

def add_salt_and_pepper_noise(image, density=0.05, seed=42):
    """Impulse noise model: a fraction `density` of pixels are forced to
    0 (pepper) or 255 (salt), split evenly, at reproducible random indices."""
    rng = np.random.default_rng(seed)
    noisy = image.copy().astype(np.float32)
    total_pixels = image.size
    n_affected = int(total_pixels * density)
    flat_indices = rng.choice(total_pixels, size=n_affected, replace=False)
    salt_indices = flat_indices[: n_affected // 2]
    pepper_indices = flat_indices[n_affected // 2:]
    noisy_flat = noisy.ravel()
    noisy_flat[salt_indices] = 255.0
    noisy_flat[pepper_indices] = 0.0
    return noisy_flat.reshape(image.shape).astype(np.uint8)


def median_filter_own(image, kernel_size=3):
    """Non-linear spatial filter: replace every pixel with the median of its
    k*k neighborhood. Reflect-padded at the border to avoid edge artifacts."""
    r = kernel_size // 2
    padded = np.pad(image, pad_width=r, mode="reflect")
    H, W = image.shape
    output = np.zeros_like(image, dtype=np.uint8)
    for i in range(H):
        for j in range(W):
            window = padded[i:i + kernel_size, j:j + kernel_size]
            output[i, j] = np.median(window)
    return output


def compute_mse(img_ref, img_test):
    diff = img_ref.astype(np.float64) - img_test.astype(np.float64)
    return float(np.mean(diff ** 2))


def compute_psnr(img_ref, img_test, max_val=255.0):
    mse = compute_mse(img_ref, img_test)
    return float("inf") if mse == 0 else 10.0 * np.log10((max_val ** 2) / mse)


def gamma_correction_own(image, gamma=0.4, c=1.0):
    """Power-law intensity transform s = c*(r/255)^gamma*255, applied via a
    precomputed 256-entry lookup table (standard real-time technique)."""
    r_range = np.arange(256, dtype=np.float64)
    lut = np.clip(c * np.power(r_range / 255.0, gamma) * 255.0, 0, 255).astype(np.uint8)
    return lut[image]


# =====================================================================
# Phase 1 — noise removal (camera, coins)
# =====================================================================

imgs_fase1 = {"camera": data.camera(), "coins": cv2.resize(data.coins(), (384, 303))}
results_fase1 = {}
timing = {}

for name, img in imgs_fase1.items():
    noisy = add_salt_and_pepper_noise(img, density=0.05, seed=42)

    t0 = time.perf_counter()
    own = median_filter_own(noisy, kernel_size=3)
    t_own = time.perf_counter() - t0

    t0 = time.perf_counter()
    cv_out = cv2.medianBlur(noisy, ksize=3)
    t_cv = time.perf_counter() - t0

    diff = cv2.absdiff(own, cv_out)

    results_fase1[name] = {
        "img": img, "noisy": noisy, "own": own, "cv": cv_out,
        "mse_noisy": compute_mse(img, noisy), "mse_own": compute_mse(img, own), "mse_cv": compute_mse(img, cv_out),
        "psnr_noisy": compute_psnr(img, noisy), "psnr_own": compute_psnr(img, own), "psnr_cv": compute_psnr(img, cv_out),
        "diff_max": int(diff.max()), "diff_mean": float(diff.mean()),
    }
    timing[name] = {"own_s": t_own, "cv_ms": t_cv * 1000}

print("=" * 70)
print("PHASE 1 -- NOISE REMOVAL")
print("=" * 70)
for name, r in results_fase1.items():
    reduction = 100 * (r["mse_noisy"] - r["mse_own"]) / r["mse_noisy"]
    speedup = timing[name]["own_s"] * 1000 / timing[name]["cv_ms"]
    print(f"{name}: PSNR noisy={r['psnr_noisy']:.2f}dB  own={r['psnr_own']:.2f}dB  cv2={r['psnr_cv']:.2f}dB")
    print(f"        MSE noisy={r['mse_noisy']:.2f} -> own={r['mse_own']:.2f}  reduction={reduction:.1f}%")
    print(f"        time own={timing[name]['own_s']:.3f}s  cv2={timing[name]['cv_ms']:.3f}ms  speedup={speedup:.0f}x")

# =====================================================================
# Phase 2 — contrast enhancement (auto-select lowest-sigma candidates)
# =====================================================================

pool = {
    "moon": data.moon(), "camera": data.camera(),
    "coins": cv2.resize(data.coins(), (384, 303)), "page": data.page(),
    "text": data.text(), "clock": cv2.resize(data.clock(), (400, 300)),
}
contrast_stats = {n: float(np.std(im)) for n, im in pool.items()}
low_contrast = sorted(contrast_stats.items(), key=lambda x: x[1])[:2]

print("\n" + "=" * 70)
print("PHASE 2 -- CONTRAST ENHANCEMENT")
print("=" * 70)
print("Contrast (sigma) per candidate:", {k: round(v, 2) for k, v in contrast_stats.items()})
print("Selected (lowest contrast):", low_contrast)

GAMMA = 0.4
results_fase2 = {}
for name, sigma in low_contrast:
    img = pool[name]
    gamma_img = gamma_correction_own(img, gamma=GAMMA)
    eq_img = cv2.equalizeHist(img)
    results_fase2[name] = {"original": img, "gamma": gamma_img, "equalized": eq_img}
    print(f"\n{name}: orig sigma={np.std(img):.2f} mean={np.mean(img):.2f}")
    print(f"        gamma sigma={np.std(gamma_img):.2f} mean={np.mean(gamma_img):.2f}")
    print(f"        eqhist sigma={np.std(eq_img):.2f} mean={np.mean(eq_img):.2f}")

# =====================================================================
# Figures
# =====================================================================

fig, axes = plt.subplots(2, 2, figsize=(9, 9))
for row, name in enumerate(["camera", "coins"]):
    axes[row, 0].imshow(results_fase1[name]["img"], cmap="gray")
    axes[row, 0].set_title(f"{name} — original", fontsize=11, color=NAVY); axes[row, 0].axis("off")
    axes[row, 1].imshow(results_fase1[name]["noisy"], cmap="gray")
    axes[row, 1].set_title(f"{name} — salt & pepper (5%)", fontsize=11, color=RED); axes[row, 1].axis("off")
plt.tight_layout()
plt.savefig(f"{FIG_DIR}/noise.png", dpi=130, bbox_inches="tight"); plt.close()

fig, axes = plt.subplots(1, 3, figsize=(13, 4.5))
titles = ["Noisy", "Own median filter", "cv2.medianBlur"]
imgs_row = [results_fase1["camera"]["noisy"], results_fase1["camera"]["own"], results_fase1["camera"]["cv"]]
for ax, im, t in zip(axes, imgs_row, titles):
    ax.imshow(im, cmap="gray"); ax.set_title(t, fontsize=12, color=NAVY); ax.axis("off")
plt.tight_layout()
plt.savefig(f"{FIG_DIR}/median_compare.png", dpi=130, bbox_inches="tight"); plt.close()

names = list(results_fase1.keys())
psnr_noisy = [results_fase1[n]["psnr_noisy"] for n in names]
psnr_own = [results_fase1[n]["psnr_own"] for n in names]
psnr_cv = [results_fase1[n]["psnr_cv"] for n in names]
x = np.arange(len(names)); w = 0.25
fig, ax = plt.subplots(figsize=(7, 5))
ax.bar(x - w, psnr_noisy, w, label="Noisy", color=RED)
ax.bar(x, psnr_own, w, label="Own filter", color=GOLD)
ax.bar(x + w, psnr_cv, w, label="cv2.medianBlur", color=NAVY)
ax.set_xticks(x); ax.set_xticklabels(names)
ax.set_ylabel("PSNR (dB)"); ax.set_title("PSNR before/after filtering", color=NAVY)
ax.legend(); ax.grid(axis="y", alpha=0.25)
plt.tight_layout()
plt.savefig(f"{FIG_DIR}/psnr_bars.png", dpi=130, bbox_inches="tight"); plt.close()

names2 = list(results_fase2.keys())
fig, axes = plt.subplots(2, 3, figsize=(13, 8.5))
for row, name in enumerate(names2):
    r = results_fase2[name]
    axes[row, 0].imshow(r["original"], cmap="gray", vmin=0, vmax=255)
    axes[row, 0].set_title(f"{name} — original (low contrast)", fontsize=10.5, color=NAVY); axes[row, 0].axis("off")
    axes[row, 1].imshow(r["gamma"], cmap="gray", vmin=0, vmax=255)
    axes[row, 1].set_title("own gamma correction (γ=0.4)", fontsize=10.5, color=GOLD); axes[row, 1].axis("off")
    axes[row, 2].imshow(r["equalized"], cmap="gray", vmin=0, vmax=255)
    axes[row, 2].set_title("cv2.equalizeHist", fontsize=10.5, color=NAVY); axes[row, 2].axis("off")
plt.tight_layout()
plt.savefig(f"{FIG_DIR}/gamma_eqhist.png", dpi=130, bbox_inches="tight"); plt.close()

fig = plt.figure(figsize=(13, 9))
gs = fig.add_gridspec(2, 2, hspace=0.35, wspace=0.25)
ax1 = fig.add_subplot(gs[0, 0])
ax1.imshow(results_fase1["camera"]["noisy"], cmap="gray"); ax1.set_title("camera — 5% salt & pepper noise", fontsize=11, color=NAVY); ax1.axis("off")
ax2 = fig.add_subplot(gs[0, 1])
ax2.imshow(results_fase1["camera"]["own"], cmap="gray"); ax2.set_title("camera — own median filter (3×3)", fontsize=11, color=GOLD); ax2.axis("off")
ax3 = fig.add_subplot(gs[1, 0])
ax3.bar(x - w, psnr_noisy, w, label="Noisy", color=RED)
ax3.bar(x, psnr_own, w, label="Own filter", color=GOLD)
ax3.bar(x + w, psnr_cv, w, label="cv2", color=NAVY)
ax3.set_xticks(x); ax3.set_xticklabels(names); ax3.set_ylabel("PSNR (dB)")
ax3.set_title("PSNR gain from filtering", fontsize=11, color=NAVY)
ax3.legend(fontsize=8); ax3.grid(axis="y", alpha=0.25)
ax4 = fig.add_subplot(gs[1, 1])
first_low_name = names2[0]
hist_orig, _ = np.histogram(results_fase2[first_low_name]["original"], bins=64, range=(0, 255))
hist_gamma, _ = np.histogram(results_fase2[first_low_name]["gamma"], bins=64, range=(0, 255))
bins = np.linspace(0, 255, 64)
ax4.plot(bins, hist_orig, color=GREY, label=f"{first_low_name} original", lw=1.5)
ax4.plot(bins, hist_gamma, color=GOLD, label=f"{first_low_name} gamma-corrected", lw=1.5)
ax4.set_title(f"Intensity histogram ({first_low_name})", fontsize=11, color=NAVY)
ax4.set_xlabel("Gray level"); ax4.set_ylabel("Frequency")
ax4.legend(fontsize=8); ax4.grid(alpha=0.25)
plt.savefig(f"{FIG_DIR}/dashboard.png", dpi=130, bbox_inches="tight"); plt.close()

# =====================================================================
# Save numeric summary
# =====================================================================

summary = {
    "fase1": {n: {
        "psnr_noisy": r["psnr_noisy"], "psnr_own": r["psnr_own"], "psnr_cv": r["psnr_cv"],
        "mse_noisy": r["mse_noisy"], "mse_own": r["mse_own"],
        "timing_own_s": timing[n]["own_s"], "timing_cv_ms": timing[n]["cv_ms"],
        "diff_max": r["diff_max"], "diff_mean": r["diff_mean"],
    } for n, r in results_fase1.items()},
    "fase2": {n: {
        "orig_sigma": float(np.std(res["original"])), "orig_mean": float(np.mean(res["original"])),
        "gamma_sigma": float(np.std(res["gamma"])), "gamma_mean": float(np.mean(res["gamma"])),
        "eq_sigma": float(np.std(res["equalized"])), "eq_mean": float(np.mean(res["equalized"])),
    } for n, res in results_fase2.items()},
}
with open(os.path.join(HERE, "results.json"), "w", encoding="utf-8") as f:
    json.dump(summary, f, indent=2)

print("\nDone. Figures in ./figures, numeric summary in results.json")

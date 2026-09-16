"""
TerraGuard AI - Machine Learning Model Training
Trains a Random Forest Classifier on historical landslide benchmark data from SQLite,
evaluates on a held-out test split, and computes real metrics (Accuracy, Precision, Recall, F1, ROC-AUC).
Exports model.joblib and metrics.json.
"""
import os
import sqlite3
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "terraguard.db")
ML_DIR = os.path.join(BASE_DIR, "ml")
MODEL_PATH = os.path.join(ML_DIR, "model.joblib")
METRICS_PATH = os.path.join(ML_DIR, "metrics.json")

GEOLOGY_MAP = {"Stable": 0.0, "Moderate": 0.5, "Weak": 1.0}
LANDCOVER_MAP = {"Forest": 0.1, "Grassland": 0.4, "Agriculture": 0.5, "Urban": 0.3, "Barren": 0.9}

def train():
    os.makedirs(ML_DIR, exist_ok=True)
    
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"Database not found at {DB_PATH}. Please run seed_data.py first.")

    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM historical_events", conn)
    conn.close()

    print(f"Loaded {len(df)} historical events from database.")

    # Feature mapping
    df["geo_val"] = df["geology_condition"].map(GEOLOGY_MAP).fillna(0.5)
    df["lc_val"] = df["land_cover"].map(LANDCOVER_MAP).fillna(0.5)

    feature_cols = [
        "rainfall_mm",
        "slope_deg",
        "soil_moisture_pct",
        "geo_val",
        "ndvi",
        "lc_val",
        "window_hours"
    ]

    X = df[feature_cols].values
    y = df["landslide_occurred"].values

    # Train / Test split 80/20 with stratification
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"Training split: {len(X_train)} samples | Testing split: {len(X_test)} samples")

    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=5,
        min_samples_split=4,
        random_state=42
    )
    clf.fit(X_train, y_train)

    # Evaluation on held-out test split
    y_pred = clf.predict(X_test)
    y_proba = clf.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    auc = float(roc_auc_score(y_test, y_proba))

    feature_names = ["Rainfall Volume", "Slope Angle", "Soil Saturation", "Geological Weakness", "Vegetation (NDVI)", "Land Cover", "Time Window"]
    importances = {name: round(float(imp), 4) for name, imp in zip(feature_names, clf.feature_importances_)}

    metrics = {
        "model_architecture": "RandomForestClassifier",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(auc, 4),
        "feature_importances": importances,
        "parameters": {
            "n_estimators": 120,
            "max_depth": 5,
            "random_state": 42
        }
    }

    # Save model and metrics
    joblib.dump(clf, MODEL_PATH)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print("========================================")
    print("TERRAGUARD AI — MODEL TRAINING COMPLETED")
    print("========================================")
    print(f"Artifact: {MODEL_PATH}")
    print(f"Accuracy:  {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall:    {rec * 100:.2f}%")
    print(f"F1-Score:  {f1:.4f}")
    print(f"ROC-AUC:   {auc:.4f}")
    print("Feature Importances:")
    for k, v in sorted(importances.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {k:22s}: {v * 100:.2f}%")
    print("========================================")

if __name__ == "__main__":
    train()

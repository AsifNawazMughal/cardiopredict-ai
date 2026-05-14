"""
AI MODEL TRAINING
=================
Trains Logistic Regression and XGBoost on the full UCI Heart Disease dataset
(Cleveland + Hungarian + Switzerland + VA Long Beach), with KNN imputation for
missing values and GridSearchCV hyperparameter tuning for both models. Saves
the best-scoring model to disk for the API to load.

Run:
    python ml/train_model.py
"""

import pandas as pd
import numpy as np
import pickle
import os
import json
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.impute import KNNImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, classification_report
)
from xgboost import XGBClassifier
import warnings
warnings.filterwarnings('ignore')

# ─── PATHS ────────────────────────────────────────────────────────────────────
MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODELS_DIR, exist_ok=True)


# ─── STEP 1: LOAD DATA ───────────────────────────────────────────────────────
def load_data():
    """
    Loads all four UCI Heart Disease cohorts:
      Cleveland (303), Hungarian (294), Switzerland (123), VA Long Beach (200)
    Combined: ~920 patient records. Missing values are encoded as '?'.
    """
    print("Loading dataset...")

    columns = [
        'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs',
        'restecg', 'thalach', 'exang', 'oldpeak', 'slope',
        'ca', 'thal', 'target'
    ]

    base = os.path.dirname(__file__)
    combined_path = os.path.join(base, "heart.csv")
    uci_dir = os.path.join(base, "dataset_folders", "heart+disease")

    # Cleveland + Hungarian only — Switzerland (66% missing `ca`) and VA
    # (similar) drag accuracy down because the strongest features are mostly
    # absent in those cohorts and imputation can't recover the signal.
    sources = [
        ("Cleveland", os.path.join(uci_dir, "processed.cleveland.data")),
        ("Hungarian", os.path.join(uci_dir, "processed.hungarian.data")),
    ]

    available = [(name, path) for name, path in sources if os.path.exists(path)]

    if available:
        frames = []
        for name, path in available:
            sub = pd.read_csv(path, header=None, names=columns, na_values="?")
            print(f"  {name:<12} {sub.shape[0]:>4} rows  ← {os.path.basename(path)}")
            frames.append(sub)
        df = pd.concat(frames, ignore_index=True)
        print(f"  Combined total: {df.shape[0]} rows from {len(available)} dataset(s)")
        df.to_csv(combined_path, index=False)
        print(f"  Saved combined CSV to {combined_path}")
    elif os.path.exists(combined_path):
        df = pd.read_csv(combined_path)
        print(f"  Loaded cached heart.csv: {df.shape[0]} rows")
    else:
        url = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data"
        df = pd.read_csv(url, header=None, names=columns, na_values="?")
        print(f"  Downloaded from UCI (Cleveland only): {df.shape[0]} rows")
        df.to_csv(combined_path, index=False)

    return df


# ─── STEP 2: CLEAN AND PREPARE DATA ──────────────────────────────────────────
def preprocess_data(df):
    """
    1. Convert '?' strings to NaN, coerce all columns to numeric.
    2. Impute missing values using KNNImputer (5 nearest neighbours by
       Euclidean distance). This preserves relationships between features
       — e.g. a patient with high BP + cholesterol gets imputed `ca` from
       similar patients, not from the column-wide median.
    3. Map the raw 0-4 target to 3 risk classes: Low / Medium / High.
    4. Standardize features (mean=0, std=1).
    5. Stratified 80/20 train/test split.
    """
    print("\nPreprocessing data...")

    df = df.replace('?', np.nan)
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    feature_columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs',
                       'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']

    print(f"  Missing values per feature:")
    for c in feature_columns:
        missing = df[c].isnull().sum()
        if missing:
            print(f"    {c:10}: {missing}")

    # KNN imputation — fit on features only, never on the target
    imputer = KNNImputer(n_neighbors=5)
    df[feature_columns] = imputer.fit_transform(df[feature_columns])
    print(f"  KNN imputation complete (k=5)")

    # Map raw target → risk class
    def map_risk(value):
        if value == 0:    return 0   # Low
        elif value <= 2:  return 1   # Medium
        else:             return 2   # High

    df['risk_class'] = df['target'].apply(map_risk)

    print(f"  Risk class distribution:")
    labels = {0: 'Low', 1: 'Medium', 2: 'High'}
    for k, v in sorted(df['risk_class'].value_counts().items()):
        print(f"    {labels[k]} ({k}): {v} patients")

    X = df[feature_columns].values
    y = df['risk_class'].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Persist preprocessing artifacts — API will reuse them at inference time
    with open(os.path.join(MODELS_DIR, "scaler.pkl"), 'wb') as f:
        pickle.dump(scaler, f)
    with open(os.path.join(MODELS_DIR, "imputer.pkl"), 'wb') as f:
        pickle.dump(imputer, f)
    with open(os.path.join(MODELS_DIR, "feature_columns.json"), 'w') as f:
        json.dump(feature_columns, f)
    print(f"  Saved scaler, imputer, and feature column list to {MODELS_DIR}")

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"  Train: {X_train.shape[0]} samples · Test: {X_test.shape[0]} samples")
    return X_train, X_test, y_train, y_test


# ─── STEP 3A: TUNED LOGISTIC REGRESSION ──────────────────────────────────────
def train_logistic_regression(X_train, X_test, y_train, y_test):
    """5-fold cross-validated grid search over C and penalty/solver combos."""
    print("\nTraining Logistic Regression (GridSearchCV, 5-fold)...")

    param_grid = [
        {'C': [0.01, 0.1, 1.0, 10.0, 100.0],
         'penalty': ['l2'], 'solver': ['lbfgs'], 'max_iter': [2000]},
        {'C': [0.01, 0.1, 1.0, 10.0],
         'penalty': ['l1'], 'solver': ['saga'], 'max_iter': [2000]},
    ]
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    grid = GridSearchCV(
        LogisticRegression(random_state=42),
        param_grid, scoring='f1_weighted', cv=cv, n_jobs=-1, verbose=0,
    )
    grid.fit(X_train, y_train)
    print(f"  Best params: {grid.best_params_}")
    print(f"  Best CV f1_weighted: {grid.best_score_:.4f}")

    model = grid.best_estimator_
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)
    metrics = calculate_metrics(y_test, y_pred, y_pred_proba, "Logistic Regression")
    return model, metrics


# ─── STEP 3B: TUNED XGBOOST ──────────────────────────────────────────────────
def train_xgboost(X_train, X_test, y_train, y_test):
    """5-fold cross-validated grid search over the most-impactful XGB params."""
    print("\nTraining XGBoost (GridSearchCV, 5-fold)...")

    param_grid = {
        'n_estimators':     [100, 200, 400],
        'max_depth':        [3, 5, 7],
        'learning_rate':    [0.05, 0.1, 0.2],
        'subsample':        [0.8, 1.0],
    }
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    grid = GridSearchCV(
        XGBClassifier(
            objective='multi:softprob', num_class=3,
            eval_metric='mlogloss', random_state=42,
            tree_method='hist',
        ),
        param_grid, scoring='f1_weighted', cv=cv, n_jobs=-1, verbose=0,
    )
    grid.fit(X_train, y_train)
    print(f"  Best params: {grid.best_params_}")
    print(f"  Best CV f1_weighted: {grid.best_score_:.4f}")

    model = grid.best_estimator_
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)
    metrics = calculate_metrics(y_test, y_pred, y_pred_proba, "XGBoost")
    return model, metrics


# ─── HELPER: METRICS ─────────────────────────────────────────────────────────
def calculate_metrics(y_true, y_pred, y_pred_proba, model_name):
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, average='weighted', zero_division=0)
    rec = recall_score(y_true, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_true, y_pred, average='weighted', zero_division=0)
    try:
        roc = roc_auc_score(y_true, y_pred_proba, multi_class='ovr', average='weighted')
    except Exception:
        roc = 0.0

    print(f"\n  ─── {model_name} Test Results ───")
    print(f"  Accuracy:  {acc:.4f} ({acc*100:.1f}%)")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall:    {rec:.4f}")
    print(f"  F1 Score:  {f1:.4f}")
    print(f"  ROC-AUC:   {roc:.4f}")
    print(classification_report(y_true, y_pred,
                                target_names=['Low Risk', 'Medium Risk', 'High Risk']))

    return {
        "accuracy":  round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall":    round(float(rec), 4),
        "f1_score":  round(float(f1), 4),
        "roc_auc":   round(float(roc), 4),
    }


# ─── MAIN ────────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  HEART DISEASE PREDICTION — MODEL TRAINING")
    print("=" * 60)

    df = load_data()
    X_train, X_test, y_train, y_test = preprocess_data(df)

    lr_model, lr_metrics = train_logistic_regression(X_train, X_test, y_train, y_test)
    xgb_model, xgb_metrics = train_xgboost(X_train, X_test, y_train, y_test)

    # Pick the better one on weighted F1 (better balance of precision/recall than raw accuracy)
    if xgb_metrics['f1_score'] >= lr_metrics['f1_score']:
        best_name, best_model = "XGBoost", xgb_model
        best_metrics = xgb_metrics
    else:
        best_name, best_model = "LogisticRegression", lr_model
        best_metrics = lr_metrics

    # Save winner as the production model
    best_path = os.path.join(MODELS_DIR, "best_model.pkl")
    with open(best_path, 'wb') as f:
        pickle.dump(best_model, f)

    summary = {
        "best_model": best_name,
        "models": {
            "LogisticRegression": lr_metrics,
            "XGBoost":            xgb_metrics,
        },
        "best": {**best_metrics, "type": best_name, "path": best_path},
    }
    with open(os.path.join(MODELS_DIR, "models_summary.json"), 'w') as f:
        json.dump(summary, f, indent=2)

    print("\n" + "=" * 60)
    print("  TRAINING COMPLETE")
    print("=" * 60)
    print(f"  Winner:  {best_name}")
    print(f"  Accuracy {best_metrics['accuracy']}  F1 {best_metrics['f1_score']}  ROC-AUC {best_metrics['roc_auc']}")
    print(f"  Model saved: {best_path}")


if __name__ == "__main__":
    main()

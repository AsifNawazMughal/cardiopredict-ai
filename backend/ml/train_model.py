"""
AI MODEL TRAINING
=================
This script:
1. Downloads/loads the UCI Heart Disease dataset
2. Cleans and prepares the data
3. Trains 3 models: ANN, Logistic Regression, Random Forest
4. Saves the trained models to files (so we can use them later)

CONCEPT: Machine Learning in simple terms
─────────────────────────────────────────
Imagine you have 1000 patient records where you already KNOW
who has heart disease and who doesn't (this is "labeled data").

You SHOW this data to the AI model.
The model learns PATTERNS from it.
After training, give it a NEW patient — it predicts based on patterns it learned.

It's like teaching a student with 1000 examples, then giving them an exam
with a new question they haven't seen before.
"""

import pandas as pd
import numpy as np
import pickle
import os
import json
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, classification_report, confusion_matrix
)
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, regularizers
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

# ─── PATHS ────────────────────────────────────────────────────────────────────
MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODELS_DIR, exist_ok=True)


# ─── STEP 1: LOAD DATA ───────────────────────────────────────────────────────
def load_data():
    """
    CONCEPT: Dataset
    ─────────────────
    The full UCI Heart Disease dataset has 4 sub-datasets:
      Cleveland (303), Hungarian (294), Switzerland (123), VA Long Beach (200)
    Combined: ~920 patient records — 3× the data of Cleveland alone.

    Each row = 1 patient. 13 features + 1 target column.
    Hungarian/Switzerland/VA use '?' for missing values; preprocess_data() handles those.
    """
    print("📂 Loading dataset...")

    columns = [
        'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs',
        'restecg', 'thalach', 'exang', 'oldpeak', 'slope',
        'ca', 'thal', 'target'
    ]

    base = os.path.dirname(__file__)
    combined_path = os.path.join(base, "heart.csv")
    uci_dir = os.path.join(base, "dataset_folders", "heart+disease")

    # Cleveland + Hungarian only — Switzerland & VA have heavy missing values
    # in `ca` and `thal` (the strongest features), which hurt accuracy when imputed.
    sources = [
        ("Cleveland", os.path.join(uci_dir, "processed.cleveland.data")),
        ("Hungarian", os.path.join(uci_dir, "processed.hungarian.data")),
    ]

    available = [(name, path) for name, path in sources if os.path.exists(path)]

    if available:
        frames = []
        for name, path in available:
            sub = pd.read_csv(path, header=None, names=columns, na_values="?")
            sub["source"] = name
            print(f"  {name:<12} {sub.shape[0]:>4} rows  ← {os.path.basename(path)}")
            frames.append(sub)
        df = pd.concat(frames, ignore_index=True).drop(columns=["source"])
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
    CONCEPT: Data Preprocessing
    ────────────────────────────
    Real-world data is messy. We need to:

    1. Handle missing values — some cells might be empty ("?")
       Fix: replace with the average of that column

    2. Normalize numbers — age (25-90) and cholesterol (100-600) are
       very different scales. The AI gets confused. We make them all 0-1.
       This is called "StandardScaler" (makes mean=0, std=1)

    3. Convert categories to numbers — "Male/Female" → "1/0"
       AI only understands numbers, not text.

    4. Create multi-class labels — original dataset has 0-4.
       We simplify: 0 = Low, 1-2 = Medium, 3-4 = High
    """
    print("\n🔧 Preprocessing data...")

    # Replace '?' with NaN (missing value marker)
    df = df.replace('?', np.nan)

    # Convert all columns to numbers (some might be stored as text)
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    print(f"  Missing values before: {df.isnull().sum().sum()}")

    # Fill missing values with column average (median is safer for medical data)
    df = df.fillna(df.median())

    print(f"  Missing values after: {df.isnull().sum().sum()}")

    # ── Create multi-class risk labels ──────────────────────────────────────
    # Original: target column is 0 (no disease), 1-4 (disease severity)
    # We map to: 0=Low, 1=Medium, 2=High
    def map_risk(value):
        if value == 0:
            return 0   # Low risk
        elif value <= 2:
            return 1   # Medium risk
        else:
            return 2   # High risk

    df['risk_class'] = df['target'].apply(map_risk)

    print(f"  Risk class distribution:")
    labels = {0: 'Low', 1: 'Medium', 2: 'High'}
    for k, v in df['risk_class'].value_counts().items():
        print(f"    {labels[k]} ({k}): {v} patients")

    # ── Split features (X) and labels (y) ──────────────────────────────────
    # X = the 13 medical measurements (what we feed IN to the model)
    # y = the risk class (what we want the model to OUTPUT/predict)
    feature_columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs',
                        'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']

    X = df[feature_columns].values
    y = df['risk_class'].values

    # ── Normalize features ──────────────────────────────────────────────────
    # CONCEPT: StandardScaler
    # Before: age=[25, 70, 45], cholesterol=[150, 300, 200]
    # After:  age=[-1.2, 1.5, 0.1], cholesterol=[-0.8, 1.4, 0.2]
    # Both columns are now on the same scale → AI learns better

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)   # fit = learn the scale, transform = apply it

    # Save scaler — we'll need it later to scale NEW patient data the same way
    scaler_path = os.path.join(MODELS_DIR, "scaler.pkl")
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    print(f"  Scaler saved to {scaler_path}")

    # Save feature column names (for validation later)
    with open(os.path.join(MODELS_DIR, "feature_columns.json"), 'w') as f:
        json.dump(feature_columns, f)

    # ── Train/Test Split ────────────────────────────────────────────────────
    # CONCEPT: We split data into:
    #   80% Training   → the AI learns from this
    #   20% Testing    → we test accuracy on data the AI has NEVER seen
    # This prevents "cheating" (memorizing answers instead of learning)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
        # stratify=y means: keep same ratio of Low/Medium/High in both sets
    )

    print(f"  Training set: {X_train.shape[0]} samples")
    print(f"  Testing set:  {X_test.shape[0]} samples")

    return X_train, X_test, y_train, y_test, feature_columns


# ─── STEP 3A: TRAIN ANN (Deep Learning) ──────────────────────────────────────
def train_ann(X_train, X_test, y_train, y_test):
    """
    CONCEPT: Artificial Neural Network (ANN)
    ─────────────────────────────────────────
    An ANN is inspired by the human brain.
    It has layers of "neurons" that pass information forward.

    Input layer:   13 neurons (one for each health measurement)
       ↓
    Hidden layer:  128 neurons (finds patterns)
       ↓
    Hidden layer:  64 neurons (refines patterns)
       ↓
    Hidden layer:  32 neurons (more refinement)
       ↓
    Output layer:  3 neurons (Low / Medium / High probability)

    DROPOUT:
    During training, we randomly "turn off" 30% of neurons each step.
    This forces the network to NOT rely on any single neuron.
    Result: better generalization, less overfitting.

    REGULARIZATION (L2):
    Adds a penalty for very large weights.
    Prevents the model from becoming too complex and memorizing training data.
    """
    print("\n🧠 Training ANN (Deep Learning)...")

    num_classes = 3  # Low, Medium, High

    # Convert labels to "one-hot encoding"
    # Example: class 2 (High) → [0, 0, 1]
    y_train_cat = keras.utils.to_categorical(y_train, num_classes)
    y_test_cat = keras.utils.to_categorical(y_test, num_classes)

    # Build the neural network
    model = keras.Sequential([
        # Input layer — 13 features
        layers.Input(shape=(X_train.shape[1],)),

        # Hidden layer 1: 128 neurons
        # kernel_regularizer=L2 → penalty for large weights (prevents overfitting)
        layers.Dense(128, activation='relu',
                     kernel_regularizer=regularizers.l2(0.001)),
        layers.BatchNormalization(),   # normalize activations (training stability)
        layers.Dropout(0.3),           # randomly turn off 30% of neurons

        # Hidden layer 2: 64 neurons
        layers.Dense(64, activation='relu',
                     kernel_regularizer=regularizers.l2(0.001)),
        layers.BatchNormalization(),
        layers.Dropout(0.3),

        # Hidden layer 3: 32 neurons
        layers.Dense(32, activation='relu'),
        layers.Dropout(0.2),

        # Output layer: 3 neurons (one per class)
        # softmax = converts outputs to probabilities that sum to 1.0
        # e.g., [0.1, 0.2, 0.7] → 70% chance High risk
        layers.Dense(num_classes, activation='softmax')
    ])

    # Compile: tell the model HOW to learn
    # optimizer='adam' = smart learning rate adjustment
    # loss='categorical_crossentropy' = measures how wrong the predictions are
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    model.summary()

    # Train the model
    # epoch = one full pass through all training data
    # batch_size = how many samples to process at once before updating weights
    history = model.fit(
        X_train, y_train_cat,
        epochs=100,
        batch_size=16,
        validation_split=0.1,   # use 10% of training data to monitor overfitting
        verbose=1,
        callbacks=[
            # EarlyStopping: stop if no improvement for 15 epochs (saves time)
            keras.callbacks.EarlyStopping(patience=15, restore_best_weights=True),
            # ReduceLROnPlateau: slow down learning when stuck
            keras.callbacks.ReduceLROnPlateau(patience=7, factor=0.5)
        ]
    )

    # Evaluate on test set
    y_pred_proba = model.predict(X_test)
    y_pred = np.argmax(y_pred_proba, axis=1)   # pick the class with highest probability

    metrics = calculate_metrics(y_test, y_pred, y_pred_proba, "ANN")

    # Save model
    model_path = os.path.join(MODELS_DIR, "ann_model.keras")
    model.save(model_path)
    print(f"  ANN saved to {model_path}")

    # Save training history plot
    save_training_plot(history, "ANN")

    return metrics, model_path


# ─── STEP 3B: TRAIN LOGISTIC REGRESSION ──────────────────────────────────────
def train_logistic_regression(X_train, X_test, y_train, y_test):
    """
    CONCEPT: Logistic Regression
    ─────────────────────────────
    Despite the name, it's used for CLASSIFICATION not regression.
    It's the simplest ML model — like drawing a line to separate groups.

    We use it as a "baseline": if our ANN isn't better than this simple model,
    something is wrong with our ANN.

    lbfgs solver handles multi-class (Low/Medium/High) natively
    """
    print("\n📊 Training Logistic Regression...")

    model = LogisticRegression(
        solver='lbfgs',   # lbfgs handles multi-class natively in scikit-learn >= 1.5
        max_iter=1000,
        C=1.0,            # C = regularization strength (smaller = more regularization)
        random_state=42
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)

    metrics = calculate_metrics(y_test, y_pred, y_pred_proba, "Logistic Regression")

    # Save model using pickle (simple way to save sklearn models)
    model_path = os.path.join(MODELS_DIR, "logistic_regression.pkl")
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"  Logistic Regression saved to {model_path}")

    return metrics, model_path


# ─── STEP 3C: TRAIN RANDOM FOREST ────────────────────────────────────────────
def train_random_forest(X_train, X_test, y_train, y_test):
    """
    CONCEPT: Random Forest
    ───────────────────────
    Random Forest = many Decision Trees working together (ensemble method).

    A Decision Tree is like a flowchart:
      Is age > 55?
        Yes → Is cholesterol > 240?
                Yes → High Risk
                No  → Medium Risk
        No  → Low Risk

    Random Forest builds 100 such trees, each learning slightly different patterns.
    Final prediction = majority vote of all 100 trees.

    This is very accurate because many imperfect models together > one perfect model.
    """
    print("\n🌲 Training Random Forest...")

    model = RandomForestClassifier(
        n_estimators=100,    # 100 decision trees
        max_depth=10,        # limit tree depth (prevents overfitting)
        min_samples_split=5,
        random_state=42,
        n_jobs=-1            # use all CPU cores for faster training
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)

    metrics = calculate_metrics(y_test, y_pred, y_pred_proba, "Random Forest")

    # Feature importance — which medical measurements matter most?
    feature_names = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs',
                     'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
    importances = model.feature_importances_
    print("\n  Feature Importance (which measurements matter most):")
    for name, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
        bar = "█" * int(imp * 50)
        print(f"    {name:15s}: {bar} {imp:.3f}")

    # Save model
    model_path = os.path.join(MODELS_DIR, "random_forest.pkl")
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"  Random Forest saved to {model_path}")

    return metrics, model_path


# ─── HELPER: CALCULATE METRICS ───────────────────────────────────────────────
def calculate_metrics(y_true, y_pred, y_pred_proba, model_name):
    """
    CONCEPT: Model Evaluation Metrics
    ───────────────────────────────────
    After training, how do we know if the model is good?

    Accuracy  = % of correct predictions overall
    Precision = "When model says High Risk, how often is it right?"
    Recall    = "Of ALL actual High Risk patients, how many did model catch?"
    F1 Score  = Balance between Precision and Recall
    ROC-AUC   = How well model separates classes (1.0 = perfect, 0.5 = random)

    For medical systems, RECALL is most important:
    It's worse to MISS a sick patient than to falsely alarm a healthy one.
    """
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, average='weighted', zero_division=0)
    rec = recall_score(y_true, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_true, y_pred, average='weighted', zero_division=0)

    # ROC-AUC for multi-class needs probability scores
    try:
        roc = roc_auc_score(y_true, y_pred_proba, multi_class='ovr', average='weighted')
    except Exception:
        roc = 0.0

    print(f"\n  ─── {model_name} Results ───")
    print(f"  Accuracy:  {acc:.4f} ({acc*100:.1f}%)")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall:    {rec:.4f}")
    print(f"  F1 Score:  {f1:.4f}")
    print(f"  ROC-AUC:   {roc:.4f}")
    print(f"\n  Classification Report:")
    print(classification_report(y_true, y_pred,
                                 target_names=['Low Risk', 'Medium Risk', 'High Risk']))

    return {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": round(float(roc), 4)
    }


# ─── HELPER: SAVE TRAINING PLOT ──────────────────────────────────────────────
def save_training_plot(history, model_name):
    """Save accuracy and loss curves during ANN training"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

    ax1.plot(history.history['accuracy'], label='Train')
    ax1.plot(history.history['val_accuracy'], label='Validation')
    ax1.set_title(f'{model_name} - Accuracy')
    ax1.set_xlabel('Epoch')
    ax1.legend()

    ax2.plot(history.history['loss'], label='Train')
    ax2.plot(history.history['val_loss'], label='Validation')
    ax2.set_title(f'{model_name} - Loss')
    ax2.set_xlabel('Epoch')
    ax2.legend()

    plot_path = os.path.join(MODELS_DIR, f"{model_name.lower()}_training.png")
    plt.savefig(plot_path, dpi=100, bbox_inches='tight')
    plt.close()
    print(f"  Training plot saved to {plot_path}")


# ─── MAIN: RUN EVERYTHING ────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  HEART DISEASE PREDICTION — MODEL TRAINING")
    print("=" * 60)

    # Step 1: Load data
    df = load_data()

    # Step 2: Preprocess
    X_train, X_test, y_train, y_test = preprocess_data(df)[:4]

    # Step 3: Train all 3 models
    ann_metrics, ann_path = train_ann(X_train, X_test, y_train, y_test)
    lr_metrics, lr_path = train_logistic_regression(X_train, X_test, y_train, y_test)
    rf_metrics, rf_path = train_random_forest(X_train, X_test, y_train, y_test)

    # Step 4: Save metrics summary
    summary = {
        "ANN": {**ann_metrics, "path": ann_path},
        "LogisticRegression": {**lr_metrics, "path": lr_path},
        "RandomForest": {**rf_metrics, "path": rf_path}
    }

    summary_path = os.path.join(MODELS_DIR, "models_summary.json")
    with open(summary_path, 'w') as f:
        json.dump(summary, f, indent=2)

    print("\n" + "=" * 60)
    print("  TRAINING COMPLETE!")
    print("=" * 60)
    print(f"\n  Model Comparison:")
    print(f"  {'Model':<25} {'Accuracy':<12} {'F1 Score':<12} {'ROC-AUC'}")
    print(f"  {'-'*60}")
    for name, m in summary.items():
        print(f"  {name:<25} {m['accuracy']:<12} {m['f1_score']:<12} {m['roc_auc']}")

    print(f"\n  All models saved in: {MODELS_DIR}")
    print(f"  Summary saved to: {summary_path}")


if __name__ == "__main__":
    main()

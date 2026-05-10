export const FIELD_LABELS = {
  age: "Age (years)",
  sex: "Sex",
  chest_pain_type: "Chest Pain Type",
  resting_bp: "Resting BP (mmHg)",
  cholesterol: "Cholesterol (mg/dl)",
  fasting_blood_sugar: "Fasting Blood Sugar >120",
  resting_ecg: "Resting ECG",
  max_heart_rate: "Max Heart Rate (bpm)",
  exercise_angina: "Exercise Angina",
  st_depression: "ST Depression",
  st_slope: "ST Slope",
  vessels_count: "Major Vessels",
  thalassemia: "Thalassemia",
};

export function humanize(key, val) {
  if (key === "sex") return val === 1 ? "Male" : "Female";
  if (key === "fasting_blood_sugar") return val === 1 ? "Yes (>120)" : "No (≤120)";
  if (key === "exercise_angina") return val === 1 ? "Yes" : "No";
  if (key === "chest_pain_type") return ["Typical Angina","Atypical Angina","Non-Anginal","Asymptomatic"][val] || String(val);
  if (key === "resting_ecg")     return ["Normal","ST-T Abnormality","LV Hypertrophy"][val] || String(val);
  if (key === "st_slope")        return ["Upsloping","Flat","Downsloping"][val] || String(val);
  if (key === "thalassemia")     return ["Normal","Fixed Defect","Reversible Defect","Unknown"][val] || String(val);
  return String(val);
}

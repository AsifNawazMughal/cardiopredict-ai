"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { patientsApi, predictionsApi } from "../../lib/api";
import PatientSection from "./_components/PatientSection";
import ClinicalSection from "./_components/ClinicalSection";
import ModelSelector from "./_components/ModelSelector";
import { Activity, AlertCircle } from "lucide-react";

const TEMPLATES = {
  low: {
    label: "Low Risk Sample",
    age: "34", sex: "1", chest_pain_type: "0", resting_bp: "118", cholesterol: "182",
    fasting_blood_sugar: "0", resting_ecg: "0", max_heart_rate: "174", exercise_angina: "0",
    st_depression: "0", st_slope: "0", vessels_count: "0", thalassemia: "0",
  },
  medium: {
    label: "Medium Risk Sample",
    age: "54", sex: "1", chest_pain_type: "2", resting_bp: "140", cholesterol: "239",
    fasting_blood_sugar: "0", resting_ecg: "1", max_heart_rate: "151", exercise_angina: "0",
    st_depression: "1.6", st_slope: "1", vessels_count: "1", thalassemia: "2",
  },
  high: {
    label: "High Risk Sample",
    age: "67", sex: "1", chest_pain_type: "3", resting_bp: "160", cholesterol: "286",
    fasting_blood_sugar: "1", resting_ecg: "2", max_heart_rate: "108", exercise_angina: "1",
    st_depression: "3.0", st_slope: "2", vessels_count: "3", thalassemia: "2",
  },
};

const EMPTY_FORM = {
  age: "", sex: "1", chest_pain_type: "0", resting_bp: "", cholesterol: "",
  fasting_blood_sugar: "0", resting_ecg: "0", max_heart_rate: "", exercise_angina: "0",
  st_depression: "0", st_slope: "0", vessels_count: "0", thalassemia: "2",
};

export default function PredictPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [model, setModel] = useState("ANN");
  const [newPatient, setNewPatient] = useState({ first_name: "", last_name: "", date_of_birth: "" });
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { patientsApi.getAll().then(setPatients).catch(()=>{}); }, []);

  // Auto-fill age from existing patient's DOB
  useEffect(() => {
    if (selectedPatient?.date_of_birth) {
      const dob = new Date(selectedPatient.date_of_birth);
      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      setForm(f => ({ ...f, age: String(age), sex: selectedPatient.gender === "Female" ? "0" : "1" }));
    }
  }, [selectedPatient]);

  // Auto-fill age from new patient's DOB
  useEffect(() => {
    if (!selectedPatient && newPatient.date_of_birth) {
      const dob = new Date(newPatient.date_of_birth);
      if (!isNaN(dob)) {
        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age > 0 && age < 130) setForm(f => ({ ...f, age: String(age) }));
      }
    }
  }, [newPatient.date_of_birth, selectedPatient]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const num = (v) => Number(v);

  function loadTemplate(name) {
    const t = TEMPLATES[name];
    if (!t) return;
    const { label, ...values } = t;
    setForm(values);
    setSelectedPatient(null);
    setSearch("");
    setNewPatient({ first_name: "", last_name: "", date_of_birth: "" });
    toast.success(`Loaded ${label}`);
  }

  function clearForm() {
    setForm(EMPTY_FORM);
    setSelectedPatient(null);
    setSearch("");
    setNewPatient({ first_name: "", last_name: "", date_of_birth: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      let patientId = selectedPatient?.id;
      // Create the patient on the fly if no existing one was selected
      if (!patientId && (newPatient.first_name.trim() || newPatient.last_name.trim())) {
        if (!newPatient.first_name.trim() || !newPatient.last_name.trim()) {
          toast.error("Please enter both first and last name for the new patient");
          setLoading(false); return;
        }
        const created = await patientsApi.create({
          first_name: newPatient.first_name.trim(),
          last_name:  newPatient.last_name.trim(),
          date_of_birth: newPatient.date_of_birth || null,
          gender: form.sex === "0" ? "Female" : "Male",
        });
        patientId = created.id;
        setPatients(p => [created, ...p]);
        toast.success(`Patient "${created.first_name} ${created.last_name}" added`);
      }

      const data = {
        patient_id: patientId,
        age: num(form.age), sex: num(form.sex),
        chest_pain_type: num(form.chest_pain_type), resting_bp: num(form.resting_bp),
        cholesterol: num(form.cholesterol), fasting_blood_sugar: num(form.fasting_blood_sugar),
        resting_ecg: num(form.resting_ecg), max_heart_rate: num(form.max_heart_rate),
        exercise_angina: num(form.exercise_angina), st_depression: parseFloat(form.st_depression),
        st_slope: num(form.st_slope), vessels_count: num(form.vessels_count),
        thalassemia: num(form.thalassemia), model_type: model,
      };
      const result = await predictionsApi.predict(data);
      router.push(`/results/${result.prediction_id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Prediction failed";
      setError(msg); toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Activity className="w-6 h-6 text-red-600"/> New Prediction</h1>
        <p className="text-gray-500 text-sm mt-1">Enter patient data to run a heart disease risk assessment</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0"/>{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <PatientSection
          patients={patients}
          search={search} setSearch={setSearch}
          selectedPatient={selectedPatient} setSelectedPatient={setSelectedPatient}
          newPatient={newPatient} setNewPatient={setNewPatient}
          form={form} set={set}
        />
        <ClinicalSection form={form} set={set}/>
        <ModelSelector value={model} onChange={setModel}/>

        <div className="flex gap-3 justify-end items-center flex-wrap">
          <span className="text-xs text-gray-500 mr-1">Load sample:</span>
          <button type="button" onClick={()=>loadTemplate("low")}
            className="px-3 py-2 border border-green-300 text-green-700 hover:bg-green-50 rounded-lg text-xs font-medium">Low Risk</button>
          <button type="button" onClick={()=>loadTemplate("medium")}
            className="px-3 py-2 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg text-xs font-medium">Medium Risk</button>
          <button type="button" onClick={()=>loadTemplate("high")}
            className="px-3 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg text-xs font-medium">High Risk</button>
          <button type="button" onClick={clearForm}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Clear Form</button>
          <button type="submit" disabled={loading}
            className="px-8 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold rounded-lg text-sm flex items-center gap-2 transition-colors">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Running...</> : <><Activity className="w-4 h-4"/>Run Prediction</>}
          </button>
        </div>
      </form>
    </div>
  );
}

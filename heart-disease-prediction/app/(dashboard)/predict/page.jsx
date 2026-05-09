"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { patientsApi, predictionsApi } from "../../lib/api";
import Field from "@/components/Field";
import { Activity, Search, User, AlertCircle, CheckCircle2, ChevronDown, UserPlus } from "lucide-react";

const MODELS = ["ANN","LogisticRegression","RandomForest"] ;

const CHEST_PAIN = ["Typical Angina","Atypical Angina","Non-Anginal Pain","Asymptomatic"];
const ECG = ["Normal","ST-T Wave Abnormality","Left Ventricular Hypertrophy"];
const ST_SLOPE = ["Upsloping","Flat","Downsloping"];
const THAL = ["Normal","Fixed Defect","Reversible Defect","Unknown"];

// Sample profiles drawn from the Cleveland dataset — useful for demos / quick testing
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

export default function PredictPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [model, setModel] = useState("ANN");
  const [newPatient, setNewPatient] = useState({ first_name: "", last_name: "", date_of_birth: "" });
  const [form, setForm] = useState({
    age: "", sex: "1", chest_pain_type: "0", resting_bp: "", cholesterol: "",
    fasting_blood_sugar: "0", resting_ecg: "0", max_heart_rate: "", exercise_angina: "0",
    st_depression: "0", st_slope: "0", vessels_count: "0", thalassemia: "2",
  });

  const setNew = (k, v) => setNewPatient(p => ({...p, [k]: v}));

  useEffect(() => { patientsApi.getAll().then(setPatients).catch(()=>{}); }, []);

  // Auto-fill age from DOB when patient selected
  useEffect(() => {
    if (selectedPatient?.date_of_birth) {
      const dob = new Date(selectedPatient.date_of_birth);
      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      setForm(f => ({...f, age: String(age), sex: selectedPatient.gender==="Female"?"0":"1"}));
    }
  }, [selectedPatient]);

  // Auto-fill age from DOB for a new patient too
  useEffect(() => {
    if (!selectedPatient && newPatient.date_of_birth) {
      const dob = new Date(newPatient.date_of_birth);
      if (!isNaN(dob)) {
        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age > 0 && age < 130) setForm(f => ({...f, age: String(age)}));
      }
    }
  }, [newPatient.date_of_birth, selectedPatient]);

  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const set = (k, v) => setForm(p => ({...p, [k]: v}));
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
          last_name: newPatient.last_name.trim(),
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
    } catch(err){
      const msg = err instanceof Error ? err.message : "Prediction failed";
      setError(msg); toast.error(msg);
    }
    finally{ setLoading(false); }
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
        {/* Patient Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-red-500"/> Patient Information</h2>
          <div className="relative mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Search & Select Patient <span className="text-gray-400">(optional — for new patient leave blank)</span></label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <input value={selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : search}
                onChange={e=>{ setSearch(e.target.value); setSelectedPatient(null); setShowDropdown(true); }}
                onFocus={()=>setShowDropdown(true)}
                placeholder="Type name to search patients..." readOnly={!!selectedPatient}
                className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"/>
              {selectedPatient && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500"/>}
            </div>
            {showDropdown && !selectedPatient && filteredPatients.length>0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-auto">
                {filteredPatients.map(p=>(
                  <button key={p.id} type="button" onClick={()=>{ setSelectedPatient(p); setShowDropdown(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-sm flex items-center justify-between text-gray-900">
                    <span className="font-medium">{p.first_name} {p.last_name}</span>
                    <span className="text-gray-900 text-xs">{p.gender} • {p.date_of_birth}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedPatient && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between text-sm mb-2">
              <div>
                <span className="font-medium text-green-800">{selectedPatient.first_name} {selectedPatient.last_name}</span>
                <span className="text-green-600 ml-3">{selectedPatient.gender} • DOB: {selectedPatient.date_of_birth} • Age auto-filled</span>
              </div>
              <button type="button" onClick={()=>{ setSelectedPatient(null); setSearch(""); }} className="text-green-600 hover:text-red-600 text-xs underline">Remove</button>
            </div>
          )}

          {!selectedPatient && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-red-500"/>
                New Patient Details <span className="text-gray-400 font-normal">(filled-in details will be saved as a new patient record)</span>
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Field label="First Name" type="text" value={newPatient.first_name} onChange={v=>setNew("first_name",v)} placeholder="John" required/>
                <Field label="Last Name" type="text" value={newPatient.last_name} onChange={v=>setNew("last_name",v)} placeholder="Doe" required/>
                <Field label="Date of Birth" type="date" value={newPatient.date_of_birth} onChange={v=>setNew("date_of_birth",v)} hint="(optional)"/>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <Field label="Age (years)" type="number" value={form.age} onChange={v=>set("age",v)} min="1" max="120" placeholder="e.g. 55" required/>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Gender<span className="text-red-600 ml-0.5">*</span></label>
              <select value={form.sex} onChange={e=>set("sex",e.target.value)} required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="1">Male</option><option value="0">Female</option>
              </select>
            </div>
            <Field label="Resting BP (mmHg)" type="number" value={form.resting_bp} onChange={v=>set("resting_bp",v)} min="50" max="250" placeholder="e.g. 120" required/>
          </div>
        </div>

        {/* Clinical Parameters */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-500"/> Clinical Health Parameters
            <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Deep Learning Inputs</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Cholesterol (mg/dl)" type="number" value={form.cholesterol} onChange={v=>set("cholesterol",v)} min="0" max="600" placeholder="e.g. 200" required
              hint="Normal: &lt;200 mg/dl"/>
            <Field label="Max Heart Rate (bpm)" type="number" value={form.max_heart_rate} onChange={v=>set("max_heart_rate",v)} min="60" max="220" placeholder="e.g. 150" required
              hint="Normal: 60–100 bpm"/>
            <Field label="ST Depression" type="number" value={form.st_depression} onChange={v=>set("st_depression",v)} step="0.1" min="0" max="10" placeholder="e.g. 1.0"
              hint="Range: 0.0–6.2"/>

            <SelectInp label="Chest Pain Type" value={form.chest_pain_type} onChange={v=>set("chest_pain_type",v)} options={CHEST_PAIN}/>
            <SelectInp label="Resting ECG" value={form.resting_ecg} onChange={v=>set("resting_ecg",v)} options={ECG}/>
            <SelectInp label="ST Slope" value={form.st_slope} onChange={v=>set("st_slope",v)} options={ST_SLOPE}/>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fasting Blood Sugar &gt;120 mg/dl</label>
              <div className="flex gap-3 mt-2">
                {["No","Yes"].map((l,i)=>(
                  <label key={l} className="flex items-center gap-1.5 text-sm text-gray-900 cursor-pointer">
                    <input type="radio" name="fbs" checked={form.fasting_blood_sugar===String(i)} onChange={()=>set("fasting_blood_sugar",String(i))} className="text-red-600"/>
                    {l}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Exercise-Induced Angina</label>
              <div className="flex gap-3 mt-2">
                {["No","Yes"].map((l,i)=>(
                  <label key={l} className="flex items-center gap-1.5 text-sm text-gray-900 cursor-pointer">
                    <input type="radio" name="ang" checked={form.exercise_angina===String(i)} onChange={()=>set("exercise_angina",String(i))} className="text-red-600"/>
                    {l}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Major Vessels (0–3)</label>
              <div className="flex gap-2 mt-1.5">
                {[0,1,2,3].map(n=>(
                  <button key={n} type="button" onClick={()=>set("vessels_count",String(n))}
                    className={`w-10 h-10 rounded-lg text-sm font-bold border transition-colors ${form.vessels_count===String(n)?"bg-red-600 text-white border-red-600":"border-gray-300 text-gray-700 hover:border-red-400"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <SelectInp label="Thalassemia" value={form.thalassemia} onChange={v=>set("thalassemia",v)} options={THAL}/>
          </div>
        </div>

        {/* Model Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">AI Model Selection</h2>
          <div className="grid grid-cols-3 gap-3">
            {MODELS.map(m=>(
              <label key={m} className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${model===m?"border-red-500 bg-red-50":"border-gray-200 hover:border-red-300"}`}>
                <input type="radio" name="model" value={m} checked={model===m} onChange={()=>setModel(m)} className="sr-only"/>
                <span className="font-semibold text-sm text-gray-900">{m==="ANN"?"ANN (Deep Learning)":m==="LogisticRegression"?"Logistic Regression":"Random Forest"}</span>
                <span className="text-xs text-gray-500 mt-1">{m==="ANN"?"Best accuracy":"Baseline model"}</span>
                {model===m && <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-red-600"/>}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end items-center flex-wrap">
          <span className="text-xs text-gray-500 mr-1">Load sample:</span>
          <button type="button" onClick={()=>loadTemplate("low")}
            className="px-3 py-2 border border-green-300 text-green-700 hover:bg-green-50 rounded-lg text-xs font-medium">Low Risk</button>
          <button type="button" onClick={()=>loadTemplate("medium")}
            className="px-3 py-2 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg text-xs font-medium">Medium Risk</button>
          <button type="button" onClick={()=>loadTemplate("high")}
            className="px-3 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg text-xs font-medium">High Risk</button>
          <button type="button" onClick={()=>{ setForm({age:"",sex:"1",chest_pain_type:"0",resting_bp:"",cholesterol:"",fasting_blood_sugar:"0",resting_ecg:"0",max_heart_rate:"",exercise_angina:"0",st_depression:"0",st_slope:"0",vessels_count:"0",thalassemia:"2"}); setSelectedPatient(null); setSearch(""); setNewPatient({first_name:"",last_name:"",date_of_birth:""}); }}
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

function SelectInp({label,value,onChange,options}){
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <select value={value} onChange={e=>onChange(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none bg-white pr-8">
          {options.map((o,i)=><option key={i} value={i}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"/>
      </div>
    </div>
  );
}

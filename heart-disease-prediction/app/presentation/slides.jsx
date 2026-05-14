"use client";
import { Heart, AlertTriangle, Database, Layers, Cpu, BarChart3, Brain, Globe, Github, Sparkles, Activity, Stethoscope, Award, Code2, MessageCircle } from "lucide-react";

/**
 * Slide content lives here as pure data + small render fns. The presentation
 * page just iterates over the array and renders the matching component.
 */

// Visual helpers used inside slides
function Stat({ label, value, sub }) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-red-600">{value}</div>
      <div className="text-sm text-gray-700 font-medium mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function FeatureRow({ name, abbr, what, why }) {
  return (
    <div className="grid grid-cols-12 gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className="col-span-12 sm:col-span-3">
        <div className="font-semibold text-gray-900 text-sm">{name}</div>
        <div className="text-xs text-red-600 font-mono">{abbr}</div>
      </div>
      <div className="col-span-12 sm:col-span-4 text-sm text-gray-700">{what}</div>
      <div className="col-span-12 sm:col-span-5 text-sm text-gray-600 italic">{why}</div>
    </div>
  );
}

function TitleSlide() {
  return (
    <div className="relative h-full overflow-hidden flex flex-col items-center justify-center text-center px-6">
      {/* Background: Unsplash medical photo, dimmed under the gradient */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1920&q=80"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay pointer-events-none"
      />
      {/* Decorative dot grid */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hero-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="white"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots)"/>
      </svg>

      {/* Hero content */}
      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium text-white/90 mb-6 border border-white/20">
          <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"/>
          Live demo · 15 slides
        </div>
        <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-2xl ring-1 ring-white/30">
          <Heart className="w-14 h-14 text-white animate-heartbeat" fill="currentColor"/>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">CardioPredict AI</h1>
        <p className="text-xl md:text-2xl text-red-50 max-w-2xl mx-auto mb-8 leading-relaxed">
          Interpretable machine learning for cardiovascular risk assessment
        </p>
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
          <Heart className="w-3.5 h-3.5 text-red-200" fill="currentColor"/>
          <p className="text-sm text-white">A project by <span className="font-semibold">Asif Nawaz Mughal</span></p>
        </div>
      </div>

      {/* Animated ECG trace along the bottom */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-20 pointer-events-none"
      >
        <path
          d="M0 50 L150 50 L170 50 L185 20 L200 80 L215 30 L230 50 L380 50 L400 50 L415 20 L430 80 L445 30 L460 50 L610 50 L630 50 L645 20 L660 80 L675 30 L690 50 L840 50 L860 50 L875 20 L890 80 L905 30 L920 50 L1070 50 L1090 50 L1105 20 L1120 80 L1135 30 L1150 50 L1200 50"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ecg-trace"
        />
      </svg>
    </div>
  );
}

function ProblemSlide() {
  return (
    <SlideShell title="The problem" icon={AlertTriangle}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Cardiovascular disease (CVD) is the <strong>leading cause of death worldwide</strong>,
            responsible for an estimated <strong>17.9 million deaths every year</strong> — about
            32% of all global deaths (WHO).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Stat value="17.9M" label="Deaths/year" sub="from CVD globally"/>
            <Stat value="80%" label="Preventable" sub="with early detection"/>
            <Stat value="13" label="Clinical inputs" sub="used by our model"/>
          </div>
          <p className="text-sm text-gray-500 italic">
            Early identification enables lifestyle interventions and treatment before
            disease progresses. That&apos;s where machine learning helps.
          </p>
        </div>
        <figure className="flex flex-col items-center">
          <svg viewBox="0 0 200 220" className="w-full max-w-[200px] h-auto" role="img" aria-label="Coronary artery cross-section: a healthy open artery above a narrowed artery with plaque buildup">
            {/* Healthy artery (top) */}
            <text x="100" y="18" textAnchor="middle" className="fill-gray-600" fontSize="11" fontWeight="600">Healthy artery</text>
            <ellipse cx="100" cy="55" rx="70" ry="22" fill="#fecaca"/>
            <ellipse cx="100" cy="55" rx="55" ry="14" fill="#fee2e2"/>
            <ellipse cx="100" cy="55" rx="42" ry="9" fill="#ef4444"/>
            <text x="100" y="95" textAnchor="middle" className="fill-gray-500" fontSize="9">Wide lumen · normal blood flow</text>

            {/* Diseased artery (bottom) */}
            <text x="100" y="130" textAnchor="middle" className="fill-gray-600" fontSize="11" fontWeight="600">Atherosclerosis (CAD)</text>
            <ellipse cx="100" cy="167" rx="70" ry="22" fill="#fecaca"/>
            <ellipse cx="100" cy="167" rx="55" ry="14" fill="#fef3c7"/>
            {/* Plaque blobs */}
            <path d="M55 162 Q70 145 90 162 Q75 175 55 172 Z" fill="#fbbf24"/>
            <path d="M145 162 Q130 145 110 162 Q125 175 145 172 Z" fill="#fbbf24"/>
            <path d="M70 173 Q85 165 100 173 Q90 180 70 178 Z" fill="#f59e0b"/>
            {/* Narrow lumen */}
            <ellipse cx="100" cy="167" rx="12" ry="4" fill="#ef4444"/>
            <text x="100" y="208" textAnchor="middle" className="fill-gray-500" fontSize="9">Narrowed lumen · restricted flow</text>
          </svg>
          <figcaption className="text-[10px] text-gray-400 mt-1 text-center italic">
            How CAD narrows the arteries
          </figcaption>
        </figure>
      </div>
    </SlideShell>
  );
}

function ProductSlide() {
  return (
    <SlideShell title="What CardioPredict AI does" icon={Sparkles}>
      <p className="text-lg text-gray-700 leading-relaxed mb-6">
        A web application that classifies a patient&apos;s cardiovascular risk as{" "}
        <span className="font-semibold text-green-600">Low</span>,{" "}
        <span className="font-semibold text-amber-600">Medium</span>, or{" "}
        <span className="font-semibold text-red-600">High</span> from 13 standard
        clinical measurements.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { t: "Doctor accounts", d: "Healthcare professionals manage their own patient list." },
          { t: "Per-patient predictions", d: "Risk Score, class probabilities, recommendations." },
          { t: "Explainability built in", d: "Bar chart of which features drove the prediction." },
          { t: "History + PDF export", d: "Track each patient across time, export to PDF." },
        ].map((c) => (
          <div key={c.t} className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="font-semibold text-gray-900 text-sm">{c.t}</p>
            <p className="text-xs text-gray-600 mt-1">{c.d}</p>
          </div>
        ))}
      </div>
    </SlideShell>
  );
}

function DatasetSlide() {
  return (
    <SlideShell title="The dataset" icon={Database}>
      <p className="text-base text-gray-700 leading-relaxed mb-4">
        We use the{" "}
        <a href="https://archive.ics.uci.edu/dataset/45/heart+disease" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
          UCI Heart Disease dataset
        </a>
        {" "}— one of the most-studied benchmarks in clinical machine learning, donated
        to UCI in 1988 by the Cleveland Clinic Foundation.
      </p>
      <div className="bg-white border border-gray-200 rounded-xl p-5 my-4">
        <h3 className="font-semibold text-gray-900 mb-3">Four cohorts, ~920 patients total</h3>
        <ul className="space-y-1.5 text-sm">
          <li className="flex justify-between border-b border-gray-100 pb-1.5">
            <span className="text-gray-700">Cleveland Clinic Foundation</span>
            <span className="font-mono text-gray-900">303 patients ✓</span>
          </li>
          <li className="flex justify-between border-b border-gray-100 pb-1.5">
            <span className="text-gray-700">Hungarian Institute of Cardiology</span>
            <span className="font-mono text-gray-900">294 patients ✓</span>
          </li>
          <li className="flex justify-between border-b border-gray-100 pb-1.5">
            <span className="text-gray-400 line-through">University Hospital, Zurich (Switzerland)</span>
            <span className="font-mono text-gray-400">123 — excluded</span>
          </li>
          <li className="flex justify-between">
            <span className="text-gray-400 line-through">VA Medical Center, Long Beach</span>
            <span className="font-mono text-gray-400">200 — excluded</span>
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-3 italic">
          Switzerland and VA cohorts are missing &gt;50% of the strongest predictors
          (<code className="bg-gray-100 px-1 rounded">ca</code> and{" "}
          <code className="bg-gray-100 px-1 rounded">thal</code>); imputing that much
          measurably hurt accuracy in testing, so we kept the well-populated cohorts only.
        </p>
      </div>
      <p className="text-sm text-gray-600">
        <strong>597 usable patient records.</strong> Target: presence and severity of
        coronary artery disease (0 = none, 1-4 = increasing severity).
      </p>
    </SlideShell>
  );
}

function FeaturesOverviewSlide() {
  return (
    <SlideShell title="13 clinical inputs" icon={Activity}>
      <p className="text-sm text-gray-600 mb-4">
        Each prediction takes the same 13 features that a cardiologist would
        check during a screening visit. Grouped into demographics, symptoms,
        vitals, and diagnostic test results.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { c: "Demographics", items: ["Age", "Gender"] },
            { c: "Symptoms", items: ["Chest pain type", "Exercise-induced angina"] },
            { c: "Vitals", items: ["Resting blood pressure", "Cholesterol", "Fasting blood sugar", "Max heart rate"] },
            { c: "Diagnostic tests", items: ["Resting ECG", "ST depression", "ST slope", "Major vessels", "Thalassemia"] },
          ].map((g) => (
            <div key={g.c} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{g.c}</p>
              <ul className="space-y-0.5">
                {g.items.map((i) => (
                  <li key={i} className="text-sm text-gray-800 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">▸</span>{i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <figure className="flex flex-col items-center">
          <svg viewBox="0 0 200 200" className="w-full max-w-[200px] h-auto" role="img" aria-label="Schematic of a heart showing the four chambers and the main feature groups the model uses">
            {/* Outer heart shape */}
            <path
              d="M100 175 C 40 135, 15 85, 35 55 C 50 30, 85 30, 100 55 C 115 30, 150 30, 165 55 C 185 85, 160 135, 100 175 Z"
              fill="#fee2e2"
              stroke="#dc2626"
              strokeWidth="2"
            />
            {/* Chambers / vessels suggestion */}
            <path d="M100 60 L100 165" stroke="#dc2626" strokeWidth="1.5" opacity="0.4"/>
            <path d="M62 70 Q80 80 95 90" stroke="#dc2626" strokeWidth="1.5" fill="none" opacity="0.5"/>
            <path d="M138 70 Q120 80 105 90" stroke="#dc2626" strokeWidth="1.5" fill="none" opacity="0.5"/>
            <circle cx="100" cy="60" r="6" fill="#dc2626"/>
            {/* Tiny ECG ping inside */}
            <path d="M50 120 L70 120 L78 105 L86 135 L94 120 L150 120" stroke="#dc2626" strokeWidth="1.5" fill="none" opacity="0.7" strokeLinecap="round"/>
          </svg>
          <figcaption className="text-[10px] text-gray-400 mt-1 text-center italic">
            13 inputs feed one heart-risk score
          </figcaption>
        </figure>
      </div>
    </SlideShell>
  );
}

function FeatureDetailsSlide1() {
  return (
    <SlideShell title="Features explained — demographics & symptoms" icon={Stethoscope}>
      <FeatureRow
        name="Age"  abbr="age"
        what="Years."
        why="CVD risk roughly doubles every decade after 40. Key non-modifiable risk factor."
      />
      <FeatureRow
        name="Gender" abbr="sex"
        what="0 = female, 1 = male."
        why="Men develop CVD ~10 years earlier than women on average; oestrogen is partially protective pre-menopause."
      />
      <FeatureRow
        name="Chest pain type" abbr="cp"
        what="0 typical angina · 1 atypical · 2 non-anginal · 3 asymptomatic."
        why="Typical angina (squeezing chest pain on exertion) is the textbook CAD symptom; asymptomatic is silent ischemia."
      />
      <FeatureRow
        name="Exercise-induced angina" abbr="exang"
        what="0 = no, 1 = yes."
        why="Chest pain triggered by exercise = restricted blood flow during demand. Strong CAD signal."
      />
    </SlideShell>
  );
}

function FeatureDetailsSlide2() {
  return (
    <SlideShell title="Features explained — vitals" icon={Activity}>
      <FeatureRow
        name="Resting BP" abbr="trestbps"
        what="Systolic blood pressure (mmHg) at rest."
        why="Hypertension (≥140) damages arteries, accelerates atherosclerosis. Modifiable."
      />
      <FeatureRow
        name="Cholesterol" abbr="chol"
        what="Total serum cholesterol (mg/dl)."
        why="High LDL drives plaque formation. &gt;240 mg/dl is high risk. Modifiable via diet + statins."
      />
      <FeatureRow
        name="Fasting blood sugar" abbr="fbs"
        what="1 if &gt;120 mg/dl, else 0."
        why="Diabetes 2-4× the CVD risk; uncontrolled glucose damages vessel walls."
      />
      <FeatureRow
        name="Max heart rate" abbr="thalach"
        what="Peak HR achieved during stress test (bpm)."
        why="Low max HR for age (220 - age) suggests the heart can&apos;t respond to demand. Strong predictor."
      />
    </SlideShell>
  );
}

function FeatureDetailsSlide3() {
  return (
    <SlideShell title="Features explained — diagnostic tests" icon={BarChart3}>
      <figure className="float-right ml-4 mb-2 hidden md:block w-44">
        <svg viewBox="0 0 220 100" className="w-full h-auto bg-gray-50 rounded border border-gray-200" role="img" aria-label="ECG waveform with P wave, QRS complex, ST segment, and T wave labelled">
          {/* Grid */}
          <defs>
            <pattern id="ecg-grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10 0 L0 0 0 10" fill="none" stroke="#fecaca" strokeWidth="0.4"/>
            </pattern>
          </defs>
          <rect width="220" height="100" fill="url(#ecg-grid)"/>
          {/* ECG trace */}
          <path
            d="M5 55 L40 55 Q48 55 52 48 Q56 55 60 55 L80 55 L85 50 L90 25 L95 80 L100 30 L105 55 L130 55 Q140 40 150 55 L215 55"
            stroke="#dc2626"
            strokeWidth="1.7"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Labels */}
          <text x="48" y="44" textAnchor="middle" fontSize="7" className="fill-gray-700" fontWeight="600">P</text>
          <text x="92" y="20" textAnchor="middle" fontSize="7" className="fill-gray-700" fontWeight="600">QRS</text>
          <text x="118" y="50" textAnchor="middle" fontSize="7" className="fill-gray-700" fontWeight="600">ST</text>
          <text x="145" y="36" textAnchor="middle" fontSize="7" className="fill-gray-700" fontWeight="600">T</text>
        </svg>
        <figcaption className="text-[10px] text-gray-400 mt-1 text-center italic">
          Normal sinus rhythm
        </figcaption>
      </figure>
      <FeatureRow
        name="Resting ECG" abbr="restecg"
        what="0 normal · 1 ST-T abnormality · 2 LV hypertrophy."
        why="LV hypertrophy and ST-T changes signal long-term cardiac stress and/or prior ischemia."
      />
      <FeatureRow
        name="ST depression" abbr="oldpeak"
        what="ST segment depression during exercise (mm)."
        why="ST depression on the ECG during exertion is the classic sign of myocardial ischemia."
      />
      <FeatureRow
        name="ST slope" abbr="slope"
        what="0 upsloping · 1 flat · 2 downsloping."
        why="Downsloping ST during exercise carries the highest probability of significant CAD."
      />
      <FeatureRow
        name="Major vessels" abbr="ca"
        what="Vessels (0-3) coloured by fluoroscopy showing blockage."
        why="Direct angiographic evidence — the single strongest feature in this dataset."
      />
      <FeatureRow
        name="Thalassemia / thallium scan" abbr="thal"
        what="3 normal · 6 fixed defect · 7 reversible defect."
        why="Reversible defect on nuclear stress test = ischemia under load → high CAD likelihood."
      />
    </SlideShell>
  );
}

function PreprocessingSlide() {
  return (
    <SlideShell title="Preprocessing pipeline" icon={Layers}>
      <p className="text-base text-gray-700 mb-4">
        Real medical data is messy. Before any model sees a row, three things happen:
      </p>
      <div className="space-y-3">
        {[
          {
            t: "KNN imputation (k=5)",
            d: "Missing values (`?` in the raw files) are filled from the five clinically-most-similar patients — not the column median. Preserves patterns like 'high cholesterol + high BP → likely high ca count.'",
          },
          {
            t: "Standardization",
            d: "Each feature is rescaled to mean 0, std 1. Age (25-90) and cholesterol (100-400) end up comparable, so the model isn't biased toward larger-magnitude features.",
          },
          {
            t: "Risk class mapping",
            d: "Raw target (0-4 severity) is bucketed: 0 → Low, 1-2 → Medium, 3-4 → High. Stratified 80/20 train/test split keeps the class balance.",
          },
        ].map((s, i) => (
          <div key={s.t} className="flex gap-3 items-start bg-white border border-gray-200 rounded-lg p-3">
            <div className="w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{s.t}</p>
              <p className="text-sm text-gray-600 mt-0.5">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideShell>
  );
}

function ModelChoiceSlide() {
  return (
    <SlideShell title="Model choice — LR vs XGBoost" icon={Cpu}>
      <p className="text-base text-gray-700 mb-4">
        Both models were tuned with{" "}
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">GridSearchCV</code>{" "}
        + 5-fold stratified cross-validation on the same train split. We pick the
        winner by weighted F1, then evaluate it on the held-out test set.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border-2 border-red-500 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900">Logistic Regression</h3>
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-semibold">WINNER</span>
          </div>
          <ul className="text-sm text-gray-700 space-y-1.5">
            <li>• Tuned C (regularisation), penalty (l1/l2), solver</li>
            <li>• Interpretable coefficients — explains each prediction</li>
            <li>• Same model behind Framingham + ASCVD risk scores</li>
            <li>• Robust on ~600 rows</li>
          </ul>
          <p className="mt-3 text-2xl font-bold text-red-600">78.3%</p>
          <p className="text-xs text-gray-500">test accuracy</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-bold text-gray-900 mb-2">XGBoost</h3>
          <ul className="text-sm text-gray-700 space-y-1.5">
            <li>• Tuned n_estimators, depth, learning rate, subsample</li>
            <li>• Gradient-boosted trees — usually wins on tabular data</li>
            <li>• Needs more data than UCI provides to beat LR</li>
            <li>• Explainability requires extra tooling (SHAP)</li>
          </ul>
          <p className="mt-3 text-2xl font-bold text-gray-600">75.0%</p>
          <p className="text-xs text-gray-500">test accuracy</p>
        </div>
      </div>
    </SlideShell>
  );
}

function PerformanceSlide() {
  return (
    <SlideShell title="Performance" icon={BarChart3}>
      <p className="text-base text-gray-700 mb-6">
        On the 20% held-out test set (119 patients the model never trained on):
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
        <Stat value="78.3%" label="Accuracy" sub="of all predictions correct"/>
        <Stat value="0.774" label="F1 Score" sub="precision-recall balance"/>
        <Stat value="0.905" label="ROC-AUC" sub="class separation"/>
        <Stat value="3-class" label="Multinomial" sub="Low / Medium / High"/>
      </div>
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg text-sm">
        <p className="font-semibold text-amber-900 mb-1">Why not higher?</p>
        <p className="text-amber-900 leading-relaxed">
          Kaggle leaderboards on the UCI heart-disease dataset cap around 80-83%
          — that&apos;s a known ceiling with ~600 rows. Anything claiming &gt;90% on
          this data is typically overfitting on a lucky test split.
        </p>
      </div>
    </SlideShell>
  );
}

function InterpretabilitySlide() {
  return (
    <SlideShell title="Risk Score & explainability" icon={Brain}>
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="font-semibold text-gray-900 mb-1">Risk Score = 1 − P(Low)</p>
          <p className="text-sm text-gray-600">
            Probability the patient has any level of disease (Medium or High).
            Always reads the same direction: <span className="text-red-600 font-medium">high
            number = concerning</span>, low number = healthy. Replaces the
            misleading &quot;max class probability&quot; that read low on multi-class problems.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="font-semibold text-gray-900 mb-1">Feature contributions</p>
          <p className="text-sm text-gray-600">
            For each prediction we plot{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">coef × scaled_value</code>{" "}
            per feature. The result page shows red bars (pushed toward the predicted
            class) and green bars (pushed away). A doctor can literally see what the
            model is leaning on — Major vessels, ST depression, exercise-induced
            angina — and verify it matches clinical intuition.
          </p>
        </div>
      </div>
    </SlideShell>
  );
}

function TechStackSlide() {
  return (
    <SlideShell title="Tech stack" icon={Code2}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { h: "Frontend", b: "Next.js 16 (App Router) · Tailwind CSS · Chart.js · lucide-react · Vercel" },
          { h: "Backend", b: "FastAPI · SQLAlchemy · Alembic migrations · JWT auth · sqladmin · Hugging Face Spaces (Docker)" },
          { h: "Data", b: "PostgreSQL on Supabase (managed) · 7 tables · schema versioned" },
          { h: "ML", b: "scikit-learn (LogisticRegression) · KNNImputer · StandardScaler · XGBoost (benchmark) · GridSearchCV" },
        ].map((s) => (
          <div key={s.h} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wide">{s.h}</p>
            <p className="text-sm text-gray-700 mt-1">{s.b}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4 italic">
        All three tiers run on permanent free tiers — no infrastructure bill for the demo.
      </p>
    </SlideShell>
  );
}

function DemoSlide() {
  return (
    <SlideShell title="Live demo" icon={Globe}>
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 rounded-xl p-6">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">Frontend</p>
          <a href="https://cardiopredict-ai.vercel.app" target="_blank" rel="noopener noreferrer" className="text-lg font-mono text-red-600 hover:underline break-all">
            cardiopredict-ai.vercel.app
          </a>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Demo credentials</p>
          <p className="text-sm text-gray-700 font-mono mt-1">
            Username: <span className="font-semibold text-gray-900">admin</span>
          </p>
          <p className="text-sm text-gray-700 font-mono">
            Password: <span className="font-semibold text-gray-900">Admin@321</span>
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Source code</p>
          <a href="https://github.com/AsifNawazMughal/cardiopredict-ai" target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-gray-900 hover:text-red-600 break-all flex items-center gap-2">
            <Github className="w-4 h-4"/> github.com/AsifNawazMughal/cardiopredict-ai
          </a>
        </div>
      </div>
    </SlideShell>
  );
}

function ThankYouSlide() {
  return (
    <div className="relative h-full overflow-hidden flex flex-col items-center justify-center text-center px-6">
      {/* Subtle dot grid matching the title slide */}
      <svg aria-hidden="true" className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="thanks-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="white"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#thanks-dots)"/>
      </svg>

      <div className="relative z-10 max-w-xl">
        <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-2xl ring-1 ring-white/30">
          <Heart className="w-12 h-12 text-white animate-heartbeat" fill="currentColor"/>
        </div>
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight">Thank you</h2>
        <p className="text-lg text-red-100 mb-8">Questions, feedback, or collaboration — get in touch.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="https://wa.me/923026678305" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white text-red-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-red-50 transition-colors shadow-lg">
            <MessageCircle className="w-4 h-4"/> WhatsApp +92 302 6678305
          </a>
          <a href="https://github.com/AsifNawazMughal" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/30 px-5 py-2.5 rounded-lg font-semibold hover:bg-white/20 transition-colors">
            <Github className="w-4 h-4"/> GitHub
          </a>
        </div>
        <p className="text-xs text-red-100/80 mt-8 italic">— Asif Nawaz Mughal</p>
      </div>

      {/* Matching ECG trace at the bottom for symmetry with the title slide */}
      <svg aria-hidden="true" viewBox="0 0 1200 100" preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-20 pointer-events-none">
        <path
          d="M0 50 L150 50 L170 50 L185 20 L200 80 L215 30 L230 50 L380 50 L400 50 L415 20 L430 80 L445 30 L460 50 L610 50 L630 50 L645 20 L660 80 L675 30 L690 50 L840 50 L860 50 L875 20 L890 80 L905 30 L920 50 L1070 50 L1090 50 L1105 20 L1120 80 L1135 30 L1150 50 L1200 50"
          stroke="rgba(255,255,255,0.55)" strokeWidth="2" fill="none"
          strokeLinecap="round" strokeLinejoin="round" className="ecg-trace"/>
      </svg>
    </div>
  );
}

function SlideShell({ title, icon: Icon, children }) {
  return (
    <div className="h-full flex flex-col px-6 sm:px-12 py-8 sm:py-12 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-red-600"/>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// Slides list — order = presentation order
export const SLIDES = [
  { id: "title",       title: "CardioPredict AI",                                themed: true,  render: () => <TitleSlide/> },
  { id: "problem",     title: "The problem",                                     render: () => <ProblemSlide/> },
  { id: "product",     title: "What CardioPredict AI does",                      render: () => <ProductSlide/> },
  { id: "dataset",     title: "The dataset",                                     render: () => <DatasetSlide/> },
  { id: "features",    title: "13 clinical inputs",                              render: () => <FeaturesOverviewSlide/> },
  { id: "features-1",  title: "Features — demographics & symptoms",              render: () => <FeatureDetailsSlide1/> },
  { id: "features-2",  title: "Features — vitals",                               render: () => <FeatureDetailsSlide2/> },
  { id: "features-3",  title: "Features — diagnostic tests",                     render: () => <FeatureDetailsSlide3/> },
  { id: "preprocess",  title: "Preprocessing pipeline",                          render: () => <PreprocessingSlide/> },
  { id: "model",       title: "Model choice — LR vs XGBoost",                    render: () => <ModelChoiceSlide/> },
  { id: "performance", title: "Performance",                                     render: () => <PerformanceSlide/> },
  { id: "explain",     title: "Risk Score & explainability",                     render: () => <InterpretabilitySlide/> },
  { id: "stack",       title: "Tech stack",                                      render: () => <TechStackSlide/> },
  { id: "demo",        title: "Live demo",                                       render: () => <DemoSlide/> },
  { id: "thanks",      title: "Thank you",                                       themed: true,  render: () => <ThankYouSlide/> },
];

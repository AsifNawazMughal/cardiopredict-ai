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
    <div className="h-full flex flex-col items-center justify-center text-center px-6">
      <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-lg">
        <Heart className="w-14 h-14 text-white animate-heartbeat" fill="currentColor"/>
      </div>
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-3">CardioPredict AI</h1>
      <p className="text-xl md:text-2xl text-red-100 max-w-2xl mb-6">
        Interpretable machine learning for cardiovascular risk assessment
      </p>
      <p className="text-sm text-red-100/90">A project by <span className="font-semibold">Asif Nawaz Mughal</span></p>
    </div>
  );
}

function ProblemSlide() {
  return (
    <SlideShell title="The problem" icon={AlertTriangle}>
      <p className="text-lg text-gray-700 leading-relaxed mb-6">
        Cardiovascular disease (CVD) is the <strong>leading cause of death worldwide</strong>,
        responsible for an estimated <strong>17.9 million deaths every year</strong> — about
        32% of all global deaths (WHO).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
        <Stat value="17.9M" label="Deaths per year" sub="from CVD globally"/>
        <Stat value="80%" label="Premature deaths" sub="preventable with early detection"/>
        <Stat value="13" label="Clinical inputs" sub="needed for screening"/>
      </div>
      <p className="text-sm text-gray-500 italic">
        Early identification of at-risk patients enables lifestyle interventions and
        treatment before disease progresses. That&apos;s where machine learning helps.
      </p>
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
        check during a screening visit. We group them into demographics, symptoms,
        vitals, and diagnostic test results.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { c: "Demographics", items: ["Age", "Sex"] },
          { c: "Symptoms", items: ["Chest pain type", "Exercise-induced angina"] },
          { c: "Vitals", items: ["Resting blood pressure", "Cholesterol", "Fasting blood sugar", "Max heart rate achieved"] },
          { c: "Diagnostic tests", items: ["Resting ECG", "ST depression", "ST slope", "Major vessels (fluoroscopy)", "Thalassemia (stress test)"] },
        ].map((g) => (
          <div key={g.c} className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{g.c}</p>
            <ul className="space-y-1">
              {g.items.map((i) => (
                <li key={i} className="text-sm text-gray-800 flex items-start gap-2">
                  <span className="text-red-500 mt-1">▸</span>{i}
                </li>
              ))}
            </ul>
          </div>
        ))}
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
        name="Sex" abbr="sex"
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
    <div className="h-full flex flex-col items-center justify-center text-center px-6">
      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
        <Heart className="w-12 h-12 text-white animate-heartbeat" fill="currentColor"/>
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">Thank you</h2>
      <p className="text-lg text-red-100 mb-8 max-w-xl">Questions, feedback, or collaboration — get in touch.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <a href="https://wa.me/923026678305" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-red-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-red-50 transition-colors">
          <MessageCircle className="w-4 h-4"/> WhatsApp +92 302 6678305
        </a>
        <a href="https://github.com/AsifNawazMughal" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/30 px-5 py-2.5 rounded-lg font-semibold hover:bg-white/20 transition-colors">
          <Github className="w-4 h-4"/> GitHub
        </a>
      </div>
      <p className="text-xs text-red-100/80 mt-8 italic">— Asif Nawaz Mughal</p>
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

"use client";
import Link from "next/link";
import { Heart, Github, ArrowLeft, Activity, Database, Cpu, Layers, FileText, Award, MessageCircle, Mail } from "lucide-react";
import Footer from "@/components/Footer";

export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header + Hero — one cohesive red block */}
      <section className="bg-gradient-to-br from-red-600 to-rose-600 text-white">
        <div className="max-w-5xl mx-auto px-6">
          {/* Top nav row */}
          <div className="flex items-center justify-between py-5 border-b border-white/15">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <p className="font-bold text-base">CardioPredict AI</p>
            </Link>
            <Link
              href="/"
              className="text-sm text-red-100 hover:text-white transition-colors flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
          </div>
          {/* Hero content */}
          <div className="py-14 md:py-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About CardioPredict AI</h1>
            <p className="text-lg md:text-xl text-red-100 max-w-3xl">
              An interpretable machine-learning web app that classifies a patient&apos;s
              cardiovascular risk as Low, Medium, or High from 13 standard clinical
              measurements.
            </p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">

          {/* What it does */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-red-600" /> What it does
            </h2>
            <p className="text-gray-700 leading-relaxed">
              A doctor enters 13 standard clinical measurements (age, resting blood
              pressure, cholesterol, max heart rate, exercise-induced angina, ST
              depression, etc.) for a patient. The trained model returns a probability
              over three risk classes (Low, Medium, High), along with a confidence score
              and recommendation set. Predictions are persisted per-patient so users
              can review history and trends over time.
            </p>
          </section>

          {/* The model */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-red-600" /> The model
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                The active model is a multinomial <strong>Logistic Regression</strong>{" "}
                classifier from <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">scikit-learn</code>.
                I tried three models during the original research (a 3-layer ANN, Random
                Forest, and Logistic Regression). On this dataset all three landed within
                a 1% accuracy band — so I shipped the simplest one in production.
              </p>
              <p className="text-gray-700 leading-relaxed">
                That isn&apos;t a compromise. Logistic regression is the model behind the
                clinically-used <em>Framingham Risk Score</em> and <em>ASCVD</em> risk
                equations. It produces interpretable coefficients you can show to a
                physician — &quot;a +1 standard-deviation increase in cholesterol shifts the
                log-odds of high risk by 0.43&quot; — something a neural net can&apos;t do without
                extra explainability tooling. On ~600 tabular rows, deep learning is
                overkill.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">76.7%</div>
                  <div className="text-xs text-gray-500 mt-1">Accuracy</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">0.764</div>
                  <div className="text-xs text-gray-500 mt-1">F1 Score</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">0.910</div>
                  <div className="text-xs text-gray-500 mt-1">ROC-AUC</div>
                </div>
              </div>
            </div>
          </section>

          {/* Dataset */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-red-600" /> Dataset
            </h2>
            <p className="text-gray-700 leading-relaxed">
              <a
                href="https://archive.ics.uci.edu/dataset/45/heart+disease"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:underline"
              >
                UCI Heart Disease
              </a>{" "}
              — Cleveland and Hungarian cohorts combined (~600 patients).
              80/20 train/test split with stratified sampling. The original
              target column (0–4 disease severity) is bucketed into 3 classes:
              0 = Low, 1–2 = Medium, 3–4 = High. Missing values are imputed with
              the per-column median, and features are standardized with z-score
              normalization before training.
            </p>
          </section>

          {/* Tech stack */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Layers className="w-6 h-6 text-red-600" /> Tech stack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Frontend</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Next.js 16 (App Router, React Server Components)</li>
                  <li>• Tailwind CSS</li>
                  <li>• Chart.js for visualizations</li>
                  <li>• Deployed on Vercel</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Backend</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• FastAPI (Python 3.12)</li>
                  <li>• SQLAlchemy + Alembic migrations</li>
                  <li>• JWT auth, sqladmin panel</li>
                  <li>• Deployed on Hugging Face Spaces (Docker)</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Data</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• PostgreSQL on Supabase (managed)</li>
                  <li>• Schema versioned with Alembic</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">ML</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• scikit-learn — LogisticRegression</li>
                  <li>• StandardScaler for feature normalization</li>
                  <li>• Persisted via pickle, loaded once at startup</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="border-l-4 border-amber-400 bg-amber-50 p-5 rounded-r-xl">
            <h2 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Not a medical device
            </h2>
            <p className="text-sm text-amber-900 leading-relaxed">
              CardioPredict AI is a portfolio project intended to demonstrate
              full-stack and applied-ML engineering. It is <strong>not</strong>{" "}
              validated for clinical use, has not been reviewed by any regulatory
              body, and must not be used to make medical decisions. Always consult
              a licensed healthcare professional for diagnosis and treatment.
            </p>
          </section>

          {/* Credits + Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-red-600" /> Built by
            </h2>
            <div className="bg-gradient-to-br from-red-600 to-rose-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-2xl font-bold">Asif Nawaz Mughal</p>
                  <p className="text-sm text-red-100 mt-1">
                    Full-stack developer · BS Computer Science
                  </p>
                </div>
                <a
                  href="https://github.com/AsifNawazMughal/cardiopredict-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Github className="w-4 h-4" /> View on GitHub
                </a>
              </div>
              <div className="border-t border-red-400/40 pt-4">
                <p className="text-sm text-red-100 mb-3">
                  Like what you see? Hire me, partner with me, or just say hi 👋
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://wa.me/923026678305?text=Hi%20Asif%2C%20I%20saw%20your%20CardioPredict%20AI%20project"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp: +92 302 6678305
                  </a>
                  <a
                    href="mailto:asifnaw33@gmail.com"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-sm font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/30"
                  >
                    <Mail className="w-4 h-4" /> Email
                  </a>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}

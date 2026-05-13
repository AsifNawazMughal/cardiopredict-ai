"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Heart, Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { authApi } from "../lib/api";

function VerifyEmailInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const email = params.get("email");

  // Two flows:
  //  1. Just registered → no token, has ?email=...        → show "check your inbox"
  //  2. Clicked the email link → has ?token=...           → call API, show result
  const [state, setState] = useState(token ? "verifying" : "awaiting");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    authApi.verifyEmail(token)
      .then(() => { if (!cancelled) setState("success"); })
      .catch((err) => {
        if (cancelled) return;
        setState("error");
        setMessage(err.message || "Verification failed");
      });
    return () => { cancelled = true; };
  }, [token]);

  async function handleResend() {
    if (!email) {
      toast.error("Missing email — please register again");
      return;
    }
    setResending(true);
    try {
      await authApi.resendVerification(email);
      toast.success("If the email exists, a new verification link is on its way.");
    } catch (err) {
      toast.error(err.message || "Failed to resend");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Branded header */}
        <div className="bg-gradient-to-br from-red-600 to-rose-600 text-white p-6 text-center">
          <div className="w-12 h-12 mx-auto bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
            <Heart className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold">CardioPredict AI</h1>
        </div>

        <div className="p-8 text-center">
          {state === "awaiting" && (
            <>
              <div className="w-14 h-14 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-7 h-7 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                We&apos;ve sent a verification link to
                {email && <> <span className="font-medium text-gray-900">{email}</span></>}.
                Click it to activate your account. The link expires in 24 hours.
              </p>
              <button
                onClick={handleResend}
                disabled={resending || !email}
                className="text-sm text-red-600 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? "Sending..." : "Didn't get it? Resend"}
              </button>
              <div className="border-t border-gray-100 mt-6 pt-5">
                <Link href="/login" className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                  ← Back to sign in
                </Link>
              </div>
            </>
          )}

          {state === "verifying" && (
            <>
              <Loader2 className="w-12 h-12 text-red-600 mx-auto animate-spin mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying your email…</h2>
              <p className="text-gray-500 text-sm">Just a moment.</p>
            </>
          )}

          {state === "success" && (
            <>
              <div className="w-14 h-14 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email verified!</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                Your account is ready. You can now sign in to CardioPredict AI.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="inline-flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                Sign In <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {state === "error" && (
            <>
              <div className="w-14 h-14 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verification failed</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                {message || "The link is invalid or expired."}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <VerifyEmailInner />
    </Suspense>
  );
}

"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Star, X, Send, CheckCircle2 } from "lucide-react";
import { reviewsApi } from "@/app/lib/api";

/**
 * Star rating + comment form. Reusable in two modes:
 *   <ReviewWidget mode="inline" predictionId={...} />
 *   <ReviewWidget mode="modal" predictionId={...} onClose={...} />
 */
export default function ReviewWidget({ mode = "inline", predictionId, onClose, onSubmitted }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e?.preventDefault();
    if (!stars) {
      toast.error("Please pick a star rating");
      return;
    }
    setSubmitting(true);
    try {
      await reviewsApi.create({
        stars,
        comment: comment.trim() || null,
        prediction_id: predictionId ?? null,
      });
      setSubmitted(true);
      toast.success("Thanks for your feedback!");
      onSubmitted?.();
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  const body = submitted ? (
    <div className="text-center py-6">
      <div className="w-14 h-14 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-3">
        <CheckCircle2 className="w-7 h-7 text-green-600" />
      </div>
      <p className="text-base font-semibold text-gray-900 mb-1">Thanks for your review!</p>
      <p className="text-sm text-gray-500">Your feedback helps improve CardioPredict AI.</p>
      {mode === "modal" && (
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg">
          Close
        </button>
      )}
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <p className="text-sm text-gray-700 mb-2">How would you rate this prediction tool?</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStars(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="p-1 transition-transform hover:scale-110"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              <Star
                className={`w-7 h-7 ${
                  (hover || stars) >= n ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Tell us more <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="What did you like? What could be better?"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/2000</p>
      </div>
      <div className="flex gap-2 justify-end">
        {mode === "modal" && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            Maybe later
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !stars}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Send className="w-3.5 h-3.5" /> {submitting ? "Sending..." : "Submit review"}
        </button>
      </div>
    </form>
  );

  if (mode === "modal") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Rate CardioPredict AI</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5">{body}</div>
        </div>
      </div>
    );
  }

  // Inline mode
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <h3 className="font-semibold text-gray-800">Leave a review</h3>
      </div>
      {body}
    </div>
  );
}

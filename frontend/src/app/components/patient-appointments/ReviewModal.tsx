import { useState } from "react";
import { Star, X, CheckCircle2, Loader2 } from "lucide-react";
import type { AppointmentReview, Appointment } from "./AppointmentTypes";
import { ImageWithFallback } from "../../figma/ImageWithFallback";


export function ReviewModal({
  appointment,
  onClose,
  onSubmit,
}: {
  appointment: Appointment;
  onClose: () => void;
  onSubmit: (review: AppointmentReview) => Promise<void>;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({ rating, comment });
      setSubmitted(true);
    } catch {
      // Parent shows the error toast.
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-fg mb-2">Review Submitted!</h3>
          <div className="flex justify-center gap-1 mb-3">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`w-5 h-5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
            ))}
          </div>
          {comment && <p className="text-sm text-fg-muted italic mb-5">"{comment}"</p>}
          <button onClick={onClose} className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-fg">Add Review</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl mb-5">
          <ImageWithFallback src={appointment.doctor.photo} alt={appointment.doctor.name} className="w-12 h-12 rounded-full object-cover" />
          <div>
            <p className="font-semibold text-fg">{appointment.doctor.name}</p>
            <p className="text-sm text-fg-muted">{appointment.doctor.specialty}</p>
          </div>
        </div>
        <p className="text-sm text-fg-muted mb-2">Rate your experience</p>
        <div className="flex gap-1 mb-5">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
              disabled={submitting}
              className="transition-transform hover:scale-110 disabled:opacity-50"
            >
              <Star className={`w-8 h-8 ${(hovered || rating) >= s ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Share your experience (optional)..."
          disabled={submitting}
          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm mb-4 disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="w-full bg-primary text-white py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </button>
      </div>
    </div>
  );
}

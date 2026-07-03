import type { Appointment } from "./AppointmentTypes";
import { Star, X } from "lucide-react";
import { ImageWithFallback } from "../../figma/ImageWithFallback";

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export function ViewReviewModal({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const review = appointment.review!;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-fg">Your Review</h3>
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
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`w-6 h-6 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
            ))}
          </div>
          <span className="text-sm text-fg-muted">{review.rating} / 5</span>
        </div>
        {review.comment ? (
          <p className="text-sm text-fg bg-muted/30 p-4 rounded-xl italic leading-relaxed">"{review.comment}"</p>
        ) : (
          <p className="text-sm text-fg-muted italic">No written comment.</p>
        )}
        <p className="text-xs text-fg-muted mt-3">Reviewed on {formatDate(appointment.date)}</p>
        <button onClick={onClose} className="w-full mt-5 border border-border text-fg py-2.5 rounded-xl hover:bg-muted/50 transition-colors text-sm">
          Close
        </button>
      </div>
    </div>
  );
}
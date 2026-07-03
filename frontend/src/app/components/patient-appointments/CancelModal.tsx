import type { Appointment } from "./AppointmentTypes";
import { XCircle } from "lucide-react";

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export function CancelModal({ appointment, onClose, onConfirm }: { appointment: Appointment; onClose: () => void; onConfirm: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-fg text-center mb-2">Cancel Appointment?</h3>
                <p className="text-sm text-fg-muted text-center mb-1">
                    You are about to cancel your appointment with
                </p>
                <p className="text-sm font-medium text-fg text-center mb-5">{appointment.doctor.name} on {formatDate(appointment.date)}</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 border border-border text-fg py-2.5 rounded-xl hover:bg-muted/50 transition-colors text-sm">
                        Keep It
                    </button>
                    <button onClick={onConfirm} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition-colors text-sm">
                        Yes, Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
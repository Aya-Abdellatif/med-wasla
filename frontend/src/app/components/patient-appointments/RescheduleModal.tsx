import { useState } from "react";
import { X, RefreshCw } from "lucide-react";
import type { Appointment } from "./AppointmentTypes";
import { ImageWithFallback } from "../../figma/ImageWithFallback";

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export function RescheduleModal({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

    if (submitted) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RefreshCw className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Appointment Rescheduled!</h3>
                    <p className="text-muted-foreground mb-6">Your appointment has been successfully rescheduled to {formatDate(date)} at {time}.</p>
                    <button onClick={onClose} className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">Done</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-foreground">Reschedule Appointment</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl mb-5">
                    <ImageWithFallback src={appointment.doctor.photo} alt={appointment.doctor.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                        <p className="font-semibold text-foreground">{appointment.doctor.name}</p>
                        <p className="text-sm text-muted-foreground">Current: {formatDate(appointment.date)} at {appointment.time}</p>
                    </div>
                </div>
                <div className="space-y-4 mb-5">
                    <div>
                        <label className="block text-sm text-foreground mb-1.5">New Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-foreground mb-1.5">New Time</label>
                        <select
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Select a time</option>
                            {timeSlots.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <button
                    onClick={() => date && time && setSubmitted(true)}
                    disabled={!date || !time}
                    className="w-full bg-primary text-white py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Confirm Reschedule
                </button>
            </div>
        </div>
    );
}
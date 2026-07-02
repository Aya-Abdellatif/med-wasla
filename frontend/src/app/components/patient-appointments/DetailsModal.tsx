import { useState, useEffect } from "react";
import type { Appointment, AppointmentStatus } from "./AppointmentTypes";
import { ImageWithFallback } from "../../figma/ImageWithFallback";
import {
    Calendar,
    Clock,
    MapPin,
    Star,
    X,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Home as HomeIcon,
    Stethoscope,
    Bell,
    Armchair,
    Users,
    Loader2,
    UserX,
} from "lucide-react";
import { fetchAppointmentQueue } from "../../../services/appointmentsApi";
import type { AppointmentQueueResult } from "../../../services/appointmentsApi";


function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

const statusConfig: Record<AppointmentStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    upcoming: { label: "Upcoming", color: "text-blue-700", bgColor: "bg-blue-50 border border-blue-200", icon: Clock },
    pending: { label: "Pending", color: "text-amber-700", bgColor: "bg-amber-50 border border-amber-200", icon: AlertCircle },
    completed: { label: "Completed", color: "text-emerald-700", bgColor: "bg-emerald-50 border border-emerald-200", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-50 border border-red-200", icon: XCircle },
    overdue: { label: "Overdue", color: "text-slate-700", bgColor: "bg-slate-100 border border-slate-200", icon: AlertCircle },
    no_show: { label: "No Show", color: "text-amber-800", bgColor: "bg-amber-50 border border-amber-200", icon: UserX },
};

export function DetailsModal({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
    const status = statusConfig[appointment.status];
    const StatusIcon = status.icon;

    const [queueData, setQueueData] = useState<AppointmentQueueResult | null>(null);
    const [loadingQueue, setLoadingQueue] = useState(false);

    const isAppointmentToday = () => {
        const d = new Date(appointment.date);
        const today = new Date();
        return d.getFullYear() === today.getFullYear() &&
               d.getMonth() === today.getMonth() &&
               d.getDate() === today.getDate();
    };

    const isToday = isAppointmentToday();

    useEffect(() => {
        if (appointment.type !== "clinic" || appointment.status !== "upcoming") return;

        let active = true;
        const loadQueue = async () => {
            try {
                if (active && !queueData) setLoadingQueue(true);
                const data = await fetchAppointmentQueue(appointment.id);
                if (active) {
                    setQueueData(data);
                    setLoadingQueue(false);
                }
            } catch (err) {
                console.error("Error fetching queue data:", err);
                if (active) setLoadingQueue(false);
            }
        };

        loadQueue();
        
        if (isToday) {
            const interval = setInterval(loadQueue, 15000);
            return () => {
                active = false;
                clearInterval(interval);
            };
        } else {
            return () => {
                active = false;
            };
        }
    }, [appointment.id, appointment.type, isToday]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h3 className="text-lg font-bold text-foreground">Appointment Details</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Doctor info */}
                    <div className="flex items-center gap-4 p-4 bg-linear-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
                        <ImageWithFallback
                            src={appointment.doctor.photo}
                            alt={appointment.doctor.name}
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
                        />
                        <div className="flex-1">
                            <h4 className="font-bold text-foreground">{appointment.doctor.name}</h4>
                            <p className="text-primary text-sm">{appointment.doctor.specialty}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-sm text-muted-foreground">{appointment.doctor.rating}</span>
                            </div>
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                        </span>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Date</p>
                                <p className="text-sm font-medium text-foreground">{formatDate(appointment.date)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Time</p>
                                <p className="text-sm font-medium text-foreground">{appointment.time}</p>
                            </div>
                        </div>
                    </div>

                    {/* Type */}
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                            {appointment.type === "clinic" ? <Stethoscope className="w-4 h-4 text-primary" /> : <HomeIcon className="w-4 h-4 text-primary" />}
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Appointment Type</p>
                            <p className="text-sm font-medium text-foreground">{appointment.type === "clinic" ? "Clinic Visit" : "Home Visit"}</p>
                        </div>
                    </div>

                    {/* Address */}
                    {appointment.address && (
                        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Location / Address</p>
                                <p className="text-sm font-medium text-foreground">{appointment.address}</p>
                            </div>
                        </div>
                    )}

                    {appointment.type === "clinic" && appointment.status === "upcoming" && (
                        <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary" />
                                    <h5 className="font-bold text-sm text-foreground">Clinic Queue Status</h5>
                                </div>
                                {loadingQueue && !queueData ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                                ) : (queueData?.isActive && isToday) ? (
                                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Live
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                        Scheduled
                                    </span>
                                )}
                            </div>

                            {loadingQueue && !queueData ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            ) : queueData ? (
                                <div className="space-y-4">
                                    {!isToday ? (
                                        <div className="text-sm space-y-2">
                                            {queueData.userEntry ? (
                                                <p className="text-foreground">
                                                    You are booked at position <span className="font-bold text-primary">{queueData.userEntry.queueNumber}</span> in the queue for this day.
                                                </p>
                                            ) : (
                                                <p className="text-muted-foreground">Queue position loaded.</p>
                                            )}
                                            <p className="text-xs text-slate-500 bg-slate-100 border border-slate-200 p-2.5 rounded-lg">
                                                ℹ️ Live queue tracking (with your live position and chairs visual) will start on the day of your appointment.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-sm">
                                                {queueData.isActive ? (
                                                    queueData.userEntry ? (
                                                        queueData.userEntry.status === "completed" ? (
                                                            <p className="text-emerald-700 font-medium">✨ Your visit is completed! Thank you.</p>
                                                        ) : queueData.userEntry.status === "cancelled" ? (
                                                            <p className="text-red-600 font-medium">❌ This appointment queue slot was cancelled.</p>
                                                        ) : queueData.waitingAhead === 0 ? (
                                                            <p className="text-primary font-semibold animate-pulse">👉 You are next in line! Please proceed to the doctor's room.</p>
                                                        ) : (
                                                            <p className="text-muted-foreground">
                                                                You are at position <span className="font-bold text-foreground">{queueData.waitingAhead + 1}</span> in the waiting line. 
                                                                There are <span className="font-bold text-primary">{queueData.waitingAhead}</span> patient(s) ahead of you.
                                                            </p>
                                                        )
                                                    ) : (
                                                        <p className="text-muted-foreground">You are not in the queue for today.</p>
                                                    )
                                                ) : (
                                                    <p className="text-amber-700 font-medium bg-amber-50 border border-amber-100 p-2 rounded-lg text-xs">
                                                        ⚠️ The doctor has not started or has paused the live queue. Please check with the receptionist when you arrive.
                                                    </p>
                                                )}
                                            </div>

                                            {queueData.isActive && queueData.entries.length > 0 && (
                                                <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-border/60 shadow-xs">
                                                    <div className="flex items-center gap-3 w-full overflow-x-auto py-2 justify-center scrollbar-none">
                                                        <div className="flex flex-col items-center shrink-0 min-w-17.5 border-r border-dashed border-border pr-3 mr-1">
                                                            <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-xs">
                                                                🚪
                                                            </div>
                                                            <span className="text-[10px] font-bold text-primary mt-1">Doctor's Room</span>
                                                        </div>

                                                        <span className="text-muted-foreground text-xs shrink-0 font-mono">←</span>

                                                        {(() => {
                                                            const activeEntries = queueData.entries.filter(e => e.status === "waiting" || e.status === "in_progress");
                                                            const selfIdx = activeEntries.findIndex(e => e.isSelf);
                                                            
                                                            if (activeEntries.length === 0) {
                                                                return <p className="text-xs text-muted-foreground py-2">No patients waiting</p>;
                                                            }

                                                            let entriesToShow = activeEntries;
                                                            let showLeadingEllipsis = false;
                                                            let showTrailingEllipsis = false;

                                                            if (activeEntries.length > 5) {
                                                                if (selfIdx <= 2) {
                                                                    entriesToShow = activeEntries.slice(0, 5);
                                                                    showTrailingEllipsis = true;
                                                                } else if (selfIdx >= activeEntries.length - 3) {
                                                                    entriesToShow = activeEntries.slice(activeEntries.length - 5);
                                                                    showLeadingEllipsis = true;
                                                                } else {
                                                                    entriesToShow = activeEntries.slice(selfIdx - 2, selfIdx + 3);
                                                                    showLeadingEllipsis = true;
                                                                    showTrailingEllipsis = activeEntries.length > selfIdx + 3;
                                                                }
                                                            }

                                                            return (
                                                                <>
                                                                    {showLeadingEllipsis && (
                                                                        <span className="text-muted-foreground text-xs px-1 shrink-0">...</span>
                                                                    )}

                                                                    {entriesToShow.map((entry) => {
                                                                        const isUser = entry.isSelf;
                                                                        const isInProgress = entry.status === "in_progress";
                                                                        
                                                                        let bgClass = "bg-muted text-muted-foreground border-slate-200";
                                                                        let label: string;
                                                                        let labelText = "";
                                                                        
                                                                        if (isInProgress) {
                                                                            bgClass = "bg-emerald-50 text-emerald-600 border-emerald-300 animate-pulse";
                                                                            label = "Current";
                                                                        } else {
                                                                            const waitingOnlyEntries = activeEntries.filter(e => e.status === "waiting");
                                                                            const waitingIdx = waitingOnlyEntries.findIndex(e => e.queueNumber === entry.queueNumber);
                                                                            const positionNumber = waitingIdx + 1;

                                                                            if (isUser) {
                                                                                bgClass = "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105 ring-2 ring-primary/20";
                                                                                label = "You";
                                                                                labelText = String(positionNumber);
                                                                            } else {
                                                                                label = String(positionNumber);
                                                                            }
                                                                        }

                                                                        return (
                                                                            <div key={entry.queueNumber} className="flex flex-col items-center gap-1 shrink-0">
                                                                                <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-medium transition-all text-xs ${bgClass}`}>
                                                                                    {label === "You" ? "You" : label === "Current" ? <Armchair className="w-4 h-4" /> : label}
                                                                                </div>
                                                                                <span className={`text-[9px] font-semibold ${isUser ? "text-primary font-bold" : "text-muted-foreground"}`}>
                                                                                    {isInProgress ? "Current" : isUser ? `Position ${labelText}` : "Waiting"}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}

                                                                    {showTrailingEllipsis && (
                                                                        <span className="text-muted-foreground text-xs px-1 shrink-0">...</span>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground">Unable to load queue status.</p>
                            )}
                        </div>
                    )}

                    {/* Reason */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Reason for Visit</p>
                        <p className="text-sm text-foreground bg-muted/30 p-3 rounded-xl">{appointment.reason}</p>
                    </div>

                    {/* Reminders */}
                    {appointment.reminders.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Bell className="w-4 h-4 text-amber-500" />
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reminders</p>
                            </div>
                            <ul className="space-y-2">
                                {appointment.reminders.map((r, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-foreground bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Fee */}
                    <div className="flex items-center justify-between p-3 bg-linear-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
                        <span className="text-sm text-muted-foreground">Consultation Fee</span>
                        <span className="font-bold text-foreground">{appointment.fee} EGP</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

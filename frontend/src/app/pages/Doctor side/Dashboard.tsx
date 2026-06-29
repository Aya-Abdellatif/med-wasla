import { useState, useEffect, useCallback, useRef } from "react";
import { Calendar, Users, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import {
  fetchSpecialistAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} from "../../../services/appointmentsApi";
import { showError, showSuccess, getToastUserContext } from "../../../utils/toast";
import { VerificationStatusNotice } from "../../components/common/VerificationStatusNotice";
import type { Appointment, DashboardTab, HomeServiceRequest } from "./dashboard/dashboardTypes";
import {
  countUniquePatients,
  DASHBOARD_THEME,
  getDateStrWithOffset,
  getFormattedToday,
  offersHomeService,
} from "./dashboard/dashboardUtils";
import { DashboardTabs } from "./dashboard/DashboardTabs";
import { OverviewTab } from "./dashboard/OverviewTab";
import { ScheduleTab } from "./dashboard/ScheduleTab";
import { RequestsTab } from "./dashboard/RequestsTab";

function isSpecialistRole(role?: string) {
  return role === "doctor" || role === "nurse";
}

export function Dashboard() {
  const { user, refreshSpecialistProfile } = useAuth();
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(() => getDateStrWithOffset(0));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string | null>(null);
  const [homeServiceRequests, setHomeServiceRequests] = useState<HomeServiceRequest[]>([]);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);

  const loadAppointments = useCallback(async (silent = false) => {
    const currentUser = userRef.current;
    if (!isSpecialistRole(currentUser?.role)) {
      setAppointments([]);
      setHomeServiceRequests([]);
      if (!silent) setLoadingAppointments(false);
      return;
    }

    if (!silent) setLoadingAppointments(true);

    try {
      const { appointments: nextAppointments, homeServiceRequests: nextHomeRequests } =
        await fetchSpecialistAppointments();

      setAppointments(nextAppointments);
      setHomeServiceRequests(nextHomeRequests);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to load appointments",
        getToastUserContext(currentUser),
      );
    } finally {
      if (!silent) setLoadingAppointments(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id || !isSpecialistRole(user.role)) return;

    let cancelled = false;

    void (async () => {
      setLoadingAppointments(true);

      try {
        await refreshSpecialistProfile();
        if (cancelled) return;

        const { appointments: nextAppointments, homeServiceRequests: nextHomeRequests } =
          await fetchSpecialistAppointments();
        if (cancelled) return;

        setAppointments(nextAppointments);
        setHomeServiceRequests(nextHomeRequests);
      } catch (err) {
        if (cancelled) return;
        showError(
          err instanceof Error ? err.message : "Failed to load appointments",
          getToastUserContext(userRef.current),
        );
      } finally {
        if (!cancelled) setLoadingAppointments(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role, refreshSpecialistProfile]);

  const runWithRefresh = async (
    action: () => Promise<unknown>,
    successMessage: string,
    errorMessage: string,
  ) => {
    try {
      await action();
      await loadAppointments(true);
      showSuccess(successMessage, getToastUserContext(user));
    } catch (err) {
      showError(err instanceof Error ? err.message : errorMessage, getToastUserContext(user));
    }
  };

  const handleRequestAction = async (requestId: string, action: "accepted" | "rejected") => {
    setUpdatingRequestId(requestId);
    try {
      await runWithRefresh(
        async () => {
          if (action === "accepted") {
            await updateAppointmentStatus(requestId, "confirmed");
          } else {
            await cancelAppointment(requestId);
          }
        },
        action === "accepted" ? "Home visit accepted!" : "Home visit declined.",
        "Failed to update home visit request",
      );
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setUpdatingAppointmentId(appointmentId);
    try {
      await runWithRefresh(
        () => cancelAppointment(appointmentId),
        "Appointment cancelled.",
        "Failed to cancel appointment",
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const handleCancelAllPending = async () => {
    const clinicPending = appointments.filter(
      (a) => a.backendStatus === "pending" && a.visitType === "clinic",
    );
    if (clinicPending.length === 0) return;

    setUpdatingAppointmentId("bulk");
    try {
      await runWithRefresh(
        () => Promise.all(clinicPending.map((a) => cancelAppointment(a.id))),
        `${clinicPending.length} appointment(s) cancelled.`,
        "Failed to cancel appointments",
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    setUpdatingAppointmentId(appointmentId);
    try {
      await runWithRefresh(
        () => updateAppointmentStatus(appointmentId, "confirmed"),
        "Appointment confirmed.",
        "Failed to confirm appointment",
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    setUpdatingAppointmentId(appointmentId);
    try {
      await runWithRefresh(
        () => updateAppointmentStatus(appointmentId, "completed"),
        "Appointment marked as completed.",
        "Failed to complete appointment",
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const todayStr = getDateStrWithOffset(0);
  const pendingAppointments = appointments.filter((a) => a.backendStatus === "pending");
  const overdueAppointments = appointments.filter((a) => a.backendStatus === "overdue");
  const showHomeServiceTab = offersHomeService(user);
  const pendingHomeRequests = homeServiceRequests.filter((r) => r.backendStatus === "pending");
  const visibleTab = activeTab === "requests" && !showHomeServiceTab ? "overview" : activeTab;

  const stats = [
    {
      label: "Today's Appointments",
      value: appointments.filter((a) => a.date === todayStr && a.status === "scheduled").length,
      icon: Calendar,
      iconColor: DASHBOARD_THEME.primary,
      bgColor: DASHBOARD_THEME.primaryLight,
    },
    {
      label: "Completed Today",
      value: appointments.filter((a) => a.date === todayStr && a.status === "completed").length,
      icon: CheckCircle,
      iconColor: DASHBOARD_THEME.success,
      bgColor: DASHBOARD_THEME.successLight,
    },
    {
      label: "Total Patients",
      value: countUniquePatients(appointments),
      icon: Users,
      iconColor: DASHBOARD_THEME.accent,
      bgColor: DASHBOARD_THEME.accentLight,
    },
    {
      label: "Pending Requests",
      value: pendingAppointments.length,
      icon: AlertCircle,
      iconColor: DASHBOARD_THEME.warning,
      bgColor: DASHBOARD_THEME.warningLight,
    },
  ];

  const todayUpcoming = appointments.filter((a) => a.date === todayStr && a.status === "scheduled");
  const filteredUpcoming = appointments.filter(
    (a) => a.date === selectedScheduleDate && a.status === "scheduled",
  );
  const filteredCompleted = appointments.filter(
    (a) => a.date === selectedScheduleDate && a.status === "completed",
  );

  const tabProps = {
    offersHomeService: showHomeServiceTab,
    onConfirm: handleConfirmAppointment,
    onCancel: handleCancelAppointment,
    onCancelAllPending: handleCancelAllPending,
    onComplete: handleCompleteAppointment,
    onGoToHomeService: () => setActiveTab("requests"),
    updatingAppointmentId,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {isSpecialistRole(user?.role) && user?.verificationStatus && (
        <VerificationStatusNotice status={user.verificationStatus} />
      )}

      <DashboardTabs
        activeTab={visibleTab}
        onTabChange={setActiveTab}
        formattedDate={getFormattedToday()}
        showRequestsTab={showHomeServiceTab}
        pendingRequestsCount={pendingHomeRequests.length}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={visibleTab === "overview" ? undefined : "hidden"}>
          <OverviewTab
            stats={stats}
            pendingAppointments={pendingAppointments}
            todayUpcoming={todayUpcoming}
            onViewAllSchedule={() => {
              setSelectedScheduleDate(todayStr);
              setActiveTab("schedule");
            }}
            loading={loadingAppointments}
            {...tabProps}
          />
        </div>

        <div className={visibleTab === "schedule" ? undefined : "hidden"}>
          <ScheduleTab
            selectedDate={selectedScheduleDate}
            onSelectedDateChange={setSelectedScheduleDate}
            filteredUpcoming={filteredUpcoming}
            filteredCompleted={filteredCompleted}
            pendingAppointments={pendingAppointments}
            overdueAppointments={overdueAppointments}
            {...tabProps}
          />
        </div>

        {showHomeServiceTab && (
          <div className={visibleTab === "requests" ? undefined : "hidden"}>
            <RequestsTab
              requests={homeServiceRequests}
              loading={loadingAppointments}
              updatingRequestId={updatingRequestId}
              onRequestAction={handleRequestAction}
            />
          </div>
        )}
      </div>
    </div>
  );
}

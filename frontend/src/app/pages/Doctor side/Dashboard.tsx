import { useState, useEffect, useCallback } from "react";
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

export function Dashboard() {
  const { user, refreshSpecialistProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(() => getDateStrWithOffset(0));

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string | null>(null);
  const [homeServiceRequests, setHomeServiceRequests] = useState<HomeServiceRequest[]>([]);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);

  const loadAppointments = useCallback(
    async (silent = false) => {
      if (user?.role !== "doctor" && user?.role !== "nurse") {
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
          getToastUserContext(user),
        );
      } finally {
        if (!silent) setLoadingAppointments(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (user?.role !== "doctor" && user?.role !== "nurse") {
      return;
    }

    refreshSpecialistProfile();

    const timer = window.setTimeout(() => {
      void loadAppointments();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [user?.id, user?.role, refreshSpecialistProfile, loadAppointments]);

  const todayStr = getDateStrWithOffset(0);

  const handleRequestAction = async (requestId: string, action: "accepted" | "rejected") => {
    setUpdatingRequestId(requestId);

    try {
      if (action === "accepted") {
        await updateAppointmentStatus(requestId, "confirmed");
        showSuccess("Home visit accepted!", getToastUserContext(user));
      } else {
        await cancelAppointment(requestId);
        showSuccess("Home visit declined.", getToastUserContext(user));
      }

      await loadAppointments(true);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to update home visit request",
        getToastUserContext(user),
      );
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setUpdatingAppointmentId(appointmentId);

    try {
      await cancelAppointment(appointmentId);
      await loadAppointments(true);
      showSuccess("Appointment cancelled.", getToastUserContext(user));
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to cancel appointment",
        getToastUserContext(user),
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
      await Promise.all(clinicPending.map((a) => cancelAppointment(a.id)));
      await loadAppointments(true);
      showSuccess(`${clinicPending.length} appointment(s) cancelled.`, getToastUserContext(user));
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to cancel appointments",
        getToastUserContext(user),
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const openHomeServiceTab = () => {
    setActiveTab("requests");
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    setUpdatingAppointmentId(appointmentId);

    try {
      await updateAppointmentStatus(appointmentId, "confirmed");
      await loadAppointments(true);
      showSuccess("Appointment confirmed.", getToastUserContext(user));
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to confirm appointment",
        getToastUserContext(user),
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    setUpdatingAppointmentId(appointmentId);

    try {
      await updateAppointmentStatus(appointmentId, "completed");
      await loadAppointments(true);
      showSuccess("Appointment marked as completed.", getToastUserContext(user));
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to complete appointment",
        getToastUserContext(user),
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const pendingAppointments = appointments.filter((a) => a.backendStatus === "pending");
  const overdueAppointments = appointments.filter((a) => a.backendStatus === "overdue");
  const showHomeServiceTab = offersHomeService(user);
  const pendingHomeRequests = homeServiceRequests.filter(
    (request) => request.backendStatus === "pending",
  );

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

  const todayUpcoming = appointments.filter(
    (a) => a.date === todayStr && a.status === "scheduled",
  );

  const filteredUpcoming = appointments.filter(
    (a) => a.date === selectedScheduleDate && a.status === "scheduled",
  );

  const filteredCompleted = appointments.filter(
    (a) => a.date === selectedScheduleDate && a.status === "completed",
  );

  const openScheduleTab = () => {
    setSelectedScheduleDate(todayStr);
    setActiveTab("schedule");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {(user?.role === "doctor" || user?.role === "nurse") && user.verificationStatus && (
        <VerificationStatusNotice status={user.verificationStatus} />
      )}

      <DashboardTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        formattedDate={getFormattedToday()}
        showRequestsTab={showHomeServiceTab}
        pendingRequestsCount={pendingHomeRequests.length}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <OverviewTab
            stats={stats}
            pendingAppointments={pendingAppointments}
            todayUpcoming={todayUpcoming}
            offersHomeService={showHomeServiceTab}
            onViewAllSchedule={openScheduleTab}
            onConfirm={handleConfirmAppointment}
            onCancel={handleCancelAppointment}
            onCancelAllPending={handleCancelAllPending}
            onComplete={handleCompleteAppointment}
            onGoToHomeService={openHomeServiceTab}
            updatingAppointmentId={updatingAppointmentId}
            loading={loadingAppointments}
          />
        )}

        {activeTab === "schedule" && (
          <ScheduleTab
            selectedDate={selectedScheduleDate}
            onSelectedDateChange={setSelectedScheduleDate}
            filteredUpcoming={filteredUpcoming}
            filteredCompleted={filteredCompleted}
            pendingAppointments={pendingAppointments}
            overdueAppointments={overdueAppointments}
            offersHomeService={showHomeServiceTab}
            onConfirm={handleConfirmAppointment}
            onCancel={handleCancelAppointment}
            onCancelAllPending={handleCancelAllPending}
            onComplete={handleCompleteAppointment}
            onGoToHomeService={openHomeServiceTab}
            updatingAppointmentId={updatingAppointmentId}
          />
        )}

        {activeTab === "requests" && showHomeServiceTab && (
          <RequestsTab
            requests={homeServiceRequests}
            loading={loadingAppointments}
            updatingRequestId={updatingRequestId}
            onRequestAction={handleRequestAction}
          />
        )}
      </div>
    </div>
  );
}

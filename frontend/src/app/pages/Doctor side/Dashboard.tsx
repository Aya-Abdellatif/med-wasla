import { useState, useEffect, useCallback, useRef } from "react";
import { Calendar, Users, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth";
import {
  fetchSpecialistAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  cancelDayAppointments,
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
  const { t, i18n } = useTranslation("dashboard");
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
        err instanceof Error ? err.message : t("toast.loadFailed"),
        getToastUserContext(currentUser),
      );
    } finally {
      if (!silent) setLoadingAppointments(false);
    }
  }, [t]);

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
          err instanceof Error ? err.message : t("toast.loadFailed"),
          getToastUserContext(userRef.current),
        );
      } finally {
        if (!cancelled) setLoadingAppointments(false);
      }
    })();

    const interval = setInterval(() => {
      if (!cancelled) void loadAppointments(true);
    }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user?.id, user?.role, refreshSpecialistProfile, loadAppointments, t]);

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
        action === "accepted" ? t("toast.homeVisitAccepted") : t("toast.homeVisitDeclined"),
        t("toast.requestUpdateFailed"),
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
        t("toast.appointmentCancelled"),
        t("toast.cancelAppointmentFailed"),
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const handleCancelAllPending = async () => {
    const pendingHome = appointments.filter(
      (a) => a.backendStatus === "pending" && a.visitType === "home",
    );
    if (pendingHome.length === 0) return;

    setUpdatingAppointmentId("bulk-home");
    try {
      await runWithRefresh(
        () => Promise.all(pendingHome.map((a) => cancelAppointment(a.id))),
        t("toast.homeVisitsCancelled", { count: pendingHome.length }),
        t("toast.bulkCancelFailed"),
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const handleCancelAllUpcoming = async (date: string) => {
    setUpdatingAppointmentId("bulk-upcoming");
    try {
      await runWithRefresh(
        () => cancelDayAppointments(date),
        t("toast.allCancelled"),
        t("toast.bulkCancelFailed"),
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
        t("toast.markedComplete"),
        t("toast.completeFailed"),
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const handleNoShowAppointment = async (appointmentId: string) => {
    setUpdatingAppointmentId(appointmentId);
    try {
      await runWithRefresh(
        () => updateAppointmentStatus(appointmentId, "no_show"),
        t("toast.markedNoShow"),
        t("toast.noShowFailed"),
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const todayStr = getDateStrWithOffset(0);
  const pendingHomeAppointments = appointments.filter(
    (a) => a.backendStatus === "pending" && a.visitType === "home",
  );
  const overdueHomeAppointments = appointments.filter(
    (a) => a.backendStatus === "overdue" && a.visitType === "home",
  );
  const showHomeServiceTab = offersHomeService(user);
  const pendingHomeRequests = homeServiceRequests.filter((r) => r.backendStatus === "pending");
  const visibleTab = activeTab === "requests" && !showHomeServiceTab ? "overview" : activeTab;

  const stats = [
    {
      label: t("stats.todaysAppointments"),
      value: appointments.filter((a) => a.date === todayStr && a.status === "scheduled").length,
      icon: Calendar,
      iconColor: DASHBOARD_THEME.primary,
      bgColor: DASHBOARD_THEME.primaryLight,
    },
    {
      label: t("stats.completedToday"),
      value: appointments.filter((a) => a.date === todayStr && a.status === "completed").length,
      icon: CheckCircle,
      iconColor: DASHBOARD_THEME.success,
      bgColor: DASHBOARD_THEME.successLight,
    },
    {
      label: t("stats.totalPatients"),
      value: countUniquePatients(appointments),
      icon: Users,
      iconColor: DASHBOARD_THEME.accent,
      bgColor: DASHBOARD_THEME.accentLight,
    },
    ...(showHomeServiceTab
      ? [
          {
            label: t("stats.pendingRequests"),
            value: pendingHomeRequests.length,
            icon: AlertCircle,
            iconColor: DASHBOARD_THEME.warning,
            bgColor: DASHBOARD_THEME.warningLight,
          },
        ]
      : []),
  ];

  const todayUpcoming = appointments.filter((a) => a.date === todayStr && a.status === "scheduled");
  const filteredUpcoming = appointments.filter(
    (a) => a.date === selectedScheduleDate && a.status === "scheduled",
  );
  const filteredCompleted = appointments.filter(
    (a) => a.date === selectedScheduleDate && a.status === "completed",
  );
  const filteredNoShow = appointments.filter(
    (a) => a.date === selectedScheduleDate && a.status === "no_show",
  );

  const tabProps = {
    offersHomeService: showHomeServiceTab,
    onCancel: handleCancelAppointment,
    onCancelAllPending: handleCancelAllPending,
    onCancelAllUpcoming: handleCancelAllUpcoming,
    onComplete: handleCompleteAppointment,
    onNoShow: handleNoShowAppointment,
    onGoToHomeService: () => setActiveTab("requests"),
    updatingAppointmentId,
    selectedScheduleDate,
    todayStr,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {isSpecialistRole(user?.role) && user?.verificationStatus && (
        <VerificationStatusNotice status={user.verificationStatus} />
      )}

      <DashboardTabs
        activeTab={visibleTab}
        onTabChange={setActiveTab}
        formattedDate={getFormattedToday(i18n.language)}
        showRequestsTab={showHomeServiceTab}
        pendingRequestsCount={pendingHomeRequests.length}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={visibleTab === "overview" ? undefined : "hidden"}>
          <OverviewTab
            stats={stats}
            pendingAppointments={pendingHomeAppointments}
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
            pendingAppointments={pendingHomeAppointments}
            filteredNoShow={filteredNoShow}
            overdueAppointments={overdueHomeAppointments}
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
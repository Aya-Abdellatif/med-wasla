import { useState, useEffect, useCallback } from "react";

import { Calendar, Users, CheckCircle, AlertCircle } from "lucide-react";

import { useAuth } from "../../context/useAuth";

import {
  fetchSpecialistAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} from "../../../services/appointmentsApi";

import { showError, showSuccess } from "../../../utils/toast";

import { VerificationStatusNotice } from "../../components/common/VerificationStatusNotice";

import type {

  Appointment,

  DashboardTab,

  HomeServiceRequest,

} from "./dashboard/dashboardTypes";

import {

  countUniquePatients,

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



  const loadAppointments = useCallback(async (silent = false) => {

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

      showError(err instanceof Error ? err.message : "Failed to load appointments", {

        userName: user?.name,

      });

    } finally {

      if (!silent) setLoadingAppointments(false);

    }

  }, [user?.role, user?.name]);



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
        showSuccess("Home visit accepted!", { userName: user?.name });
      } else {
        await cancelAppointment(requestId);
        showSuccess("Home visit declined.", { userName: user?.name });
      }

      await loadAppointments(true);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update home visit request", {
        userName: user?.name,
      });
    } finally {
      setUpdatingRequestId(null);
    }
  };



  const handleConfirmAppointment = async (appointmentId: string) => {

    setUpdatingAppointmentId(appointmentId);

    try {

      await updateAppointmentStatus(appointmentId, "confirmed");

      await loadAppointments(true);

      showSuccess("Appointment confirmed.", { userName: user?.name });

    } catch (err) {

      showError(err instanceof Error ? err.message : "Failed to confirm appointment", {

        userName: user?.name,

      });

    } finally {

      setUpdatingAppointmentId(null);

    }

  };



  const handleCompleteAppointment = async (appointmentId: string) => {

    setUpdatingAppointmentId(appointmentId);

    try {

      await updateAppointmentStatus(appointmentId, "completed");

      await loadAppointments(true);

      showSuccess("Appointment marked as completed.", { userName: user?.name });

    } catch (err) {

      showError(err instanceof Error ? err.message : "Failed to complete appointment", {

        userName: user?.name,

      });

    } finally {

      setUpdatingAppointmentId(null);

    }

  };



  const pendingAppointments = appointments.filter((a) => a.backendStatus === "pending");

  const overdueAppointments = appointments.filter((a) => a.backendStatus === "overdue");

  const showHomeServiceTab = offersHomeService(user);

  const pendingHomeRequests = homeServiceRequests.filter(
    (request) => request.backendStatus === "pending" || request.backendStatus === "overdue",
  );



  const stats = [

    {

      label: "Today's Appointments",

      value: appointments.filter((a) => a.date === todayStr && a.status === "scheduled").length,

      icon: Calendar,

      iconColor: "#2563eb",

      bgColor: "#eff6ff",

    },

    {

      label: "Completed Today",

      value: appointments.filter((a) => a.date === todayStr && a.status === "completed").length,

      icon: CheckCircle,

      iconColor: "#16a34a",

      bgColor: "#f0fdf4",

    },

    {

      label: "Total Patients",

      value: countUniquePatients(appointments),

      icon: Users,

      iconColor: "#7c3aed",

      bgColor: "#f5f3ff",

    },

    {

      label: "Pending Requests",

      value: pendingAppointments.length,

      icon: AlertCircle,

      iconColor: "#d97706",

      bgColor: "#fffbeb",

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

            onViewAllSchedule={openScheduleTab}

            onConfirm={handleConfirmAppointment}

            onComplete={handleCompleteAppointment}

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

            onConfirm={handleConfirmAppointment}

            onComplete={handleCompleteAppointment}

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



import type { DashboardTab } from "./dashboardTypes";

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  formattedDate: string;
  showRequestsTab: boolean;
  pendingRequestsCount: number;
}

export function DashboardTabs({
  activeTab,
  onTabChange,
  formattedDate,
  showRequestsTab,
  pendingRequestsCount,
}: DashboardTabsProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex space-x-8">
          {(["overview", "schedule"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`py-4 border-b-2 transition-colors capitalize text-sm font-medium hover:text-teal-600 ${
                activeTab === tab
                  ? "border-teal-500 text-teal-500"
                  : "border-transparent text-gray-500"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          {showRequestsTab && (
            <button
              onClick={() => onTabChange("requests")}
              className={`py-4 border-b-2 transition-colors relative text-sm font-medium hover:text-teal-600 ${
                activeTab === "requests"
                  ? "border-teal-500 text-teal-500"
                  : "border-transparent text-gray-500"
              }`}
            >
              Home Service Requests
              {pendingRequestsCount > 0 && (
                <span
                  className="absolute -top-1 -right-2 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#ef4444" }}
                >
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 py-4">{formattedDate}</p>
      </div>
    </div>
  );
}

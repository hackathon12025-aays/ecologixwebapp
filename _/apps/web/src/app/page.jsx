import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import EcologixSidebar from "../components/EcologixSidebar";
import {
  Leaf,
  TrendingDown,
  Truck,
  Award,
  Package,
  BarChart3,
} from "lucide-react";

function StatCard({ title, value, subtitle, icon: Icon, gradient, iconColor }) {
  return (
    <div
      className={`${gradient} rounded-xl p-6 border border-gray-100 dark:border-gray-700`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon size={24} className={iconColor} />
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {title}
        </span>
      </div>
      <p className="text-3xl font-bold text-[#111827] dark:text-[#DEDEDE] mb-1">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
    </div>
  );
}

function VehicleBreakdown({ data }) {
  const vehicleColors = {
    bike: { bg: "bg-[#10B981]", text: "text-[#10B981]" },
    ev: { bg: "bg-[#3B82F6]", text: "text-[#3B82F6]" },
    van: { bg: "bg-[#F59E0B]", text: "text-[#F59E0B]" },
    truck: { bg: "bg-[#EF4444]", text: "text-[#EF4444]" },
  };

  const total =
    data?.reduce((sum, item) => sum + parseInt(item.delivery_count), 0) || 1;

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] mb-6">
        Emissions by Vehicle Type
      </h3>
      <div className="space-y-4">
        {data?.map((item) => {
          const percentage = (parseInt(item.delivery_count) / total) * 100;
          const colors =
            vehicleColors[item.vehicle_type] || vehicleColors.truck;

          return (
            <div key={item.vehicle_type}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-sm font-medium uppercase ${colors.text}`}
                  >
                    {item.vehicle_type}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({item.delivery_count} deliveries)
                  </span>
                </div>
                <span className="text-sm font-semibold text-[#111827] dark:text-[#DEDEDE]">
                  {parseFloat(item.total_emissions).toFixed(2)} kg
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`${colors.bg} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats?days=30");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 10000, // Real-time updates every 10 seconds
  });

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-[#121212]">
        <EcologixSidebar activePage="dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
        </div>
      </div>
    );
  }

  const totalEmissions = stats?.overview?.total_emissions
    ? parseFloat(stats.overview.total_emissions).toFixed(2)
    : "0.00";
  const totalDeliveries = stats?.overview?.total_deliveries || 0;
  const avgEmissions = stats?.overview?.avg_emissions_per_delivery
    ? parseFloat(stats.overview.avg_emissions_per_delivery).toFixed(3)
    : "0.000";
  const carbonSaved = stats?.carbon_savings?.carbon_saved
    ? parseFloat(stats.carbon_savings.carbon_saved).toFixed(2)
    : "0.00";

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#121212]">
      <div className="hidden lg:block">
        <EcologixSidebar activePage="dashboard" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] dark:text-[#DEDEDE] font-inter mb-2">
              Ecologix Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and reduce your carbon footprint from deliveries
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total CO₂ Emissions"
              value={`${totalEmissions} kg`}
              subtitle="Last 30 days"
              icon={Leaf}
              gradient="bg-gradient-to-br from-[#E4F6E8] to-[#D1FAE5] dark:from-[#1B4332] dark:to-[#22543D]"
              iconColor="text-[#10B981] dark:text-[#34D399]"
            />
            <StatCard
              title="Total Deliveries"
              value={totalDeliveries}
              subtitle="Across all vehicles"
              icon={Package}
              gradient="bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] dark:from-[#1E3A5F] dark:to-[#1E40AF]"
              iconColor="text-[#3B82F6] dark:text-[#60A5FA]"
            />
            <StatCard
              title="Avg per Delivery"
              value={`${avgEmissions} kg`}
              subtitle="Carbon footprint"
              icon={BarChart3}
              gradient="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] dark:from-[#3D2914] dark:to-[#78350F]"
              iconColor="text-[#F59E0B] dark:text-[#FBBF24]"
            />
            <StatCard
              title="Carbon Saved"
              value={`${carbonSaved} kg`}
              subtitle="vs. all-truck fleet"
              icon={TrendingDown}
              gradient="bg-gradient-to-br from-[#E0E7FF] to-[#C7D2FE] dark:from-[#1E1B4B] dark:to-[#312E81]"
              iconColor="text-[#6366F1] dark:text-[#818CF8]"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <VehicleBreakdown data={stats?.by_vehicle_type} />

            <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] mb-6">
                Delivery Status
              </h3>
              <div className="space-y-4">
                {stats?.by_status?.map((item) => {
                  const statusColors = {
                    delivered: "bg-[#10B981] text-[#10B981]",
                    in_transit: "bg-[#3B82F6] text-[#3B82F6]",
                    pending: "bg-[#F59E0B] text-[#F59E0B]",
                    failed: "bg-[#EF4444] text-[#EF4444]",
                  };
                  const colorClass =
                    statusColors[item.status] || statusColors.pending;
                  const bgClass = colorClass.split(" ")[0];
                  const textClass = colorClass.split(" ")[1];

                  return (
                    <div
                      key={item.status}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${bgClass}`}
                        ></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {item.status.replace("_", " ")}
                        </span>
                      </div>
                      <span className={`text-sm font-semibold ${textClass}`}>
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Eco Points Summary */}
          {stats?.eco_points && stats.eco_points.length > 0 && (
            <div className="bg-gradient-to-r from-[#F0FDF4] to-[#ECFDF5] dark:from-[#14532D] dark:to-[#166534] rounded-xl border border-[#10B981]/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] flex items-center">
                  <Award size={20} className="mr-2 text-[#10B981]" />
                  Eco-Points Awarded
                </h3>
                <span className="text-2xl font-bold text-[#10B981] dark:text-[#34D399]">
                  {stats.eco_points.reduce(
                    (sum, item) => sum + parseInt(item.total_points || 0),
                    0,
                  )}{" "}
                  points
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.eco_points.map((item) => (
                  <div
                    key={item.action_type}
                    className="bg-white/50 dark:bg-black/20 rounded-lg p-4"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 capitalize">
                      {item.action_type.replace("_", " ")}
                    </p>
                    <p className="text-xl font-bold text-[#111827] dark:text-[#DEDEDE]">
                      {item.total_points} pts
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {item.action_count} actions
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

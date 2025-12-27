"use client";

import { useQuery } from "@tanstack/react-query";
import EcologixSidebar from "@/components/EcologixSidebar";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingDown, Leaf, Package, Award, Calendar } from "lucide-react";
import { useState } from "react";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState(30);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["analytics-stats", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats?days=${timeRange}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-[#121212]">
        <EcologixSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
        </div>
      </div>
    );
  }

  const trends = stats?.emission_trends || [];
  const byVehicle = stats?.by_vehicle_type || [];
  const byStatus = stats?.by_status || [];
  const carbonSavings = stats?.carbon_savings || {};

  // Format trend data
  const trendData = trends
    .slice(0, 30)
    .reverse()
    .map((t) => ({
      date: new Date(t.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      emissions: parseFloat(t.total_emissions || 0),
      deliveries: parseInt(t.deliveries || 0),
    }));

  // Format vehicle pie chart data
  const vehiclePieData = byVehicle.map((v) => ({
    name: v.vehicle_type.toUpperCase(),
    value: parseFloat(v.total_emissions || 0),
  }));

  // Format status data
  const statusData = byStatus.map((s) => ({
    status: s.status.replace("_", " ").toUpperCase(),
    count: parseInt(s.count),
  }));

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#121212]">
      <EcologixSidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#111827] dark:text-[#DEDEDE] mb-2 font-inter">
                Analytics
              </h1>
              <p className="text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                Detailed emission insights and trends
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Calendar size={18} className="text-[#6B7280]" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                className="px-4 py-2 bg-white dark:bg-[#1E1E1E] border border-[#E5EAF0] dark:border-gray-700 rounded-lg text-sm text-[#111827] dark:text-[#DEDEDE] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <Leaf size={24} className="text-[#10B981]" />
                <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                  Total CO₂
                </span>
              </div>
              <p className="text-3xl font-bold text-[#111827] dark:text-[#DEDEDE]">
                {parseFloat(stats?.overview?.total_emissions || 0).toFixed(2)}{" "}
                kg
              </p>
              <p className="text-sm text-[#9CA3AF] dark:text-[#6B7280] mt-1">
                Across all deliveries
              </p>
            </div>

            <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <Package size={24} className="text-[#3B82F6]" />
                <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                  Deliveries
                </span>
              </div>
              <p className="text-3xl font-bold text-[#111827] dark:text-[#DEDEDE]">
                {stats?.overview?.total_deliveries || 0}
              </p>
              <p className="text-sm text-[#9CA3AF] dark:text-[#6B7280] mt-1">
                Total completed
              </p>
            </div>

            <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingDown size={24} className="text-[#F59E0B]" />
                <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                  Average
                </span>
              </div>
              <p className="text-3xl font-bold text-[#111827] dark:text-[#DEDEDE]">
                {parseFloat(
                  stats?.overview?.avg_emissions_per_delivery || 0,
                ).toFixed(3)}{" "}
                kg
              </p>
              <p className="text-sm text-[#9CA3AF] dark:text-[#6B7280] mt-1">
                Per delivery
              </p>
            </div>

            <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <Award size={24} className="text-[#10B981]" />
                <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                  Savings
                </span>
              </div>
              <p className="text-3xl font-bold text-[#111827] dark:text-[#DEDEDE]">
                {parseFloat(carbonSavings.carbon_saved || 0).toFixed(2)} kg
              </p>
              <p className="text-sm text-[#9CA3AF] dark:text-[#6B7280] mt-1">
                vs. all-truck
              </p>
            </div>
          </div>

          {/* Emission Trends Line Chart */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-6 mb-8">
            <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] mb-6 font-inter">
              Emission Trends Over Time
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E1E1E",
                    border: "none",
                    borderRadius: "8px",
                    color: "#DEDEDE",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="emissions"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="CO₂ Emissions (kg)"
                />
                <Line
                  type="monotone"
                  dataKey="deliveries"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Deliveries"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Vehicle Type Distribution */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] mb-6 font-inter">
                Emissions by Vehicle Type
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={vehiclePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {vehiclePieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E1E1E",
                      border: "none",
                      borderRadius: "8px",
                      color: "#DEDEDE",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Delivery Status */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] mb-6 font-inter">
                Delivery Status Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="status"
                    stroke="#6B7280"
                    style={{ fontSize: "11px" }}
                  />
                  <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E1E1E",
                      border: "none",
                      borderRadius: "8px",
                      color: "#DEDEDE",
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Vehicle Stats */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] mb-6 font-inter">
              Vehicle Performance Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5EAF0] dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                      Vehicle Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                      Deliveries
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                      Total Distance
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                      Total Emissions
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                      Avg Emissions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {byVehicle.map((vehicle, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-[#F4F5F8] dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-[#111827] dark:text-[#DEDEDE] uppercase">
                          {vehicle.vehicle_type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                        {vehicle.delivery_count}
                      </td>
                      <td className="py-4 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                        {parseFloat(vehicle.total_distance || 0).toFixed(1)} km
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-[#111827] dark:text-[#DEDEDE]">
                        {parseFloat(vehicle.total_emissions || 0).toFixed(3)} kg
                      </td>
                      <td className="py-4 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                        {parseFloat(vehicle.avg_emissions || 0).toFixed(3)} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

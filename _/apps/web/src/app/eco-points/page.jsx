"use client";

import { useQuery } from "@tanstack/react-query";
import EcologixSidebar from "@/components/EcologixSidebar";
import { Award, Trophy, Star, Sparkles, Medal, Crown } from "lucide-react";

function RankBadge({ rank }) {
  if (rank === 1) {
    return <Crown size={20} className="text-[#FFD700]" />;
  } else if (rank === 2) {
    return <Medal size={20} className="text-[#C0C0C0]" />;
  } else if (rank === 3) {
    return <Medal size={20} className="text-[#CD7F32]" />;
  }
  return <Star size={16} className="text-[#9CA3AF]" />;
}

function ActivityCard({ activity, index }) {
  const getActionColor = (type) => {
    if (type === "zero_emission")
      return "bg-[#E4F6E8] dark:bg-[#1B4332] text-[#10B981] dark:text-[#34D399]";
    if (type === "ev_delivery")
      return "bg-[#DBEAFE] dark:bg-[#1E3A5F] text-[#3B82F6] dark:text-[#60A5FA]";
    return "bg-[#FEF3C7] dark:bg-[#3D2914] text-[#F59E0B] dark:text-[#FBBF24]";
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E5EAF0] dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${getActionColor(activity.action_type)}`}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827] dark:text-[#DEDEDE]">
              {activity.user_identifier}
            </p>
            <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
              {new Date(activity.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-[#10B981] dark:text-[#34D399]">
            +{activity.points_earned}
          </p>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">points</p>
        </div>
      </div>
      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
        {activity.description}
      </p>
      {activity.shipment_id && (
        <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280] mt-2">
          Shipment: {activity.shipment_id}
        </p>
      )}
    </div>
  );
}

export default function EcoPointsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["eco-points"],
    queryFn: async () => {
      const response = await fetch("/api/eco-points?limit=50");
      if (!response.ok) throw new Error("Failed to fetch eco-points");
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 10000,
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

  const leaderboard = data || [];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#121212]">
      <EcologixSidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8 max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#111827] dark:text-[#DEDEDE] mb-2 font-inter flex items-center">
              <Award size={32} className="mr-3 text-[#10B981]" />
              Eco-Points Leaderboard
            </h1>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              Rewarding sustainable delivery choices
            </p>
          </div>

          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <div className="bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] dark:from-[#374151] dark:to-[#1F2937] rounded-xl p-6 mt-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#C0C0C0] rounded-full flex items-center justify-center">
                    <Medal size={32} className="text-white" />
                  </div>
                </div>
                <p className="text-center text-2xl font-bold text-[#111827] dark:text-[#DEDEDE] mb-1">
                  {leaderboard[1].total_points}
                </p>
                <p className="text-center text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                  points
                </p>
                <p className="text-center text-sm font-semibold text-[#111827] dark:text-[#DEDEDE] truncate">
                  {leaderboard[1].user_identifier}
                </p>
                <p className="text-center text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                  {leaderboard[1].total_actions} actions
                </p>
              </div>

              {/* 1st Place */}
              <div className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] dark:from-[#78350F] dark:to-[#3D2914] rounded-xl p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-[#FFD700] rounded-full flex items-center justify-center shadow-lg">
                    <Crown size={40} className="text-white" />
                  </div>
                </div>
                <p className="text-center text-3xl font-bold text-[#111827] dark:text-[#DEDEDE] mb-1">
                  {leaderboard[0].total_points}
                </p>
                <p className="text-center text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                  points
                </p>
                <p className="text-center text-base font-bold text-[#111827] dark:text-[#DEDEDE] truncate">
                  {leaderboard[0].user_identifier}
                </p>
                <p className="text-center text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                  {leaderboard[0].total_actions} actions
                </p>
              </div>

              {/* 3rd Place */}
              <div className="bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] dark:from-[#374151] dark:to-[#1F2937] rounded-xl p-6 mt-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#CD7F32] rounded-full flex items-center justify-center">
                    <Medal size={32} className="text-white" />
                  </div>
                </div>
                <p className="text-center text-2xl font-bold text-[#111827] dark:text-[#DEDEDE] mb-1">
                  {leaderboard[2].total_points}
                </p>
                <p className="text-center text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                  points
                </p>
                <p className="text-center text-sm font-semibold text-[#111827] dark:text-[#DEDEDE] truncate">
                  {leaderboard[2].user_identifier}
                </p>
                <p className="text-center text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                  {leaderboard[2].total_actions} actions
                </p>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-6 mb-8">
            <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] mb-6 font-inter">
              Complete Rankings
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5EAF0] dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                      User
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                      Points
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                      Actions
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-[#F4F5F8] dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <RankBadge rank={idx + 1} />
                          <span className="text-sm font-medium text-[#111827] dark:text-[#DEDEDE]">
                            #{idx + 1}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-[#111827] dark:text-[#DEDEDE]">
                          {user.user_identifier}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-bold text-[#10B981] dark:text-[#34D399]">
                          {user.total_points} pts
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                        {user.total_actions}
                      </td>
                      <td className="py-4 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                        {new Date(user.last_earned).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* How to Earn Points */}
          <div className="bg-gradient-to-r from-[#F0FDF4] to-[#ECFDF5] dark:from-[#14532D] dark:to-[#166534] rounded-xl border border-[#10B981]/20 p-6">
            <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] mb-4 font-inter">
              How to Earn Eco-Points
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center">
                    <Award size={20} className="text-white" />
                  </div>
                  <span className="text-2xl font-bold text-[#10B981] dark:text-[#34D399]">
                    50 pts
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#111827] dark:text-[#DEDEDE] mb-1">
                  Bike Delivery
                </p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  Zero emissions - Perfect choice!
                </p>
              </div>

              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center">
                    <Award size={20} className="text-white" />
                  </div>
                  <span className="text-2xl font-bold text-[#3B82F6] dark:text-[#60A5FA]">
                    30 pts
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#111827] dark:text-[#DEDEDE] mb-1">
                  EV Delivery
                </p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  Electric vehicles - Great eco choice!
                </p>
              </div>

              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-[#F59E0B] rounded-full flex items-center justify-center">
                    <Award size={20} className="text-white" />
                  </div>
                  <span className="text-2xl font-bold text-[#F59E0B] dark:text-[#FBBF24]">
                    10 pts
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#111827] dark:text-[#DEDEDE] mb-1">
                  Recycling
                </p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  Using recycling centers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import EcologixSidebar from "@/components/EcologixSidebar";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { MapPin, Phone, Clock, Recycle, Navigation } from "lucide-react";
import { useState } from "react";

function RecyclingCard({ center, onViewOnMap }) {
  const materialColors = {
    paper: "bg-[#3B82F6]/10 text-[#3B82F6]",
    plastic: "bg-[#10B981]/10 text-[#10B981]",
    cardboard: "bg-[#F59E0B]/10 text-[#F59E0B]",
    glass: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
    metal: "bg-[#EF4444]/10 text-[#EF4444]",
    electronics: "bg-[#06B6D4]/10 text-[#06B6D4]",
    batteries: "bg-[#EC4899]/10 text-[#EC4899]",
    appliances: "bg-[#14B8A6]/10 text-[#14B8A6]",
    "all materials": "bg-[#10B981]/10 text-[#10B981]",
    "hazardous waste": "bg-[#EF4444]/10 text-[#EF4444]",
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] mb-1">
            {center.name}
          </h3>
          <div className="flex items-center text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-2">
            <MapPin size={14} className="mr-1" />
            {center.city}
          </div>
        </div>
        <button
          onClick={() => onViewOnMap(center)}
          className="px-3 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors"
        >
          <Navigation size={14} />
          <span>View</span>
        </button>
      </div>

      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-4">
        {center.address}
      </p>

      {/* Accepted Materials */}
      <div className="mb-4">
        <p className="text-xs font-medium text-[#9CA3AF] dark:text-[#6B7280] mb-2">
          Accepts:
        </p>
        <div className="flex flex-wrap gap-2">
          {center.types_accepted.map((type, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 rounded-md text-xs font-medium ${materialColors[type] || "bg-gray-100 text-gray-600"}`}
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex items-center justify-between pt-4 border-t border-[#F4F5F8] dark:border-gray-700">
        {center.phone && (
          <div className="flex items-center text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            <Phone size={14} className="mr-2" />
            {center.phone}
          </div>
        )}
        {center.hours && (
          <div className="flex items-center text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            <Clock size={14} className="mr-2" />
            {center.hours}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecyclingPage() {
  const [selectedCenter, setSelectedCenter] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["recycling-centers"],
    queryFn: async () => {
      const response = await fetch("/api/recycling-centers?limit=50");
      if (!response.ok) throw new Error("Failed to fetch recycling centers");
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000,
  });

  const centers = data || [];

  const handleViewOnMap = (center) => {
    setSelectedCenter(center);
  };

  const mapCenter = selectedCenter
    ? {
        lat: parseFloat(selectedCenter.lat),
        lng: parseFloat(selectedCenter.lng),
      }
    : centers.length > 0
      ? { lat: parseFloat(centers[0].lat), lng: parseFloat(centers[0].lng) }
      : { lat: 40.7, lng: -74.0 };

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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#121212]">
      <EcologixSidebar />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Centers List */}
        <div className="w-full lg:w-[480px] overflow-y-auto border-r border-[#E5EAF0] dark:border-gray-700 bg-white dark:bg-[#1E1E1E]">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#111827] dark:text-[#DEDEDE] mb-2 font-inter flex items-center">
                <Recycle size={28} className="mr-3 text-[#10B981]" />
                Recycling Centers
              </h1>
              <p className="text-[#6B7280] dark:text-[#9CA3AF] font-inter text-sm">
                Find nearby centers to recycle your materials
              </p>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-r from-[#F0FDF4] to-[#ECFDF5] dark:from-[#14532D] dark:to-[#166534] rounded-xl border border-[#10B981]/20 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                    Total Centers
                  </p>
                  <p className="text-3xl font-bold text-[#10B981] dark:text-[#34D399]">
                    {centers.length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-[#10B981]/20 rounded-full flex items-center justify-center">
                  <Recycle
                    size={32}
                    className="text-[#10B981] dark:text-[#34D399]"
                  />
                </div>
              </div>
            </div>

            {/* Centers List */}
            <div className="space-y-4">
              {centers.map((center) => (
                <RecyclingCard
                  key={center.center_id}
                  center={center}
                  onViewOnMap={handleViewOnMap}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="flex-1 relative">
          <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <Map
              style={{ width: "100%", height: "100%" }}
              defaultCenter={mapCenter}
              defaultZoom={11}
              gestureHandling="greedy"
              mapId="recycling-centers-map"
            >
              {centers.map((center) => (
                <Marker
                  key={center.center_id}
                  position={{
                    lat: parseFloat(center.lat),
                    lng: parseFloat(center.lng),
                  }}
                  title={center.name}
                  onClick={() => setSelectedCenter(center)}
                />
              ))}
            </Map>
          </APIProvider>

          {/* Selected Center Info Overlay */}
          {selectedCenter && (
            <div className="absolute bottom-6 left-6 right-6 bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-4 shadow-xl">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE]">
                    {selectedCenter.name}
                  </h3>
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                    {selectedCenter.address}, {selectedCenter.city}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCenter(null)}
                  className="text-[#6B7280] hover:text-[#111827] dark:hover:text-[#DEDEDE]"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedCenter.types_accepted.map((type, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded-md text-xs font-medium bg-[#10B981]/10 text-[#10B981]"
                  >
                    {type}
                  </span>
                ))}
              </div>
              {selectedCenter.phone && (
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-2 flex items-center">
                  <Phone size={14} className="mr-2" />
                  {selectedCenter.phone}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

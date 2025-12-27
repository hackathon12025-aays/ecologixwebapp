import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Clock,
  Leaf,
  Award,
  RefreshCw,
  TrendingUp,
  Package,
  AlertCircle,
  Plus,
  Minus,
  Crosshair,
} from "lucide-react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useRef } from "react";

const getVehicleEmoji = (type) => {
  switch (type) {
    case "bike":
      return "🚲";
    case "ev":
      return "⚡";
    case "van":
      return "🚐";
    case "truck":
      return "🚛";
    default:
      return "🚗";
  }
};

function EmissionComparison({ delivery }) {
  const emissionFactors = {
    bike: 0.0,
    ev: 0.05,
    van: 0.18,
    truck: 0.27,
  };

  const distance = parseFloat(delivery.distance_km);
  const comparisons = Object.entries(emissionFactors).map(
    ([vehicle, factor]) => ({
      vehicle,
      emission: distance * factor,
      isCurrent: vehicle === delivery.vehicle_type,
    }),
  );

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-[#111827] dark:text-[#DEDEDE] mb-4 flex items-center">
        <TrendingUp size={16} className="mr-2 text-[#10B981]" />
        Emission Comparison
      </h3>
      <div className="space-y-3">
        {comparisons.map(({ vehicle, emission, isCurrent }) => (
          <div key={vehicle} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getVehicleEmoji(vehicle)}</span>
              <span
                className={`text-sm font-medium ${isCurrent ? "text-[#10B981] dark:text-[#34D399]" : "text-[#6B7280] dark:text-[#9CA3AF]"}`}
              >
                {vehicle.toUpperCase()}
                {isCurrent && <span className="ml-2 text-xs">(Current)</span>}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-sm font-semibold ${isCurrent ? "text-[#111827] dark:text-[#DEDEDE]" : "text-[#6B7280] dark:text-[#9CA3AF]"}`}
              >
                {emission.toFixed(3)} kg
              </span>
              {isCurrent && (
                <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RouteMap({ delivery }) {
  const mapRef = useRef(null);

  const handleZoomIn = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(currentZoom - 1);
    }
  };

  const handleRecenter = () => {
    if (mapRef.current && delivery.origin_lat) {
      const centerLat =
        (parseFloat(delivery.origin_lat) +
          parseFloat(delivery.destination_lat)) /
        2;
      const centerLng =
        (parseFloat(delivery.origin_lng) +
          parseFloat(delivery.destination_lng)) /
        2;
      mapRef.current.setCenter({ lat: centerLat, lng: centerLng });
      mapRef.current.setZoom(10);
    }
  };

  const center = delivery.origin_lat
    ? {
        lat:
          (parseFloat(delivery.origin_lat) +
            parseFloat(delivery.destination_lat)) /
          2,
        lng:
          (parseFloat(delivery.origin_lng) +
            parseFloat(delivery.destination_lng)) /
          2,
      }
    : { lat: 40.7, lng: -74.0 };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden border border-[#E5EAF0] dark:border-gray-700">
        <Map
          ref={mapRef}
          style={{ width: "100%", height: "100%" }}
          defaultCenter={center}
          defaultZoom={10}
          gestureHandling="greedy"
          disableDefaultUI={true}
          mapId="delivery-route-map"
        >
          {delivery.origin_lat && (
            <>
              <Marker
                position={{
                  lat: parseFloat(delivery.origin_lat),
                  lng: parseFloat(delivery.origin_lng),
                }}
                title="Origin"
              />
              <Marker
                position={{
                  lat: parseFloat(delivery.destination_lat),
                  lng: parseFloat(delivery.destination_lng),
                }}
                title="Destination"
              />
            </>
          )}
        </Map>

        {/* Map Controls */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex flex-col space-y-1 sm:space-y-2">
          <div className="flex flex-col space-y-1 sm:space-y-2">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-[#1E1E1E] border border-[#E5EAF0] dark:border-gray-700 rounded-lg shadow-sm flex items-center justify-center hover:bg-[#F6F9FF] dark:hover:bg-gray-700 transition-colors duration-150"
              aria-label="Zoom in"
            >
              <Plus
                size={14}
                className="sm:size-4 text-[#0E1B32] dark:text-[#DEDEDE]"
              />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-[#1E1E1E] border border-[#E5EAF0] dark:border-gray-700 rounded-lg shadow-sm flex items-center justify-center hover:bg-[#F6F9FF] dark:hover:bg-gray-700 transition-colors duration-150"
              aria-label="Zoom out"
            >
              <Minus
                size={14}
                className="sm:size-4 text-[#0E1B32] dark:text-[#DEDEDE]"
              />
            </button>
          </div>
          <button
            onClick={handleRecenter}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-[#1E1E1E] border border-[#E5EAF0] dark:border-gray-700 rounded-full shadow-sm flex items-center justify-center hover:bg-[#F6F9FF] dark:hover:bg-gray-700 transition-colors duration-150"
            aria-label="Re-center map"
          >
            <Crosshair
              size={14}
              className="sm:size-4 text-[#0E1B32] dark:text-[#DEDEDE]"
              strokeWidth={2}
            />
          </button>
        </div>
      </div>
    </APIProvider>
  );
}

export default function DeliveryDetails({
  selectedDelivery,
  setShowDeliveryList,
}) {
  const queryClient = useQueryClient();

  const { data: delivery, isLoading } = useQuery({
    queryKey: ["delivery", selectedDelivery?.delivery_id],
    queryFn: async () => {
      const response = await fetch(
        `/api/deliveries/${selectedDelivery.delivery_id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch delivery");
      const result = await response.json();
      return result.data;
    },
    enabled: !!selectedDelivery,
    refetchInterval: 5000, // Real-time updates
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const response = await fetch(
        `/api/deliveries/${selectedDelivery.delivery_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            delivery_attempts:
              newStatus === "failed"
                ? delivery.delivery_attempts + 1
                : delivery.delivery_attempts,
          }),
        },
      );
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["delivery", selectedDelivery.delivery_id]);
      queryClient.invalidateQueries(["deliveries"]);
    },
  });

  if (!selectedDelivery) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-[#121212]">
        <div className="text-center">
          <Package
            size={48}
            className="mx-auto mb-4 text-gray-400 dark:text-gray-600"
          />
          <p className="text-[#6B7280] dark:text-[#9CA3AF] font-inter">
            Select a delivery to view details
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }

  const currentEmission = delivery.co2_emissions_kg
    ? parseFloat(delivery.co2_emissions_kg)
    : 0;
  const savedVsTruck =
    parseFloat(delivery.distance_km) * 0.27 - currentEmission;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-[#121212]">
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#DEDEDE] font-inter">
              {delivery.shipment_id}
            </h1>
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${delivery.status === "delivered" ? "bg-[#E4F6E8] text-[#157347]" : delivery.status === "failed" ? "bg-[#FDEBF0] text-[#E5383B]" : "bg-[#E0F2FE] text-[#0369A1]"}`}
            >
              {delivery.status.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Order ID: {delivery.order_id}
          </p>
        </div>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-[#E4F6E8] to-[#D1FAE5] dark:from-[#1B4332] dark:to-[#22543D] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Leaf size={20} className="text-[#10B981] dark:text-[#34D399]" />
              <span className="text-xs font-medium text-[#059669] dark:text-[#34D399]">
                CO₂ Emitted
              </span>
            </div>
            <p className="text-2xl font-bold text-[#111827] dark:text-[#DEDEDE]">
              {currentEmission.toFixed(3)} kg
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] dark:from-[#1E3A5F] dark:to-[#1E40AF] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <MapPin
                size={20}
                className="text-[#3B82F6] dark:text-[#60A5FA]"
              />
              <span className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">
                Distance
              </span>
            </div>
            <p className="text-2xl font-bold text-[#111827] dark:text-[#DEDEDE]">
              {parseFloat(delivery.distance_km).toFixed(1)} km
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] dark:from-[#3D2914] dark:to-[#78350F] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Award size={20} className="text-[#F59E0B] dark:text-[#FBBF24]" />
              <span className="text-xs font-medium text-[#D97706] dark:text-[#FBBF24]">
                Saved vs Truck
              </span>
            </div>
            <p className="text-2xl font-bold text-[#111827] dark:text-[#DEDEDE]">
              {savedVsTruck.toFixed(3)} kg
            </p>
          </div>
        </div>

        {/* Map */}
        <div className="mb-6">
          <RouteMap delivery={delivery} />
        </div>

        {/* Delivery Info */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-4 mb-6">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-[#DEDEDE] mb-4">
            Delivery Information
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                Origin
              </p>
              <p className="text-sm font-medium text-[#111827] dark:text-[#DEDEDE]">
                {delivery.origin_city}
              </p>
              <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                {delivery.origin_address}
              </p>
            </div>
            <div className="h-px bg-[#F4F5F8] dark:bg-gray-700"></div>
            <div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                Destination
              </p>
              <p className="text-sm font-medium text-[#111827] dark:text-[#DEDEDE]">
                {delivery.destination_city}
              </p>
              <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                {delivery.destination_address}
              </p>
            </div>
            <div className="h-px bg-[#F4F5F8] dark:bg-gray-700"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                  Vehicle Type
                </p>
                <p className="text-sm font-medium text-[#111827] dark:text-[#DEDEDE] uppercase flex items-center">
                  <span className="mr-2">
                    {getVehicleEmoji(delivery.vehicle_type)}
                  </span>
                  {delivery.vehicle_type}
                </p>
              </div>
              {delivery.delivery_attempts > 1 && (
                <div className="flex items-center space-x-1 text-[#F59E0B] dark:text-[#FBBF24]">
                  <RefreshCw size={14} />
                  <span className="text-xs font-medium">
                    Attempt {delivery.delivery_attempts}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Emission Comparison */}
        <EmissionComparison delivery={delivery} />

        {/* Eco-Points */}
        {delivery.eco_points && delivery.eco_points.length > 0 && (
          <div className="bg-gradient-to-r from-[#F0FDF4] to-[#ECFDF5] dark:from-[#14532D] dark:to-[#166534] rounded-xl border border-[#10B981]/20 p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center">
                  <Award size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827] dark:text-[#DEDEDE]">
                    {delivery.eco_points[0].description}
                  </p>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                    +{delivery.eco_points[0].points_earned} Eco-Points earned
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {delivery.status !== "delivered" && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => updateStatusMutation.mutate("delivered")}
              disabled={updateStatusMutation.isLoading}
              className="flex-1 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
            >
              Mark as Delivered
            </button>
            <button
              onClick={() => updateStatusMutation.mutate("failed")}
              disabled={updateStatusMutation.isLoading}
              className="flex-1 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
            >
              Mark as Failed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  User,
  Phone,
  Package,
  Leaf,
  Zap,
  Bike,
  Truck as TruckIcon,
} from "lucide-react";

const getStatusStyles = (status) => {
  switch (status) {
    case "delivered":
      return "bg-[#E4F6E8] dark:bg-[#1B4332] text-[#157347] dark:text-[#52C41A]";
    case "in_transit":
      return "bg-[#E0F2FE] dark:bg-[#1E3A5F] text-[#0369A1] dark:text-[#7DD3FC]";
    case "pending":
      return "bg-[#F6EED4] dark:bg-[#3D2914] text-[#B88710] dark:text-[#FADB14]";
    case "failed":
      return "bg-[#FDEBF0] dark:bg-[#3A1A1A] text-[#E5383B] dark:text-[#FF7875]";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
  }
};

const getVehicleIcon = (vehicleType) => {
  switch (vehicleType) {
    case "bike":
      return <Bike size={14} className="text-[#10B981]" />;
    case "ev":
      return <Zap size={14} className="text-[#3B82F6]" />;
    case "van":
      return <TruckIcon size={14} className="text-[#F59E0B]" />;
    case "truck":
      return <TruckIcon size={14} className="text-[#EF4444]" />;
    default:
      return null;
  }
};

const getVehicleColor = (vehicleType) => {
  switch (vehicleType) {
    case "bike":
      return "text-[#10B981] dark:text-[#34D399]";
    case "ev":
      return "text-[#3B82F6] dark:text-[#60A5FA]";
    case "van":
      return "text-[#F59E0B] dark:text-[#FBBF24]";
    case "truck":
      return "text-[#EF4444] dark:text-[#F87171]";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

function DeliveryCard({ delivery, isSelected, onSelect, setShowDeliveryList }) {
  const handleMoreClick = (e) => {
    e.stopPropagation();
    console.log("More options for", delivery.shipment_id);
  };

  const handleCallClick = (e) => {
    e.stopPropagation();
    console.log("Call client for", delivery.shipment_id);
  };

  const handleCardClick = () => {
    onSelect(delivery);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setShowDeliveryList(false);
    }
  };

  const emissionValue = delivery.co2_emissions_kg
    ? parseFloat(delivery.co2_emissions_kg).toFixed(3)
    : "0.000";

  return (
    <div
      onClick={handleCardClick}
      className={`
        bg-white dark:bg-[#1E1E1E] rounded-xl border shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-200 p-3 sm:p-4 cursor-pointer
        ${isSelected ? "border-[#10B981] dark:border-[#34D399] ring-2 ring-[#10B981]/20 dark:ring-[#34D399]/20" : "border-[#F1F3F8] dark:border-gray-700 hover:border-[#E1E5E9] dark:hover:border-gray-600"}
      `}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-[#6B7280] dark:text-[#9CA3AF] text-sm font-inter">
            ID:
          </span>
          <span className="text-[#111827] dark:text-[#DEDEDE] text-sm sm:text-[15px] font-semibold font-inter">
            {delivery.shipment_id}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(delivery.status)}`}
          >
            {delivery.status.replace("_", " ")}
          </span>
          <button
            onClick={handleMoreClick}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150 active:scale-95"
            aria-label="More options"
          >
            <MoreVertical
              size={16}
              className="text-[#111827]/80 dark:text-[#DEDEDE]/80 hover:text-[#111827] dark:hover:text-[#DEDEDE]"
            />
          </button>
        </div>
      </div>

      {/* Route section */}
      <div className="mb-4">
        <div className="grid grid-cols-[11px_1fr] sm:grid-cols-[11px_1fr] gap-2 sm:gap-3 mb-2">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 bg-[#10B981] dark:bg-[#34D399] rounded-full"></div>
          </div>
          <div className="min-w-0">
            <div className="text-[#111827] dark:text-[#DEDEDE] text-xs sm:text-sm font-medium font-inter truncate">
              {delivery.origin_city}
            </div>
            <div className="text-[#9CA3AF] dark:text-[#6B7280] text-xs font-inter truncate">
              {delivery.origin_address}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[11px_1fr] sm:grid-cols-[11px_1fr] gap-2 sm:gap-3 mb-2">
          <div className="flex justify-center">
            <div className="w-px h-4 border-l border-dashed border-[#BFC5D2] dark:border-gray-600"></div>
          </div>
          <div></div>
        </div>

        <div className="grid grid-cols-[11px_1fr] sm:grid-cols-[11px_1fr] gap-2 sm:gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 border border-[#9CA3AF] dark:border-gray-500 rounded-full bg-white dark:bg-[#1E1E1E]"></div>
          </div>
          <div className="min-w-0">
            <div className="text-[#111827] dark:text-[#DEDEDE] text-xs sm:text-sm font-medium font-inter truncate">
              {delivery.destination_city}
            </div>
            <div className="text-[#9CA3AF] dark:text-[#6B7280] text-xs font-inter truncate">
              {delivery.destination_address}
            </div>
          </div>
        </div>
      </div>

      {/* Emission and vehicle info */}
      <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center space-x-2">
          {getVehicleIcon(delivery.vehicle_type)}
          <span
            className={`text-xs font-medium uppercase ${getVehicleColor(delivery.vehicle_type)}`}
          >
            {delivery.vehicle_type}
          </span>
          <span className="text-[#9CA3AF] dark:text-[#6B7280] text-xs">
            • {parseFloat(delivery.distance_km).toFixed(1)} km
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Leaf size={12} className="text-[#10B981] dark:text-[#34D399]" />
          <span className="text-xs font-semibold text-[#111827] dark:text-[#DEDEDE]">
            {emissionValue} kg CO₂
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#F4F5F8] dark:bg-gray-700 mb-4"></div>

      {/* Client strip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#E4F6E8] dark:bg-[#1B4332] rounded-full flex items-center justify-center flex-shrink-0">
            <User
              size={14}
              className="sm:size-4 text-[#10B981] dark:text-[#34D399]"
            />
          </div>
          <div className="min-w-0">
            <div className="text-[#111827] dark:text-[#DEDEDE] text-sm font-semibold font-inter truncate">
              {delivery.customer_name}
            </div>
            <div className="text-[#9CA3AF] dark:text-[#6B7280] text-xs font-inter">
              Order: {delivery.order_id}
            </div>
          </div>
        </div>
        <button
          onClick={handleCallClick}
          className="w-9 h-9 sm:w-10 sm:h-10 bg-[#E4F6E8] dark:bg-[#1B4332] hover:bg-[#D1FAE5] dark:hover:bg-[#22543D] rounded-lg flex items-center justify-center transition-colors duration-150 active:scale-95 flex-shrink-0"
          aria-label="Call client"
        >
          <Phone
            size={16}
            className="sm:size-[18px] text-[#10B981] dark:text-[#34D399]"
          />
        </button>
      </div>
    </div>
  );
}

function EmptyDeliveriesState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-[#E4F6E8] dark:bg-[#1B4332] rounded-full flex items-center justify-center mb-4">
        <Package size={32} className="text-[#10B981] dark:text-[#34D399]" />
      </div>
      <h3 className="text-[#111827] dark:text-[#DEDEDE] font-inter font-semibold text-lg mb-2">
        No deliveries yet
      </h3>
      <p className="text-[#6B7280] dark:text-[#9CA3AF] font-inter text-sm text-center mb-6 max-w-sm">
        Start tracking carbon emissions by creating your first delivery.
      </p>
    </div>
  );
}

function EmptySearchState({ searchTerm }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 bg-[#F9FAFB] dark:bg-[#262626] rounded-full flex items-center justify-center mb-4">
        <Search size={24} className="text-[#9CA3AF] dark:text-[#6B7280]" />
      </div>
      <h3 className="text-[#111827] dark:text-[#DEDEDE] font-inter font-semibold text-base mb-2">
        No results found
      </h3>
      <p className="text-[#6B7280] dark:text-[#9CA3AF] font-inter text-sm text-center max-w-sm">
        No deliveries match "{searchTerm}". Try adjusting your search.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#F1F3F8] dark:border-gray-700 p-4 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded-full w-20"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DeliveryList({
  selectedDelivery,
  setSelectedDelivery,
  setShowDeliveryList,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["deliveries", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/deliveries?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch deliveries");
      }
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 5000, // Real-time updates every 5 seconds
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilter = () => {
    console.log("Open filters");
  };

  const filteredDeliveries =
    data?.filter(
      (delivery) =>
        searchTerm === "" ||
        delivery.shipment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.customer_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        delivery.origin_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.destination_city
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    ) || [];

  return (
    <div className="h-full bg-gradient-to-b from-[#FCFDFF] to-[#F0FDF4] dark:from-[#121212] dark:to-[#0F0F0F] overflow-y-auto">
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search
                size={16}
                className="text-[#6B7280] dark:text-[#9CA3AF]"
              />
            </div>
            <input
              type="text"
              placeholder="Search deliveries..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full h-10 sm:h-11 pl-10 pr-4 bg-white dark:bg-[#1E1E1E] border-none rounded-xl shadow-inner shadow-black/[0.03] dark:shadow-none text-sm text-[#111827] dark:text-[#DEDEDE] placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 dark:focus:ring-[#34D399]/20 font-inter"
            />
          </div>

          <button
            onClick={handleFilter}
            className="w-10 h-10 sm:w-11 sm:h-11 bg-white dark:bg-[#1E1E1E] border border-[#E7EAF1] dark:border-gray-700 rounded-xl shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 active:scale-95"
            aria-label="Filter options"
          >
            <SlidersHorizontal
              size={16}
              className="text-[#111827] dark:text-[#DEDEDE]"
            />
          </button>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            Error loading deliveries.{" "}
            <button onClick={() => refetch()} className="underline">
              Try again
            </button>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          searchTerm ? (
            <EmptySearchState searchTerm={searchTerm} />
          ) : (
            <EmptyDeliveriesState />
          )
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredDeliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.delivery_id}
                delivery={delivery}
                isSelected={
                  selectedDelivery?.delivery_id === delivery.delivery_id
                }
                onSelect={setSelectedDelivery}
                setShowDeliveryList={setShowDeliveryList}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

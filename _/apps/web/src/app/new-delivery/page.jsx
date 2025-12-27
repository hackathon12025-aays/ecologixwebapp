"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import EcologixSidebar from "@/components/EcologixSidebar";
import {
  MapPin,
  Truck,
  User,
  Phone,
  Calculator,
  Zap,
  Bike,
  Package,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const VEHICLE_OPTIONS = [
  {
    type: "bike",
    label: "Bike",
    icon: "🚲",
    factor: 0.0,
    color: "bg-[#10B981]",
    points: 50,
    description: "Zero emissions - Best choice!",
  },
  {
    type: "ev",
    label: "Electric Vehicle",
    icon: "⚡",
    factor: 0.05,
    color: "bg-[#3B82F6]",
    points: 30,
    description: "Low emissions - Great choice!",
  },
  {
    type: "van",
    label: "Van",
    icon: "🚐",
    factor: 0.18,
    color: "bg-[#F59E0B]",
    points: 0,
    description: "Moderate emissions",
  },
  {
    type: "truck",
    label: "Truck",
    icon: "🚛",
    factor: 0.27,
    color: "bg-[#EF4444]",
    points: 0,
    description: "Higher emissions",
  },
];

export default function NewDeliveryPage() {
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    order_id: "",
    customer_name: "",
    customer_phone: "",
    origin_address: "",
    destination_address: "",
    vehicle_type: "bike",
  });

  const [routeData, setRouteData] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState("bike");

  // Calculate route mutation
  const calculateRouteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/deliveries/calculate-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_address: formData.origin_address,
          destination_address: formData.destination_address,
          vehicle_type: selectedVehicle,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to calculate route");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setRouteData(data.data);
    },
  });

  // Create delivery mutation
  const createDeliveryMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/deliveries/create-from-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: formData.order_id,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          route_data: routeData.route,
          vehicle_type: selectedVehicle,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create delivery");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["deliveries"]);
      queryClient.invalidateQueries(["dashboard-stats"]);
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          order_id: "",
          customer_name: "",
          customer_phone: "",
          origin_address: "",
          destination_address: "",
          vehicle_type: "bike",
        });
        setRouteData(null);
        setSelectedVehicle("bike");
      }, 2000);
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculateRoute = (e) => {
    e.preventDefault();
    if (!formData.origin_address || !formData.destination_address) {
      return;
    }
    calculateRouteMutation.mutate();
  };

  const handleCreateDelivery = () => {
    if (!formData.order_id || !formData.customer_name || !routeData) {
      return;
    }
    createDeliveryMutation.mutate();
  };

  const selectedVehicleData = VEHICLE_OPTIONS.find(
    (v) => v.type === selectedVehicle,
  );
  const currentAlternative = routeData?.alternatives?.find(
    (a) => a.vehicle_type === selectedVehicle,
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#121212]">
      <EcologixSidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#111827] dark:text-[#DEDEDE] mb-2 font-inter flex items-center">
              <Package size={32} className="mr-3 text-[#10B981]" />
              Create New Delivery
            </h1>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              Automatically calculate routes and emissions using real-time data
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {/* Order Details */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] mb-4 flex items-center">
                  <User size={20} className="mr-2 text-[#10B981]" />
                  Order Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                      Order ID *
                    </label>
                    <input
                      type="text"
                      value={formData.order_id}
                      onChange={(e) =>
                        handleInputChange("order_id", e.target.value)
                      }
                      placeholder="ORD-2024-001"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#121212] border border-[#E5EAF0] dark:border-gray-700 rounded-lg text-[#111827] dark:text-[#DEDEDE] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) =>
                        handleInputChange("customer_name", e.target.value)
                      }
                      placeholder="John Doe"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#121212] border border-[#E5EAF0] dark:border-gray-700 rounded-lg text-[#111827] dark:text-[#DEDEDE] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) =>
                        handleInputChange("customer_phone", e.target.value)
                      }
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#121212] border border-[#E5EAF0] dark:border-gray-700 rounded-lg text-[#111827] dark:text-[#DEDEDE] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Route Details */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] mb-4 flex items-center">
                  <MapPin size={20} className="mr-2 text-[#10B981]" />
                  Route Details
                </h3>
                <form onSubmit={handleCalculateRoute} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                      Pickup Address *
                    </label>
                    <input
                      type="text"
                      value={formData.origin_address}
                      onChange={(e) =>
                        handleInputChange("origin_address", e.target.value)
                      }
                      placeholder="123 Main St, New York, NY 10001"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#121212] border border-[#E5EAF0] dark:border-gray-700 rounded-lg text-[#111827] dark:text-[#DEDEDE] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                      Delivery Address *
                    </label>
                    <input
                      type="text"
                      value={formData.destination_address}
                      onChange={(e) =>
                        handleInputChange("destination_address", e.target.value)
                      }
                      placeholder="456 Park Ave, Brooklyn, NY 11201"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#121212] border border-[#E5EAF0] dark:border-gray-700 rounded-lg text-[#111827] dark:text-[#DEDEDE] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={
                      calculateRouteMutation.isLoading ||
                      !formData.origin_address ||
                      !formData.destination_address
                    }
                    className="w-full py-3 bg-[#10B981] hover:bg-[#059669] disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                  >
                    {calculateRouteMutation.isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Calculating...</span>
                      </>
                    ) : (
                      <>
                        <Calculator size={18} />
                        <span>Calculate Route & Emissions</span>
                      </>
                    )}
                  </button>
                </form>

                {calculateRouteMutation.isError && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2">
                    <AlertCircle
                      size={18}
                      className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {calculateRouteMutation.error?.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Route Results & Vehicle Selection */}
            <div className="space-y-6">
              {routeData ? (
                <>
                  {/* Route Summary */}
                  <div className="bg-gradient-to-br from-[#E4F6E8] to-[#D1FAE5] dark:from-[#1B4332] dark:to-[#22543D] rounded-xl border border-[#10B981]/20 p-6">
                    <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] mb-4">
                      Route Calculated
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                          Distance
                        </span>
                        <span className="text-lg font-bold text-[#111827] dark:text-[#DEDEDE]">
                          {routeData.route.distance_km} km
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                          Duration
                        </span>
                        <span className="text-lg font-bold text-[#111827] dark:text-[#DEDEDE]">
                          {routeData.route.duration_minutes} min
                        </span>
                      </div>
                      <div className="pt-3 border-t border-[#10B981]/20">
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                          From
                        </p>
                        <p className="text-sm font-medium text-[#111827] dark:text-[#DEDEDE] mb-2">
                          {routeData.route.origin.city}
                        </p>
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                          To
                        </p>
                        <p className="text-sm font-medium text-[#111827] dark:text-[#DEDEDE]">
                          {routeData.route.destination.city}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Selection */}
                  <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] mb-4 flex items-center">
                      <Truck size={20} className="mr-2 text-[#10B981]" />
                      Select Vehicle Type
                    </h3>
                    <div className="space-y-3">
                      {VEHICLE_OPTIONS.map((vehicle) => {
                        const alternative = routeData.alternatives.find(
                          (a) => a.vehicle_type === vehicle.type,
                        );
                        const isSelected = selectedVehicle === vehicle.type;

                        return (
                          <button
                            key={vehicle.type}
                            onClick={() => setSelectedVehicle(vehicle.type)}
                            className={`w-full p-4 rounded-lg border-2 transition-all ${
                              isSelected
                                ? "border-[#10B981] bg-[#10B981]/5 dark:bg-[#10B981]/10"
                                : "border-[#E5EAF0] dark:border-gray-700 hover:border-[#10B981]/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{vehicle.icon}</span>
                                <div className="text-left">
                                  <p className="text-sm font-semibold text-[#111827] dark:text-[#DEDEDE]">
                                    {vehicle.label}
                                  </p>
                                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                                    {vehicle.description}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-[#111827] dark:text-[#DEDEDE]">
                                  {alternative?.co2_emissions} kg
                                </p>
                                {vehicle.points > 0 && (
                                  <p className="text-xs font-medium text-[#10B981]">
                                    +{vehicle.points} pts
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Current Selection Summary */}
                  {currentAlternative && (
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-6">
                      <h3 className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-3">
                        Your Selection
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                            CO₂ Emissions
                          </span>
                          <span className="text-lg font-bold text-[#111827] dark:text-[#DEDEDE]">
                            {currentAlternative.co2_emissions} kg
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                            Carbon Saved
                          </span>
                          <span className="text-lg font-bold text-[#10B981] dark:text-[#34D399]">
                            {currentAlternative.carbon_saved} kg
                          </span>
                        </div>
                        {selectedVehicleData?.points > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                              Eco-Points
                            </span>
                            <span className="text-lg font-bold text-[#10B981] dark:text-[#34D399]">
                              +{selectedVehicleData.points}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Create Delivery Button */}
                  <button
                    onClick={handleCreateDelivery}
                    disabled={
                      createDeliveryMutation.isLoading ||
                      !formData.order_id ||
                      !formData.customer_name
                    }
                    className="w-full py-4 bg-[#10B981] hover:bg-[#059669] disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-colors shadow-lg"
                  >
                    {createDeliveryMutation.isLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Creating Delivery...</span>
                      </>
                    ) : createDeliveryMutation.isSuccess ? (
                      <>
                        <CheckCircle2 size={20} />
                        <span>Delivery Created!</span>
                      </>
                    ) : (
                      <>
                        <span>Create Delivery</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>

                  {createDeliveryMutation.isError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2">
                      <AlertCircle
                        size={18}
                        className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {createDeliveryMutation.error?.message}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5EAF0] dark:border-gray-700 p-12 text-center">
                  <Calculator
                    size={48}
                    className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
                  />
                  <p className="text-[#6B7280] dark:text-[#9CA3AF]">
                    Enter addresses and click "Calculate Route" to see emissions
                    and vehicle options
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

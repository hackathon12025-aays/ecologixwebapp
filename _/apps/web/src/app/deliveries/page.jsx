import { useState } from "react";
import EcologixSidebar from "../../components/EcologixSidebar";
import DeliveryList from "../../components/DeliveryList";
import DeliveryDetails from "../../components/DeliveryDetails";
import { ChevronLeft, Menu, X } from "lucide-react";

export default function DeliveriesPage() {
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDeliveryList, setShowDeliveryList] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleBack = () => {
    if (!showDeliveryList && selectedDelivery) {
      setShowDeliveryList(true);
      return;
    }
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#121212]">
      {/* Sidebar - Hidden on mobile/tablet, visible on desktop */}
      <div className="hidden lg:block">
        <EcologixSidebar activePage="deliveries" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Page Header */}
        <div className="h-20 bg-gray-50 dark:bg-[#121212] flex items-center justify-between px-4 sm:px-6 py-6 relative z-10 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <X
                  size={16}
                  className="text-[#020814] dark:text-[#DEDEDE]"
                  strokeWidth={2}
                />
              ) : (
                <Menu
                  size={16}
                  className="text-[#020814] dark:text-[#DEDEDE]"
                  strokeWidth={2}
                />
              )}
            </button>

            <button
              onClick={handleBack}
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-150"
              aria-label="Go back"
            >
              <ChevronLeft
                size={16}
                className="text-[#020814] dark:text-[#DEDEDE]"
                strokeWidth={2}
              />
              <h1 className="text-[#020814] dark:text-[#DEDEDE] font-inter font-semibold text-lg sm:text-xl">
                {!showDeliveryList && selectedDelivery
                  ? selectedDelivery.shipment_id
                  : "Deliveries"}
              </h1>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 flex relative">
          {/* Delivery List */}
          <div
            className={`
              ${showDeliveryList || !selectedDelivery ? "block" : "hidden lg:block"}
              w-full lg:w-96 
              ${selectedDelivery ? "lg:border-r lg:border-gray-200 lg:dark:border-gray-700" : ""}
              transition-all duration-300 ease-in-out
            `}
          >
            <DeliveryList
              selectedDelivery={selectedDelivery}
              setSelectedDelivery={setSelectedDelivery}
              setShowDeliveryList={setShowDeliveryList}
            />
          </div>

          {/* Delivery Details */}
          <div
            className={`
              ${!showDeliveryList && selectedDelivery ? "block" : "hidden lg:block"}
              flex-1 min-w-0
              transition-all duration-300 ease-in-out
            `}
          >
            <DeliveryDetails
              selectedDelivery={selectedDelivery}
              setShowDeliveryList={setShowDeliveryList}
            />
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70"
            onClick={() => setShowMobileMenu(false)}
          >
            <div
              className="bg-white dark:bg-[#1E1E1E] w-64 h-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-inter font-semibold text-[#020814] dark:text-[#DEDEDE]">
                  Menu
                </h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={16} className="text-[#020814] dark:text-[#DEDEDE]" />
                </button>
              </div>

              <div className="p-4 space-y-2">
                <button
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-[#020814] dark:text-[#DEDEDE] font-inter"
                >
                  Dashboard
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md bg-[#10B9811A] dark:bg-[#34D399]/20 text-[#10B981] dark:text-[#34D399] font-inter font-medium">
                  Deliveries
                </button>
                <button
                  onClick={() => {
                    window.location.href = "/analytics";
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-[#020814] dark:text-[#DEDEDE] font-inter"
                >
                  Analytics
                </button>
                <button
                  onClick={() => {
                    window.location.href = "/eco-points";
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-[#020814] dark:text-[#DEDEDE] font-inter"
                >
                  Eco-Points
                </button>
                <button
                  onClick={() => {
                    window.location.href = "/recycling";
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-[#020814] dark:text-[#DEDEDE] font-inter"
                >
                  Recycling Centers
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                  <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-[#020814] dark:text-[#DEDEDE] font-inter">
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

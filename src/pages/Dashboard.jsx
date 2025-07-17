/* eslint-disable no-unused-vars */
import React, { useContext, useMemo } from "react";
import { HashLoader } from "react-spinners";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaHome, FaMoneyBillWave, FaChartBar } from "react-icons/fa";
import DynamicHeader from "../components/DynamicHeader";
import { DashboardContext } from "../context/DashboardContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { dashboardData, loading, error } = useContext(DashboardContext);

  // Memoize dashboardData to prevent unnecessary re-renders
  const memoizedDashboardData = useMemo(() => dashboardData, [dashboardData]);

  const handleViewProperty = (id) => {
    const property =
      memoizedDashboardData.topExpensiveProperties.find((p) => p._id === id) ||
      memoizedDashboardData.cheapestProperties.find((p) => p._id === id);
    navigate(`/property-detail/${id}`, { state: { property } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <HashLoader
          color="#3b82f6"
          loading={loading}
          size={60}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 pt-10 flex items-center justify-center">
        <p className="text-red-600 text-lg">Error: {error}</p>
      </div>
    );
  }

  const { stats, topExpensiveProperties, cheapestProperties } =
    memoizedDashboardData;

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-10">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <DynamicHeader title="Property Management Dashboard" />
          <p className="text-gray-600 mt-2 text-lg">
            Monitor and manage your real estate portfolio with ease.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition-shadow"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="p-3 bg-blue-100 rounded-full">
              <FaHome className="text-blue-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Total Properties
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalProperties}
              </p>
            </div>
          </motion.div>
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition-shadow"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-3 bg-green-100 rounded-full">
              <FaMoneyBillWave className="text-green-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                For Sale / Rent
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {stats.forSale} / {stats.forRent}
              </p>
            </div>
          </motion.div>
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition-shadow"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="p-3 bg-purple-100 rounded-full">
              <FaChartBar className="text-purple-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Property Types
              </h3>
              <p className="text-2xl font-bold text-purple-600">
                {Object.keys(stats.byType).length}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Property Types Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Properties by Type
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(stats.byType).map(([type, count], index) => (
              <motion.div
                key={type}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <p className="text-sm font-medium text-gray-600">{type}</p>
                <p className="text-lg font-bold text-gray-800">{count}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Top 5 Most Expensive Properties */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Top 5 Most Expensive Properties
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topExpensiveProperties && topExpensiveProperties.length > 0 ? (
              topExpensiveProperties.map((property, index) => (
                <motion.div
                  key={property._id}
                  className="relative bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                  role="article"
                  aria-labelledby={`expensive-property-${property._id}`}
                >
                  <div className="relative">
                    <img
                      src={
                        property?.images?.[0] ||
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      }
                      alt={property.property_type}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3
                      id={`expensive-property-${property._id}`}
                      className="text-lg font-bold text-gray-800"
                    >
                      {property.property_type}
                    </h3>
                    <p className="text-gray-600 text-sm">{property.city}</p>
                    <p className="text-gray-600 text-sm">
                      <strong>Price: </strong>
                      {Number(property.price).toLocaleString("en-PK", {
                        style: "currency",
                        currency: "PKR",
                      })}
                    </p>
                    <p className="text-gray-600 text-sm">
                      <strong>Size: </strong>
                      {property.size.value} {property.size.unit}
                    </p>
                    <motion.button
                      onClick={() => handleViewProperty(property._id)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`View details for ${property.property_type}`}
                    >
                      View Details
                    </motion.button>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 pointer-events-none"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-white text-center p-4">
                      <p className="text-lg font-semibold">
                        Explore {property.property_type}
                      </p>
                      <p className="text-sm">Click to view details</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No properties added yet.
              </div>
            )}
          </div>
        </div>

        {/* Top 5 Cheapest Properties */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Top 5 Cheapest Properties
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cheapestProperties && cheapestProperties.length > 0 ? (
              cheapestProperties.map((property, index) => (
                <motion.div
                  key={property._id}
                  className="relative bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                  role="article"
                  aria-labelledby={`cheapest-property-${property._id}`}
                >
                  <div className="relative">
                    <img
                      src={
                        property?.images?.[0] ||
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      }
                      alt={property.property_type}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3
                      id={`cheapest-property-${property._id}`}
                      className="text-lg font-bold text-gray-800"
                    >
                      {property.property_type}
                    </h3>
                    <p className="text-gray-600 text-sm">{property.city}</p>
                    <p className="text-gray-600 text-sm">
                      <strong>Price: </strong>
                      {Number(property.price).toLocaleString("en-PK", {
                        style: "currency",
                        currency: "PKR",
                      })}
                    </p>
                    <p className="text-gray-600 text-sm">
                      <strong>Size: </strong>
                      {property.size.value} {property.size.unit}
                    </p>
                    <motion.button
                      onClick={() => handleViewProperty(property._id)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`View details for ${property.property_type}`}
                    >
                      View Details
                    </motion.button>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 pointer-events-none"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-white text-center p-4">
                      <p className="text-lg font-semibold">
                        Explore {property.property_type}
                      </p>
                      <p className="text-sm">Click to view details</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))
            ) : (
              <div>Not add property yet!</div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

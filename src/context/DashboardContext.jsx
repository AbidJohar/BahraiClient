// src/context/DashboardContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {

 const base_url = import.meta.env.VITE_BASE_URL;
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalProperties: 0,
      forSale: 0,
      forRent: 0,
      byType: {
        Home: 0,
        Apartment: 0,
        ResidentialPlot: 0,
        FarmHouse: 0,
        CommercialPlot: 0,
        Plaza: 0,
        Shop: 0,
      },
    },
    topExpensiveProperties: [],
    cheapestProperties: [],
  });
  const [properties, setProperties] = useState([]); // New state for all properties
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map backend snake_case to frontend camelCase for property_type
  const propertyTypeMap = {
    apartment: "Apartment",
    home: "Home",
    residential_plot: "ResidentialPlot",
    farmhouse: "FarmHouse",
    commercial_plot: "CommercialPlot",
    plaza: "Plaza",
    shop: "Shop",
  };

  // Reusable fetch function
  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard data
      const dashboardResponse = await fetch(
        `${base_url}/properties/dashboard`
      );
      if (!dashboardResponse.ok)
        throw new Error("Failed to fetch dashboard data");
      const dashboardDataResult = await dashboardResponse.json();
      setDashboardData(dashboardDataResult);

      // Fetch all properties
      const propertiesResponse = await fetch(
        ` ${base_url}/properties/all`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!propertiesResponse.ok) throw new Error("Failed to fetch properties");
      const propertiesData = await propertiesResponse.json();
      const normalizedProperties = propertiesData.map((property) => ({
        ...property,
        property_type:
          propertyTypeMap[property.property_type] || property.property_type,
      }));
      setProperties(normalizedProperties);

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (properties.length === 0 && dashboardData.stats.totalProperties === 0) {
      fetchAllData();
    }
  }, []); // Empty dependency array for initial fetch only

  return (
    <DashboardContext.Provider
      value={{
        base_url,
        dashboardData,
        fetchAllData,
        setDashboardData,
        properties,
        setProperties,
        loading,
        error,
        setLoading,
        setError,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaHome,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import DynamicHeader from "../components/DynamicHeader";

const PropertyDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const property = state?.property;

  console.log("property", state.property);
  

  // Define boolean fields per property type (for consistent "Yes"/"No" formatting)
  const booleanFieldsByType = {
    Apartment: [
      "furnished",
      "lift",
      "is_living",
      "servent",
      "possession",
      "tv_lounch",
    ],
    Home: ["furnished", "store_room", "servent_room", "living", "swimmingPool"],
    ResidentialPlot: ["possession"],
    FarmHouse: ["parking"],
    CommercialPlot: ["construction_allowed"],
    Plaza: ["lift"],
    Shop: ["washroom", "possession"],
  };

  if (!property) {
    return (
      <p className="text-center mt-10 text-gray-500 text-lg">
        No property data available.
      </p>
    );
  }

  // Format field labels for display
  const formatLabel = (field) => {
    return field
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format field values
  const formatValue = (field, value) => {
    if (value === null || value === undefined) return "N/A";
    if (booleanFieldsByType[property.property_type]?.includes(field)) {
      return value ? "Yes" : "No";
    }
    if (
      field === "price" ||
      field === "monthly_rent" 
    ) {
      return Number(value).toLocaleString("en-PK", {
        style: "currency",
        currency: "PKR",
      });
    }
    if (field === "size" || field === "extra_land") {
      return `${value?.value || value} ${value?.unit || ""}`;
    }
    if (field === "installment" && value) {
      try {
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        return (
          <div className="space-y-1">
            <p>
              <strong>Down Payment:</strong>{" "}
              {Number(parsed.down_payment).toLocaleString("en-PK", {
                style: "currency",
                currency: "PKR",
              })}
            </p>
            <p>
              <strong>Installment Amount:</strong>{" "}
              {Number(parsed.installment_amount).toLocaleString("en-PK", {
                style: "currency",
                currency: "PKR",
              })}
            </p>
            <p>
              <strong>Number of Installments:</strong>{" "}
              {parsed.number_of_installments}
            </p>
          </div>
        );
      } catch (e) {
        return "N/A";
      }
    }
    return value.toString();
  };

  // Fields to exclude from Detail component (handled in dedicated sections)
  const excludedFields = [
    "description",
    "utilities",
    "video_url",
    "images",
    "layout_plan",
    "contact_Number",
    "email",
    "office_Name",
    "full_Name",
    "note_for_result",
    "pin_location",
  ];

  // Categorize fields for three-column layout
  const basicFields = [
    "property_type",
    "list_type",
    "payment_type",
    "price",
    "size",
    "installments",
    "monthly_rent",
  ];
  const locationFields = [
    "city",
    "society",
    "sector",
    "phase",
    "street",
    "plot",
    "plot_number",
    "house",
    "apartment_no",
    "shop_number",
    "building_name",
    "commercialName",
  ];
  const propertyFields = Object.keys(property).filter(
    (key) =>
      !excludedFields.includes(key) &&
      property[key] !== null &&
      property[key] !== undefined
  );
  console.log("Property fields:", propertyFields);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-10 pt-10">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <DynamicHeader title="Property Details" />
        </div>

        {/* Hero Image */}
        {property.images?.length > 0 && (
          <motion.div
            className="relative rounded-xl shadow-lg overflow-hidden mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <img
              src={property.images[0] || "https://via.placeholder.com/1200x600"}
              alt={property.property_type}
              className="w-full h-64 sm:h-80 md:h-96 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
              {property.property_type}
            </div>
          </motion.div>
        )}

        {/* Additional Images */}
        {property.images?.length > 1 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Additional Images
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {property.images.slice(1).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Property Image ${index + 2}`}
                  className="w-full h-32 sm:h-40 object-cover rounded-md shadow"
                  loading="lazy"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Property Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Basic Details */}
            {propertyFields.some((field) => basicFields.includes(field)) && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Basic Details
                </h3>
                {propertyFields
                  .filter((field) => basicFields.includes(field))
                  .map((field) => (
                    <Detail
                      key={field}
                      label={formatLabel(field)}
                      value={formatValue(field, property[field])}
                    />
                  ))}
              </motion.div>
            )}

            {/* Middle Column: Location Details */}
            {propertyFields.some((field) => locationFields.includes(field)) && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Location
                </h3>
                {propertyFields
                  .filter((field) => locationFields.includes(field))
                  .map((field) => (
                    <Detail
                      key={field}
                      label={formatLabel(field)}
                      value={formatValue(field, property[field])}
                    />
                  ))}
              </motion.div>
            )}

            {/* Right Column: Property Specifics */}
            {propertyFields.some(
              (field) =>
                !basicFields.includes(field) && !locationFields.includes(field)
            ) && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Property Specifics
                </h3>
                {propertyFields
                  .filter(
                    (field) =>
                      field !== "_id" &&
                      field !== "allotment" &&
                      !basicFields.includes(field) &&
                      !locationFields.includes(field)
                  )
                  .map((field) => (
                    <Detail
                      key={field}
                      label={formatLabel(field)}
                      value={formatValue(field, property[field])}
                    />
                  ))}

                  {/* installement details */}

                  {/* {property.installements &&} */}

                {/* Allotment Section */}
                {property.allotment && (
                  <div className="pt-1 ">
                    <h3 className="text-md font-semibold text-gray-800  pb-2 mt-1">
                      Allotment Details
                    </h3>

                    {/* Status */}
                    {property.allotment.status && (
                      <Detail
                        label="Status"
                        value={formatValue("status", property.allotment.status)}
                      />
                    )}

                    {/* Allotment Details */}
                    {property.allotment.details &&
                      Object.entries(property.allotment.details).map(
                        ([key, value]) => (
                          <Detail
                            key={key}
                            label={formatLabel(key)}
                            value={formatValue(key, value)}
                          />
                        )
                      )}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Note for Result */}
          {property.note_for_result && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Note for Result
              </h3>
              <p className="text-gray-600 text-sm mt-2">
                {property.note_for_result}
              </p>
            </motion.div>
          )}

          {/* Utilities */}
          {property.utilities?.length > 0 && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Utilities
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {property.utilities.map((item, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Contact Information */}
          {(property.contact_Number ||
            property.email ||
            property.office_Name ||
            property.full_Name) && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Contact Information
              </h3>
              <div className="space-y-2 mt-2">
                {property.full_Name && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FaUser className="text-blue-600" />
                    <span>{property.full_Name}</span>
                  </div>
                )}
                {property.office_Name && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FaHome className="text-blue-600" />
                    <span>{property.office_Name}</span>
                  </div>
                )}
                {property.contact_Number && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FaPhoneAlt className="text-blue-600" />
                    <span>{property.contact_Number}</span>
                  </div>
                )}
                {property.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FaEnvelope className="text-blue-600" />
                    <span>{property.email}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {property.layout_plan && (
            <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Property Layout Plan
              </h3>

              {/* File Display Logic */}
              <div className="flex justify-center mb-4">
                {property.layout_plan.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={property.layout_plan}
                    title="Layout PDF"
                    className="w-full max-w-3xl h-[500px] border rounded"
                    onError={(e) => {
                      e.target.style.display = "none";
                      document.getElementById("layout-error").style.display =
                        "block";
                    }}
                  />
                ) : (
                  <img
                    src={property.layout_plan}
                    alt="Layout Plan"
                    className="w-full max-w-3xl rounded border"
                    onError={(e) => {
                      e.target.style.display = "none";
                      document.getElementById("layout-error").style.display =
                        "block";
                    }}
                  />
                )}
              </div>

              {/* Error Message */}
              <div
                id="layout-error"
                className="hidden text-center p-4 bg-red-100 text-red-700 border border-red-300 rounded"
              >
                <p>Failed to load the layout file.</p>
                <p>You can still open it using the button below.</p>
              </div>

              {/* Open Button */}
              <div className="flex justify-start mt-4">
                <a
                  href={property.layout_plan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Open
                </a>
              </div>
            </div>
          )}

          {/* Video */}
          {property.video_url && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Property Video
              </h3>
              <iframe
                src={property.video_url.replace("watch?v=", "embed/")}
                title="Property Video"
                className="w-full h-64 rounded-md shadow mt-2"
                allowFullScreen
              />
            </motion.div>
          )}
        </div>

        {/* Back Button */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Go back to previous page"
          >
            <FaArrowLeft /> Back
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Reusable component for cleaner details
const Detail = ({ label, value }) => (
  <div className="flex items-start gap-2 text-md text-gray-700">
    <strong className="text-md font-bold">{label}:</strong>
    <span className="text-gray-600">{typeof value === "string" ? value : value}</span>
  </div>
);

export default PropertyDetails;

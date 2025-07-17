import React, { useState,useEffect, useRef, useContext } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";
import DynamicHeader from "../components/DynamicHeader";
import { DashboardContext } from "../context/DashboardContext";

// Conversion function for size units
const convertSize = (value, fromUnit, toUnit) => {
  if (!value || !fromUnit || !toUnit || fromUnit === toUnit) return value;

  // Base unit: Square Feet
  const MARLA_TO_SQFT = 272.25;     // 1 Marla = 272.25 sq ft
  const KANAL_TO_MARLA = 20;        // 1 Kanal = 20 Marla
  const KANAL_TO_SQFT = KANAL_TO_MARLA * MARLA_TO_SQFT; // 1 Kanal = 5445 sq ft
  const SQYD_TO_SQFT = 9;           // 1 Square Yard = 9 sq ft

  let valueInSqFt;

  // Step 1: Convert input to Square Feet
  switch (fromUnit) {
    case "Kanal":
      valueInSqFt = value * KANAL_TO_SQFT;
      break;
    case "Marla":
      valueInSqFt = value * MARLA_TO_SQFT;
      break;
    case "Square Yards":
      valueInSqFt = value * SQYD_TO_SQFT;
      break;
    case "Square Feet":
      valueInSqFt = value;
      break;
    default:
      return value;
  }

  // Step 2: Convert Square Feet to target unit
  switch (toUnit) {
    case "Kanal":
      return parseFloat((valueInSqFt / KANAL_TO_SQFT).toFixed(2));
    case "Marla":
      return parseFloat((valueInSqFt / MARLA_TO_SQFT).toFixed(2));
    case "Square Yards":
      return parseFloat((valueInSqFt / SQYD_TO_SQFT).toFixed(2));
    case "Square Feet":
      return parseFloat(valueInSqFt.toFixed(2));
    default:
      return value;
  }
};

const PostNewProperty = () => {

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    unregister,
    reset,
  } = useForm();
  const selectedSociety = watch("society");
  const selectedPropertyType = watch("property_type");
  const selectedListType = watch("list_type");
  const selectedPaymentType = watch("payment_type");
  const allotmentValue = watch("allotment");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedUtilities, setSelectedUtilities] = useState([]);
  const fileInputRef = useRef(null);
  const [layout_plan, setLayout_plan] = useState(null);

  const {fetchAllData,base_url} =  useContext(DashboardContext)

  const endpointMap = {
    Apartment: "/apartment",
    Home: "/home",
    ResidentialPlot: "/residential_plot",
    FarmHouse: "/farmhouse",
    CommercialPlot: "/commercial_plot",
    Plaza: "/plaza",
    Shop: "/shop",
  };

  // Common fields for all property types
  const commonFields = [
    "list_type",
    "property_type",
    "payment_type",
    "description",
    "price",
    "city",
    "society",
    "phase",
    "video_url",
    "pin_location",
    "images",
    "layout_plan",
    "full_Name",
    "office_Name",
    "email",
    "contact_Number",
  ];

  // Boolean fields per property type (to transform "Yes"/"No" to true/false)
  const booleanFieldsByType = {
    Apartment: [
      "furnished",
      "lift",
      "is_living",
      "servent",
      "possession",
      "tv_lounch",
    ],
    Home: ["furnished", "store_room", "servent_room", "living","possession", "swimmingPool"],
    FarmHouse: ["parking"],
    CommercialPlot: ["construction_allowed"],
    Plaza: [ "lift"],
    Shop: ["washroom", "possession"],
  };


useEffect(() => {
  if (
    selectedPropertyType === "Home" ||
    selectedPropertyType === "ResidentialPlot" ||
    selectedPropertyType === "FarmHouse"
  ) {
    unregister("commercialName");
  } else {
    unregister("sector");
  }
}, [selectedPropertyType]);


  // Fields per property type (excluding common fields)
  const specificFieldsByType = {
    Apartment: [
      "bedrooms",
      "bathrooms",
      "floor_level",
      "furnished",
      "size",
      "building_name",
      "apartment_no",
      "parking",
      "lift",
      "is_living",
      "tv_lounch",
      "servent",
      "kitchen",
      "utilities",
      "possession",
      "commercialName",
    ],
    Home: [
      "bedrooms",
      "bathrooms",
      "floor_level",
      "furnished",
      "house",
      "design",
      "store_room",
      "servent_room",
      "living",
      "car_parking",
      "possession",
      "solar_panel",
      "swimmingPool",
      "kitchen",
      "construction_year",
      "utilities",
      "size",
      "extra_land",
      "sector",
    ],
    ResidentialPlot: [
      "plot",
      "road_width",
      "street",
      "category",
      "allotment",
      "possessionUitilityCharges",
      "size",
      "extra_land",
      "note_for_result",
      "sector",
      "earth_status",
      "ownership",
      "map_charges",
      "development_charges",
      "sector"
    ],
    FarmHouse: [
      "street",
      "possessionUitilityCharges",
      "size",
      "extra_land",
      "category",
      "sector",
      "plot",
      "road_width",
      "allotment",
      "note_for_result",
      "sector",
      "earth_status",
      "ownership",
      "map_charges",
      "development_charges",
      "construction_allowed",
      "plot_dimension"
    ],
    CommercialPlot: [
      "plot",
      // "street",
      "category",
      "plot_dimension",
      "commercialName",
      "road_width",
      "allotment",
      "possessionUitilityCharges",
      "size",
      "extra_land",
      "note_for_result",
      "earth_status",
      "ownership",
      "map_charges",
      "development_charges",
      "construction_allowed",
      "coverage",
    ],
    Plaza: [
      "construction_story",
      "shops",
      "parking",
      "plot_dimension",
      "category",
      "building_name",
      "height",
      "apartments",
      "monthly_rent",
      "utilities",
      "commercialName",
      "apartment_floors",
      "commercial_floors",
      "lift"
    ],
    Shop: [
      "floor_number",
      "shop_number",
      "washroom",
      "monthly_rent",
      "building_name",
      // "cover_area",
      "size",
      "commercialName",
      "possession"
    ],
  };


  // console.log("selectedListType:", selectedListType);

  const onSubmit = async (data) => {
    
    // console.log(
    //   "Images state:",
    //   images.map((img) => ({ name: img.name, size: img.size, type: img.type }))
    // );

    if (!data.property_type) {
      toast.error("Please select a property type");
      return;
    }

    try {
      const relevantFields = [
        ...commonFields,
        ...(specificFieldsByType[selectedPropertyType] || []),
      ];
      const booleanFields = booleanFieldsByType[selectedPropertyType] || [];
      const formData = new FormData();

      // Append non-image fields
      relevantFields.forEach((field) => {
        if (
          field in data &&
          data[field] !== undefined &&
          data[field] !== null &&
          field !== "images" &&
          field !== "utilities" &&
          field !== "layout_plan" &&
          field !== "allotment"
        ) {

          if (field === "property_type") {
            formData.append(field, data[field].toLowerCase());
          } else if (booleanFields.includes(field)) {
            formData.append(field, data[field] === "Yes");
          } else {
            formData.append(field, data[field]);
          }
        }
      });


      // Handle allotment field
    if (data.allotment) {
      const allotmentData = {
        status: data.allotment.toLowerCase().replace(" ", "-"), // Convert "Balloted" to "balloted", "Non Balloted" to "non-balloted"
        details: null,
      };
      if (allotmentData.status === "balloted") {
        allotmentData.details = {
          plot: data.plot || null,
          street: data.street || null,
          category: data.category || null,
          road_width: data.road_width || null,
          map_charges: data.map_charges,
          development_charges: data.development_charges,
          possessionUitilityCharges: data.possessionUitilityCharges 
        };
      }
      formData.append("allotment_status", allotmentData.status);
      if (allotmentData.details) {
        Object.entries(allotmentData.details).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });
      }
      console.log("allotment data",allotmentData);
    } 

    


      // Handle size field (assuming it’s in data.size)
    if (data.size && data.size.value && data.size.unit) {
      const size = { value: data.size.value, unit: data.size.unit };
      formData.append("size", JSON.stringify(size));
    }
      // Handle extra land field (assuming it’s in data.extra_land)
    if (data.extra_land && data.extra_land.value && data.extra_land.unit) {
      const extra_land = { value: data.size.value, unit: data.size.unit };
      formData.append("extra_land", JSON.stringify(extra_land));
    }

      // Handle installment fields as a single object
      if (data.payment_type === "Installment") {
        const installmentData = {
          down_payment: data.down_payment,
          installment_amount: data.installment_amount,
          number_of_installments: data.number_of_installments,
        };
        formData.append("installment", JSON.stringify(installmentData));
      }

      if (selectedUtilities.length > 0) {
        selectedUtilities.forEach((util) => {
          formData.append("utilities", util);
        });
      }

      // Append images from images state (outside the loop)
      if (images.length > 0) {
        if (images.length > 5) {
          toast.error("Cannot upload more than 5 images");
          return;
        }
        images.forEach((img) => {
          if (!(img instanceof File)) {
            // console.error(`Image ${index + 1} is not a File:`, img);
          }
          formData.append("images", img);
          // console.log(`Appending image ${index + 1}: filename=${img.name}, size=${img.size}, type=${img.type}`);
        });
      }

      // Append layout_plan
    if (layout_plan) {
      if (!(layout_plan instanceof File)) {
        console.error("layout_plan is not a File:", layout_plan);
        toast.error("Invalid layout plan file");
        return;
      }
      formData.append("layout_plan", layout_plan);
    }

      // Debug FormData contents
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `${key}: File(name=${value.name}, size=${value.size}, type=${value.type})`
          );
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const endpoint = endpointMap[selectedPropertyType];
      if (!endpoint) {
        throw new Error("Invalid property type");
      }

      console.log("Endpoint:", endpoint);
      console.log("Form data:", formData);

      setLoading(true);
      const response = await axios.post(
        `${base_url}/properties${endpoint}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // refetch all data to update the context
        await fetchAllData();
      console.log("Response:", response.data);
      toast.success("Property posted successfully!");
      reset();
      setImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error posting property:", error);
      const errorMessage =
        error.response?.data?.detail || "Failed to post property";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;

    if (value === "None" && checked) {
      setSelectedUtilities(["None"]);
    } else if (value !== "None" && checked) {
      setSelectedUtilities((prev) =>
        prev.includes("None") ? [value] : [...prev, value]
      );
    } else {
      // If unchecked, remove the utility
      setSelectedUtilities((prev) => prev.filter((util) => util !== value));
    }
  };

  const handleImageChange = async (e) => {
    if (!(e.target.files instanceof FileList)) {
      console.error("e.target.files is not a FileList:", e.target.files);
      toast.error("Invalid file input");
      return;
    }
    const newFiles = Array.from(e.target.files); // Convert FileList to Array<File>
    console.log(
      "Selected files:",
      newFiles.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    );
    if (newFiles.length === 0) return;

    const totalImages = images.length + newFiles.length;
    if (totalImages > 5) {
      toast.error("Cannot upload more than 5 images");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    for (const file of newFiles) {
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, or WEBP image files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Each image must be less than 5MB");
        return;
      }
    }

    const updatedImages = [...images, ...newFiles];
    setImages(updatedImages);
    setValue("images", updatedImages, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

 const handleLayoutChange = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      // "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or WEBP files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be less than 10MB");
      return;
    }
    setLayout_plan(file);
  } else {
    setLayout_plan(null);
  }
};

  const handleReset = () => {
    reset();
  };

  const listTypes = ["Rent", "Sale"];
  const paymentTypes = ["Full Payment", "Installment"];
  const propertyTypes = [
    "Apartment",
    "Home",
    "ResidentialPlot",
    "FarmHouse",
    "CommercialPlot",
    "Plaza",
    "Shop",
  ];
  const societies = [
    {
      id: 1,
      name: "Gulberg Islamabad",
      phases: [
        "Gulberg Greens",
        "Gulberg Residencia",
        "Executive Block",
        "A Block",
        "B Block",
      ],
    },
    {
      id: 2,
      name: "Bahria Town Islamabad",
      phases: [
        "Phase 1",
        "Phase 2",
        "Phase 3",
        "Phase 4",
        "Phase 5",
        "Phase 6",
        "Phase 7",
        "Phase 8",
      ],
    },
    {
      id: 3,
      name: "DHA Islamabad",
      phases: [
        "Phase 1",
        "Phase 2",
        "Phase 3",
        "Phase 4",
        "Phase 5",
        "Phase 6",
      ],
    },
    { id: 4, name: "G-13", phases: ["G-13/1", "G-13/2", "G-13/3", "G-13/4"] },
    { id: 5, name: "G-14", phases: ["G-14/1", "G-14/2", "G-14/3", "G-14/4"] },
    { id: 6, name: "F-10", phases: ["F-10/1", "F-10/2", "F-10/3", "F-10/4"] },
    { id: 7, name: "E-11", phases: ["E-11/1", "E-11/2", "E-11/3", "E-11/4"] },
    {
      id: 8,
      name: "PWD Housing Society",
      phases: ["Block A", "Block B", "Block C", "Commercial Area"],
    },
    {
      id: 9,
      name: "Soan Gardens",
      phases: ["Block A", "Block B", "Block C", "Block D"],
    },
    { id: 10, name: "I-8", phases: ["I-8/1", "I-8/2", "I-8/3", "I-8/4"] },
  ];
  const booleanOptions = ["Yes", "No"];
  const designs = ["designer", "Luxury"];
  const utilities = ["Electricity", "Water", "Gas", "internet", "None"];
  const pakistaniCities = [
    "Islamabad",
    "Karachi",
    "Lahore",
    "Rawalpindi",
    "Peshawar",
    "Quetta",
    "Faisalabad",
    "Multan",
    "Sialkot",
    "Gujranwala",
    "Bahawalpur",
    "Sargodha",
    "Hyderabad",
    "Sukkur",
    "Larkana",
    "Abbottabad",
    "Mardan",
    "Mirpur",
    "Muzaffarabad",
    "Gilgit",
    "Skardu",
  ];
  return (
    <div className="mx-auto p-6 bg-white shadow-md rounded-lg pl-12">
      <DynamicHeader title={"Location And Purpose"} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* List Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 mt-3">
            List Type
          </label>
          <div className="flex flex-wrap gap-4">
            {listTypes.map((type) => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="radio"
                  {...register("list_type", {
                    required: "List type is required",
                  })}
                  value={type}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{type}</span>
              </label>
            ))}
          </div>
          {errors.list_type && (
            <p className="text-red-500 text-sm mt-1">
              {errors.list_type.message}
            </p>
          )}
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </label>
          <div className="flex flex-wrap gap-4">
            {propertyTypes.map((type) => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="radio"
                  {...register("property_type", {
                    required: "Property type is required",
                  })}
                  value={type}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{type}</span>
              </label>
            ))}
          </div>
          {errors.property_type && (
            <p className="text-red-500 text-sm mt-1">
              {errors.property_type.message}
            </p>
          )}
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <select
              {...register("city", { required: "City is required" })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a city</option>
              {pakistaniCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Society
            </label>
            <select
              {...register("society", { required: "Society is required" })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a Society</option>
              {societies.map((society) => (
                <option key={society.id} value={society.name}>
                  {society.name}
                </option>
              ))}
            </select>
            {errors.society && (
              <p className="text-red-500 text-sm mt-1">
                {errors.society.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              phase
            </label>
            <select
              {...register("phase")}
              disabled={!selectedSociety}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select phase</option>
              {selectedSociety &&
                societies
                  .find((s) => s.name === selectedSociety)
                  ?.phases.map((phase) => (
                    <option key={phase} value={phase}>
                      {phase}
                    </option>
                  ))}
            </select>
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">
              Street
            </label>
            <input
              type="text"
              {...register("street", { required: "Street is required" })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Main Boulevard"
            />
            {errors.street && (
              <p className="text-red-500 text-sm mt-1">
                {errors.street.message}
              </p>
            )}
          </div> */}

          {selectedPropertyType === "Home" ||
          selectedPropertyType === "ResidentialPlot" ||
          selectedPropertyType === "FarmHouse" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sector
              </label>
              <input
                type="text"
                {...register("sector")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g, Sector A"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Commercial Name
              </label>
              <input
                type="text"
                {...register("commercialName")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={"e.g., Capital Heights Mall"}
              />
            </div>
          )}

          {/* pin_location url upload */}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pin Location
            </label>
            <input
              type="text"
              {...register("pin_location", {
                required: "Pin location URL is required",
              })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., https://maps.google.com/?q=location"
            />
            {errors.pin_location && (
              <p className="text-red-500 text-sm mt-1">
                {errors.pin_location.message}
              </p>
            )}
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700">
              Location Orientation
            </label>
            <input
              type="text"
              {...register("location_orientation", {
                required: "location_orientation number is required",
                min: {
                  value: 1,
                  message: "location_orientation must be required",
                },
              })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Corner Park Face"
            />
            {errors.location_orientation && (
              <p className="text-red-500 text-sm mt-1">
                {errors.location_orientation.message}
              </p>
            )}
          </div> */}
        </div>

        {/* location and purpose is ending.. */}

        {/* Property  details */}

        <div className="space-y-4">
          <DynamicHeader title={"Property Details"} />
          {/* Description */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 10,
                  message: "Description must be at least 10 characters",
                },
              })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Enter property description"
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div> */}

          {/* Conditional Fields Based on Property Type */}
          {selectedPropertyType === "Apartment" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bedrooms
                </label>
                <input
                  type="number"
                  {...register("bedrooms", {
                    required: "Number of bedrooms is required",
                    min: {
                      value: 1,
                      message: "At least 1 bedroom is required",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2"
                />
                {errors.bedrooms && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.bedrooms.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bathrooms
                </label>
                <input
                  type="number"
                  {...register("bathrooms", {
                    required: "Number of bathrooms is required",
                    min: {
                      value: 1,
                      message: "At least 1 bathroom is required",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2"
                />
                {errors.bathrooms && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.bathrooms.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Floor Level
                </label>
                <input
                  type="number"
                  {...register("floor_level", {
                    required: "Floor level is required",
                    min: {
                      value: 0,
                      message: "Floor level cannot be negative",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 5"
                />
                {errors.floor_level && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.floor_level.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furnished
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("furnished", {
                          required: "Furnished status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.furnished && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.furnished.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TV Lounch
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("tv_lounch", {
                          required: "TV lounch status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.tv_lounch && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.tv_lounch.message}
                  </p>
                )}
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                  Covered Area (sq. Feet)
                </label>
                <input
                  type="number"
                  {...register("cover_area", {
                    required: "Covered area is required",
                    min: {
                      value: 0,
                      message: "Covered area cannot be negative",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 240"
                />
                {errors.cover_area && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cover_area.message}
                  </p>
                )}
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Building Name
                </label>
                <input
                  type="text"
                  {...register("building_name", {
                    required: "Building name is required",
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Sky Towers"
                />
                {errors.building_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.building_name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Apartment Number
                </label>
                <input
                  type="number"
                  {...register("apartment_no", {
                    required: "Apartment number is required",
                    min: {
                      value: 1,
                      message: "Apartment number must be positive",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 101"
                />
                {errors.apartment_no && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.apartment_no.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parking
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Basement", "Outdoor"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("parking", {
                          required: "Parking status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.parking && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.parking.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lift
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("lift", {
                          required: "Lift status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.lift && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.lift.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Living Room
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("is_living", {
                          required: "Living room status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.is_living && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.is_living.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servant Room
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("servent", {
                          required: "Servant room status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.servent && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.servent.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  kitchen
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Separte", "Open"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("kitchen", {
                          required: "kitchen status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.kitchen && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.kitchen.message}
                  </p>
                )}
              </div>
              {/* kitchen is comment */}
              {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kitchens
              </label>
              <input
                type="number"
                {...register("kitchen", {
                  required: "Number of car kitchen is required",
                  min: { value: 1, message: "kitchen number must be positive" },
                })}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g 2"
              />
              {errors.kitchen && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.kitchen.message}
                </p>
              )}
            </div> */}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Utilities
              </label>
              <div className="flex flex-wrap gap-4">
                {utilities.map((util) => (
                  <label key={util} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={util}
                      checked={selectedUtilities.includes(util)}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">{util}</span>
                  </label>
                ))}
              </div>
              {errors.utilities && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.utilities.message}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Possession
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("possession", {
                          required: "Possession status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.possession && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.possession.message}
                  </p>
                )}
              </div>
              {/* size */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Size
                </label>
                <div className="mt-1 flex w-full">
                  <input
                    type="number"
                    step="any"
                    {...register("size.value", {
                      required: "Size is required",
                      min: { value: 0, message: "Size cannot be negative" },
                    })}
                    className="block w-4/5 p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 5"
                  />
                  <select
                    {...register("size.unit", {
                      required: "Unit is required",
                    })}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      const currentSize = watch("size.value");
                      const currentUnit = watch("size.unit");
                      if (
                        currentSize &&
                        currentUnit &&
                        newUnit &&
                        currentUnit !== newUnit
                      ) {
                        const convertedValue = convertSize(
                          currentSize,
                          currentUnit,
                          newUnit
                        );
                        setValue("size.value", convertedValue, {
                          shouldValidate: true,
                        });
                      }
                      setValue("size.unit", newUnit, { shouldValidate: true });
                    }}
                    className="block w-1/6 p-2 border border-gray-800 text-white bg-gradient-to-r from-[#619eb9] via-[#203a43] to-[#000000] rounded-r-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    style={{
                      color: "white", // Ensure select text is white
                      backgroundImage:
                        "linear-gradient(to right, #619eb9, #203a43, #000000)", // Explicit gradient for consistency
                    }}
                  >
                    <option value="" className="text-gray-400 bg-gray-800">
                      Select Unit
                    </option>
                    <option value="Marla" className="text-black bg-white">
                      Marla
                    </option>
                    <option
                      value="Square Yards"
                      className="text-black bg-white"
                    >
                      Square Yards
                    </option>
                    <option value="Square Feet" className="text-black bg-white">
                      Square Feet
                    </option>
                  </select>
                </div>
                {errors.size?.value && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.size.value.message}
                  </p>
                )}
                {errors.size?.unit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.size.unit.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {selectedPropertyType === "Home" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bedrooms
                </label>
                <input
                  type="number"
                  {...register("bedrooms", {
                    required: "Number of bedrooms is required",
                    min: {
                      value: 1,
                      message: "At least 1 bedroom is required",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 3"
                />
                {errors.bedrooms && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.bedrooms.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bathrooms
                </label>
                <input
                  type="number"
                  {...register("bathrooms", {
                    required: "Number of bathrooms is required",
                    min: {
                      value: 1,
                      message: "At least 1 bathroom is required",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2"
                />
                {errors.bathrooms && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.bathrooms.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Floor Level
                </label>
                <select
                  {...register("floor_level", {
                    required: "floor_level is required",
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Floor Level</option>
                  {["Single story", "Double story", "Triple story"].map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
                {errors.floor_level && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.floor_level.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furnished
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("furnished", {
                          required: "Furnished status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.furnished && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.furnished.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Possession
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("possession", {
                          required: "Possession status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.possession && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.possession.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  House Number
                </label>
                <input
                  type="text"
                  {...register("house", {
                    required: "House number is required",
                    min: { value: 1, message: "House number must be required" },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 123"
                />
                {errors.house && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.house.message}
                  </p>
                )}
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                  Covered Area (sq. Feet)
                </label>
                <input
                  type="number"
                  {...register("cover_area", {
                    required: "Covered area is required",
                    min: {
                      value: 0,
                      message: "Covered area cannot be negative",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 240"
                />
                {errors.cover_area && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cover_area.message}
                  </p>
                )}
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  design
                </label>
                <select
                  {...register("design", { required: "design is required" })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select design</option>
                  {designs.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.design && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.design.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Room
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("store_room", {
                          required: "Store room status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.store_room && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.store_room.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servant Room
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("servent_room", {
                          required: "Servant room status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.servent_room && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.servent_room.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Living Room
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("living", {
                          required: "Living room status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.living && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.living.message}
                  </p>
                )}
              </div>

              {/* Swimming pool */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Swimming pool
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("swimmingPool", {
                          required: "Swimming pool status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.swimmingPool && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.swimmingPool.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Car Parking slots
                </label>
                <input
                  type="number"
                  {...register("car_parking", {
                    required: "Number of car parking slots is required",
                    min: {
                      value: 1,
                      message: "Parking slot number must be positive",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g 2"
                />
                {errors.car_parking && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.car_parking.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kitchens
                </label>
                <input
                  type="number"
                  {...register("kitchen", {
                    required: "Number of car kitchen is required",
                    min: {
                      value: 1,
                      message: "kitchen number must be positive",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g 2"
                />
                {errors.kitchen && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.kitchen.message}
                  </p>
                )}
              </div>
              {/* solar panel */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Solar Panel (Kw)
                </label>

                <input
                  type="number"
                  {...register("solar_panel", {
                    required: "Number of solar panels is required",
                    min: {
                      value: 1,
                      message: "Solar panel number must be positive",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g 3 kW"
                />

                {errors.solar_panel && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.solar_panel.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Construction Year
                </label>
                <input
                  type="number"
                  {...register("construction_year", {
                    required: "Construction year is required",
                    min: { value: 1900, message: "Year must be after 1900" },
                    max: {
                      value: new Date().getFullYear(),
                      message: "Year cannot be in the future",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2010"
                />
                {errors.construction_year && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.construction_year.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Utilities
                </label>
                <div className="flex flex-wrap gap-4">
                  {utilities.map((util) => (
                    <label key={util} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={util}
                        checked={selectedUtilities.includes(util)}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">{util}</span>
                    </label>
                  ))}
                </div>
                {errors.utilities && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.utilities.message}
                  </p>
                )}
              </div>

              {/* size */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Size
                </label>
                <div className="mt-1 flex w-full">
                  <input
                    type="number"
                    step="any"
                    {...register("size.value", {
                      required: "Size is required",
                      min: { value: 0, message: "Size cannot be negative" },
                    })}
                    className="block w-4/5 p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 5"
                  />
                  <select
                    {...register("size.unit", {
                      required: "Unit is required",
                    })}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      const currentSize = watch("size.value");
                      const currentUnit = watch("size.unit");
                      if (
                        currentSize &&
                        currentUnit &&
                        newUnit &&
                        currentUnit !== newUnit
                      ) {
                        const convertedValue = convertSize(
                          currentSize,
                          currentUnit,
                          newUnit
                        );
                        setValue("size.value", convertedValue, {
                          shouldValidate: true,
                        });
                      }
                      setValue("size.unit", newUnit, { shouldValidate: true });
                    }}
                    className="block w-1/6 p-2 border border-gray-800 text-white bg-gradient-to-r from-[#619eb9] via-[#203a43] to-[#000000] rounded-r-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    style={{
                      color: "white", // Ensure select text is white
                      backgroundImage:
                        "linear-gradient(to right, #619eb9, #203a43, #000000)", // Explicit gradient for consistency
                    }}
                  >
                    <option value="" className="text-gray-400 bg-gray-800">
                      Select Unit
                    </option>
                    <option value="Kanal" className="text-black bg-white">
                      Kanal
                    </option>
                    <option value="Marla" className="text-black bg-white">
                      Marla
                    </option>
                    <option
                      value="Square Yards"
                      className="text-black bg-white"
                    >
                      Square Yards
                    </option>
                    <option value="Square Feet" className="text-black bg-white">
                      Square Feet
                    </option>
                  </select>
                </div>
                {errors.size?.value && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.size.value.message}
                  </p>
                )}
                {errors.size?.unit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.size.unit.message}
                  </p>
                )}
              </div>


   {/* Extra Land */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Extra Land
                </label>
                <div className="mt-1 flex w-full">
                  <input
                    type="number"
                    step="any"
                    {...register("extra_land.value", {
                      required: "extra_land is required",
                      min: { value: 0, message: "extra_land cannot be negative" },
                    })}
                    className="block w-4/5 p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 2 "
                  />
                  <select
                    {...register("extra_land.unit", {
                      required: "Unit is required",
                    })}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      const currentExtra_land = watch("extra_land.value");
                      const currentUnit = watch("extra_land.unit");
                      if (
                        currentExtra_land &&
                        currentUnit &&
                        newUnit &&
                        currentUnit !== newUnit
                      ) {
                        const convertedValue = convertSize(
                          currentExtra_land,
                          currentUnit,
                          newUnit
                        );
                        setValue("extra_land.value", convertedValue, {
                          shouldValidate: true,
                        });
                      }
                      setValue("extra_land.unit", newUnit, { shouldValidate: true });
                    }}
                    className="block w-1/6 p-2 border border-gray-800 text-white bg-gradient-to-r from-[#619eb9] via-[#203a43] to-[#000000] rounded-r-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    style={{
                      color: "white", // Ensure select text is white
                      backgroundImage:
                        "linear-gradient(to right, #619eb9, #203a43, #000000)", // Explicit gradient for consistency
                    }}
                  >
                    <option value="" className="text-gray-400 bg-gray-800">
                      Select Unit
                    </option>
                         <option value="Kanal" className="text-black bg-white">
                      Kanal
                    </option>
                    <option value="Marla" className="text-black bg-white">
                      Marla
                    </option>
                    <option
                      value="Square Yards"
                      className="text-black bg-white"
                    >
                      Square Yards
                    </option>
                    <option value="Square Feet" className="text-black bg-white">
                      Square Feet
                    </option>
                  </select>
                </div>
                {errors.extra_land?.value && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.extra_land.value.message}
                  </p>
                )}
                {errors.extra_land?.unit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.extra_land.unit.message}
                  </p>
                )}
              </div>

            </div>
          )}

          {selectedPropertyType === "ResidentialPlot" && (
            <div className="space-y-4">
              {/* Allotment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allotment
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Balloted", "Non Balloted"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("allotment", {
                          required: "Allotment status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.allotment && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.allotment.message}
                  </p>
                )}
              </div>

              {/* Only show below fields if allotment is Balloted */}
              {allotmentValue === "Balloted" && (
                <>
                  {/* Plot Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Plot
                    </label>
                    <input
                      type="text"
                      {...register("plot", {
                        required: "Plot number is required",
                      })}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., A-123"
                    />
                    {errors.plot && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.plot.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Street
                    </label>
                    <input
                      type="text"
                      {...register("street", {
                        required: "Street is required",
                      })}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Main Boulevard"
                    />
                    {errors.street && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.street.message}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <input
                      type="category"
                      {...register("category", {
                        required: "category is required",
                      })}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Park corner"
                    />
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Road Width */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Road Width
                    </label>
                    <input
                      type="text"
                      {...register("road_width", {
                        required: "Road width is required",
                      })}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 30 ft"
                    />
                    {errors.road_width && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.road_width.message}
                      </p>
                    )}
                  </div>

                  {/* Possession Utility Charges */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Possession Utility Charges
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["Paid", "Not Paid"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            {...register("possessionUitilityCharges", {
                              required: "Possession status is required",
                            })}
                            value={option}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                    {errors.possessionUitilityCharges && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.possessionUitilityCharges.message}
                      </p>
                    )}
                  </div>

                  {/* Map Charges */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Map Charges
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["Paid", "Not Paid"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            {...register("map_charges", {
                              required: "map_charges status is required",
                            })}
                            value={option}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                    {errors.map_charges && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.map_charges.message}
                      </p>
                    )}
                  </div>

                  {/* Development Charges */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Development Charges
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["Paid", "Not Paid"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            {...register("development_charges", {
                              required:
                                "development_charges status is required",
                            })}
                            value={option}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                    {errors.development_charges && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.development_charges.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Ownership */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ownership
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Open", "Transferable"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("ownership", {
                          required: "ownership status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.ownership && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.ownership.message}
                  </p>
                )}
              </div>

              {/* Earth Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Earth Status
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Develop", "Non Develop"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("earth_status", {
                          required: "earth_status status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.earth_status && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.earth_status.message}
                  </p>
                )}
              </div>

              {/* size */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Size
                </label>
                <div className="mt-1 flex w-full">
                  <input
                    type="number"
                    step="any"
                    {...register("size.value", {
                      required: "Size is required",
                      min: { value: 0, message: "Size cannot be negative" },
                    })}
                    className="block w-4/5 p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 5"
                  />
                  <select
                    {...register("size.unit", {
                      required: "Unit is required",
                    })}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      const currentSize = watch("size.value");
                      const currentUnit = watch("size.unit");
                      if (
                        currentSize &&
                        currentUnit &&
                        newUnit &&
                        currentUnit !== newUnit
                      ) {
                        const convertedValue = convertSize(
                          currentSize,
                          currentUnit,
                          newUnit
                        );
                        setValue("size.value", convertedValue, {
                          shouldValidate: true,
                        });
                      }
                      setValue("size.unit", newUnit, { shouldValidate: true });
                    }}
                    className="block w-1/6 p-2 border border-gray-800 text-white bg-gradient-to-r from-[#619eb9] via-[#203a43] to-[#000000] rounded-r-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    style={{
                      color: "white", // Ensure select text is white
                      backgroundImage:
                        "linear-gradient(to right, #619eb9, #203a43, #000000)", // Explicit gradient for consistency
                    }}
                  >
                    <option value="" className="text-gray-400 bg-gray-800">
                      Select Unit
                    </option>

                         <option value="Kanal" className="text-black bg-white">
                      Kanal
                    </option>
                    <option value="Marla" className="text-black bg-white">
                      Marla
                    </option>
                    <option
                      value="Square Yards"
                      className="text-black bg-white"
                    >
                      Square Yards
                    </option>
                    <option value="Square Feet" className="text-black bg-white">
                      Square Feet
                    </option>
                  </select>
                </div>
                {errors.size?.value && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.size.value.message}
                  </p>
                )}
                {errors.size?.unit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.size.unit.message}
                  </p>
                )}
              </div>

               {/* Extra Land */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Extra Land
                </label>
                <div className="mt-1 flex w-full">
                  <input
                    type="number"
                    step="any"
                    {...register("extra_land.value", {
                      required: "extra_land is required",
                      min: { value: 0, message: "extra_land cannot be negative" },
                    })}
                    className="block w-4/5 p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 2 "
                  />
                  <select
                    {...register("extra_land.unit", {
                      required: "Unit is required",
                    })}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      const currentExtra_land = watch("extra_land.value");
                      const currentUnit = watch("extra_land.unit");
                      if (
                        currentExtra_land &&
                        currentUnit &&
                        newUnit &&
                        currentUnit !== newUnit
                      ) {
                        const convertedValue = convertSize(
                          currentExtra_land,
                          currentUnit,
                          newUnit
                        );
                        setValue("extra_land.value", convertedValue, {
                          shouldValidate: true,
                        });
                      }
                      setValue("extra_land.unit", newUnit, { shouldValidate: true });
                    }}
                    className="block w-1/6 p-2 border border-gray-800 text-white bg-gradient-to-r from-[#619eb9] via-[#203a43] to-[#000000] rounded-r-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    style={{
                      color: "white", // Ensure select text is white
                      backgroundImage:
                        "linear-gradient(to right, #619eb9, #203a43, #000000)", // Explicit gradient for consistency
                    }}
                  >
                    <option value="" className="text-gray-400 bg-gray-800">
                      Select Unit
                    </option>
                         <option value="Kanal" className="text-black bg-white">
                      Kanal
                    </option>
                    <option value="Marla" className="text-black bg-white">
                      Marla
                    </option>
                    <option
                      value="Square Yards"
                      className="text-black bg-white"
                    >
                      Square Yards
                    </option>
                    <option value="Square Feet" className="text-black bg-white">
                      Square Feet
                    </option>
                  </select>
                </div>
                {errors.extra_land?.value && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.extra_land.value.message}
                  </p>
                )}
                {errors.extra_land?.unit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.extra_land.unit.message}
                  </p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Note for Result
                </label>
                <textarea
                  {...register("note_for_result")}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  placeholder="Enter any additional notes"
                ></textarea>
              </div>
            </div>
          )}
          {selectedPropertyType === "FarmHouse" && (
            <div className="space-y-4">
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Possession
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("possession", {
                          required: "Possession status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.possession && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.possession.message}
                  </p>
                )}
              </div> */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plot
                </label>
                <input
                  type="text"
                  {...register("plot", { required: "Plot is required" })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Plot 45"
                />
                {errors.plot && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.plot.message}
                  </p>
                )}
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plot Dimension
                </label>
                <input
                  type="text"
                  {...register("plot_dimension", {
                    required: "Plot dimension is required",
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 40x60 ft"
                />
                {errors.plot_dimension && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.plot_dimension.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Construction Allowed
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("construction_allowed", {
                          required: "Construction allowed status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.construction_allowed && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.construction_allowed.message}
                  </p>
                )}
              </div>

              {/* Allotment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allotment
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Balloted", "Non Balloted"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("allotment", {
                          required: "Allotment status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.allotment && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.allotment.message}
                  </p>
                )}
              </div>

              {/* Only show below fields if allotment is Balloted */}
              {allotmentValue === "Balloted" && (
                <>
                  {/* Plot Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Plot
                    </label>
                    <input
                      type="text"
                      {...register("plot", {
                        required: "Plot number is required",
                      })}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., A-123"
                    />
                    {errors.plot && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.plot.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Street
                    </label>
                    <input
                      type="text"
                      {...register("street", {
                        required: "Street is required",
                      })}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Main Boulevard"
                    />
                    {errors.street && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.street.message}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <input
                      type="category"
                      {...register("category", {
                        required: "category is required",
                      })}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Park corner"
                    />
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Road Width */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Road Width
                    </label>
                    <input
                      type="text"
                      {...register("road_width", {
                        required: "Road width is required",
                      })}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 30 ft"
                    />
                    {errors.road_width && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.road_width.message}
                      </p>
                    )}
                  </div>

                  {/* Possession Utility Charges */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Possession Utility Charges
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["Paid", "Not Paid"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            {...register("possessionUitilityCharges", {
                              required: "Possession status is required",
                            })}
                            value={option}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                    {errors.possessionUitilityCharges && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.possessionUitilityCharges.message}
                      </p>
                    )}
                  </div>

                  {/* Map Charges */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Map Charges
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["Paid", "Not Paid"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            {...register("map_charges", {
                              required: "map_charges status is required",
                            })}
                            value={option}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                    {errors.map_charges && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.map_charges.message}
                      </p>
                    )}
                  </div>

                  {/* Development Charges */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Development Charges
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["Paid", "Not Paid"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            {...register("development_charges", {
                              required:
                                "development_charges status is required",
                            })}
                            value={option}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                    {errors.development_charges && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.development_charges.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Ownership */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ownership
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Open", "Transferable"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("ownership", {
                          required: "ownership status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.ownership && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.ownership.message}
                  </p>
                )}
              </div>

              {/* Earth Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Earth Status
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Develop", "Non Develop"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("earth_status", {
                          required: "earth_status status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.earth_status && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.earth_status.message}
                  </p>
                )}
              </div>

              {/* size */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Size
                </label>
                <div className="mt-1 flex w-full">
                  <input
                    type="number"
                    step="any"
                    {...register("size.value", {
                      required: "Size is required",
                      min: { value: 0, message: "Size cannot be negative" },
                    })}
                    className="block w-4/5 p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 5"
                  />
                  <select
                    {...register("size.unit", {
                      required: "Unit is required",
                    })}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      const currentSize = watch("size.value");
                      const currentUnit = watch("size.unit");
                      if (
                        currentSize &&
                        currentUnit &&
                        newUnit &&
                        currentUnit !== newUnit
                      ) {
                        const convertedValue = convertSize(
                          currentSize,
                          currentUnit,
                          newUnit
                        );
                        setValue("size.value", convertedValue, {
                          shouldValidate: true,
                        });
                      }
                      setValue("size.unit", newUnit, { shouldValidate: true });
                    }}
                    className="block w-1/6 p-2 border border-gray-800 text-white bg-gradient-to-r from-[#619eb9] via-[#203a43] to-[#000000] rounded-r-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    style={{
                      color: "white", // Ensure select text is white
                      backgroundImage:
                        "linear-gradient(to right, #619eb9, #203a43, #000000)", // Explicit gradient for consistency
                    }}
                  >
                    <option value="" className="text-gray-400 bg-gray-800">
                      Select Unit
                    </option>
                         <option value="Kanal" className="text-black bg-white">
                      Kanal
                    </option>
                    <option value="Marla" className="text-black bg-white">
                      Marla
                    </option>
                    <option
                      value="Square Yards"
                      className="text-black bg-white"
                    >
                      Square Yards
                    </option>
                    <option value="Square Feet" className="text-black bg-white">
                      Square Feet
                    </option>
                  </select>
                </div>
                {errors.size?.value && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.size.value.message}
                  </p>
                )}
                {errors.size?.unit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.size.unit.message}
                  </p>
                )}
              </div>


               {/* Extra Land */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Extra Land
                </label>
                <div className="mt-1 flex w-full">
                  <input
                    type="number"
                    step="any"
                    {...register("extra_land.value", {
                      required: "extra_land is required",
                      min: { value: 0, message: "extra_land cannot be negative" },
                    })}
                    className="block w-4/5 p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 2 "
                  />
                  <select
                    {...register("extra_land.unit", {
                      required: "Unit is required",
                    })}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      const currentExtra_land = watch("extra_land.value");
                      const currentUnit = watch("extra_land.unit");
                      if (
                        currentExtra_land &&
                        currentUnit &&
                        newUnit &&
                        currentUnit !== newUnit
                      ) {
                        const convertedValue = convertSize(
                          currentExtra_land,
                          currentUnit,
                          newUnit
                        );
                        setValue("extra_land.value", convertedValue, {
                          shouldValidate: true,
                        });
                      }
                      setValue("extra_land.unit", newUnit, { shouldValidate: true });
                    }}
                    className="block w-1/6 p-2 border border-gray-800 text-white bg-gradient-to-r from-[#619eb9] via-[#203a43] to-[#000000] rounded-r-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    style={{
                      color: "white", // Ensure select text is white
                      backgroundImage:
                        "linear-gradient(to right, #619eb9, #203a43, #000000)", // Explicit gradient for consistency
                    }}
                  >
                    <option value="" className="text-gray-400 bg-gray-800">
                      Select Unit
                    </option>
                         <option value="Kanal" className="text-black bg-white">
                      Kanal
                    </option>
                    <option value="Marla" className="text-black bg-white">
                      Marla
                    </option>
                    <option
                      value="Square Yards"
                      className="text-black bg-white"
                    >
                      Square Yards
                    </option>
                    <option value="Square Feet" className="text-black bg-white">
                      Square Feet
                    </option>
                  </select>
                </div>
                {errors.extra_land?.value && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.extra_land.value.message}
                  </p>
                )}
                {errors.extra_land?.unit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.extra_land.unit.message}
                  </p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Note for Result
                </label>
                <textarea
                  {...register("note_for_result")}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  placeholder="Enter any additional notes"
                ></textarea>
              </div>
            </div>
          )}

          {selectedPropertyType === "CommercialPlot" && (
            <div className="space-y-4">
              {/* Allotment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allotment
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Balloted", "Non Balloted"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("allotment", {
                          required: "Allotment status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.allotment && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.allotment.message}
                  </p>
                )}
              </div>

              {/* Only show below fields if allotment is Balloted */}
              {allotmentValue === "Balloted" && (
                <>
                  {/* Plot Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Plot
                    </label>
                    <input
                      type="text"
                      {...register("plot", { required: "Plot is required" })}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Plot 45"
                    />
                    {errors.plot && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.plot.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Street
                    </label>
                    <input
                      type="text"
                      {...register("street", {
                        required: "Street is required",
                      })}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Main Boulevard"
                    />
                    {errors.street && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.street.message}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <input
                      type="category"
                      {...register("category", {
                        required: "category is required",
                      })}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Park face"
                    />
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Road Width */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Road Width
                    </label>
                    <input
                      type="text"
                      {...register("road_width", {
                        required: "Road width is required",
                      })}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 30 ft"
                    />
                    {errors.road_width && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.road_width.message}
                      </p>
                    )}
                  </div>

                  {/* Possession Utility Charges */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Possession Utility Charges
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["Paid", "Not Paid"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            {...register("possessionUitilityCharges", {
                              required: "Possession status is required",
                            })}
                            value={option}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                    {errors.possessionUitilityCharges && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.possessionUitilityCharges.message}
                      </p>
                    )}
                  </div>

                  {/* Map Charges */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Map Charges
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["Paid", "Not Paid"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            {...register("map_charges", {
                              required: "map_charges status is required",
                            })}
                            value={option}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                    {errors.map_charges && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.map_charges.message}
                      </p>
                    )}
                  </div>

                  {/* Development Charges */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Development Charges
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["Paid", "Not Paid"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            {...register("development_charges", {
                              required:
                                "development_charges status is required",
                            })}
                            value={option}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                    {errors.development_charges && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.development_charges.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plot Dimension
                </label>
                <input
                  type="text"
                  {...register("plot_dimension", {
                    required: "Plot dimension is required",
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 40x60 ft"
                />
                {errors.plot_dimension && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.plot_dimension.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Construction Allowed
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("construction_allowed", {
                          required: "Construction allowed status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.construction_allowed && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.construction_allowed.message}
                  </p>
                )}
              </div>

              {/* Ownership */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ownership
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Open", "Transferable"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("ownership", {
                          required: "ownership status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.ownership && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.ownership.message}
                  </p>
                )}
              </div>

              {/* Earth Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Earth Status
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Develop", "Non Develop"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("earth_status", {
                          required: "earth_status status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.earth_status && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.earth_status.message}
                  </p>
                )}
              </div>

              {/*  Coverage */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                  coverage
                </label>
                <input
                  type="text"
                  step="any"
                  {...register("coverage", {
                    required: "coverage is required",
                    min: { value: 0, message: "coverage cannot be negative" },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., G + 5 floors"
                />
                {errors.coverage && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.coverage.message}
                  </p>
                )}
              </div> */}

              {/* size */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Size
                </label>
                <div className="mt-1 flex w-full">
                  <input
                    type="number"
                    step="any"
                    {...register("size.value", {
                      required: "Size is required",
                      min: { value: 0, message: "Size cannot be negative" },
                    })}
                    className="block w-4/5 p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 5"
                  />
                  <select
                    {...register("size.unit", {
                      required: "Unit is required",
                    })}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      const currentSize = watch("size.value");
                      const currentUnit = watch("size.unit");
                      if (
                        currentSize &&
                        currentUnit &&
                        newUnit &&
                        currentUnit !== newUnit
                      ) {
                        const convertedValue = convertSize(
                          currentSize,
                          currentUnit,
                          newUnit
                        );
                        setValue("size.value", convertedValue, {
                          shouldValidate: true,
                        });
                      }
                      setValue("size.unit", newUnit, { shouldValidate: true });
                    }}
                    className="block w-1/6 p-2 border border-gray-800 text-white bg-gradient-to-r from-[#619eb9] via-[#203a43] to-[#000000] rounded-r-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    style={{
                      color: "white", // Ensure select text is white
                      backgroundImage:
                        "linear-gradient(to right, #619eb9, #203a43, #000000)", // Explicit gradient for consistency
                    }}
                  >
                    <option value="" className="text-gray-400 bg-gray-800">
                      Select Unit
                    </option>
                         <option value="Kanal" className="text-black bg-white">
                      Kanal
                    </option>
                    <option value="Marla" className="text-black bg-white">
                      Marla
                    </option>
                    <option
                      value="Square Yards"
                      className="text-black bg-white"
                    >
                      Square Yards
                    </option>
                    <option value="Square Feet" className="text-black bg-white">
                      Square Feet
                    </option>
                  </select>
                </div>
                {errors.size?.value && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.size.value.message}
                  </p>
                )}
                {errors.size?.unit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.size.unit.message}
                  </p>
                )}
              </div>


               {/* Extra Land */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Extra Land
                </label>
                <div className="mt-1 flex w-full">
                  <input
                    type="number"
                    step="any"
                    {...register("extra_land.value", {
                      required: "extra_land is required",
                      min: { value: 0, message: "extra_land cannot be negative" },
                    })}
                    className="block w-4/5 p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 2 "
                  />
                  <select
                    {...register("extra_land.unit", {
                      required: "Unit is required",
                    })}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      const currentExtra_land = watch("extra_land.value");
                      const currentUnit = watch("extra_land.unit");
                      if (
                        currentExtra_land &&
                        currentUnit &&
                        newUnit &&
                        currentUnit !== newUnit
                      ) {
                        const convertedValue = convertSize(
                          currentExtra_land,
                          currentUnit,
                          newUnit
                        );
                        setValue("extra_land.value", convertedValue, {
                          shouldValidate: true,
                        });
                      }
                      setValue("extra_land.unit", newUnit, { shouldValidate: true });
                    }}
                    className="block w-1/6 p-2 border border-gray-800 text-white bg-gradient-to-r from-[#619eb9] via-[#203a43] to-[#000000] rounded-r-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    style={{
                      color: "white", // Ensure select text is white
                      backgroundImage:
                        "linear-gradient(to right, #619eb9, #203a43, #000000)", // Explicit gradient for consistency
                    }}
                  >
                    <option value="" className="text-gray-400 bg-gray-800">
                      Select Unit
                    </option>
                         <option value="Kanal" className="text-black bg-white">
                      Kanal
                    </option>
                    <option value="Marla" className="text-black bg-white">
                      Marla
                    </option>
                    <option
                      value="Square Yards"
                      className="text-black bg-white"
                    >
                      Square Yards
                    </option>
                    <option value="Square Feet" className="text-black bg-white">
                      Square Feet
                    </option>
                  </select>
                </div>
                {errors.extra_land?.value && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.extra_land.value.message}
                  </p>
                )}
                {errors.extra_land?.unit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.extra_land.unit.message}
                  </p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Note for Result
                </label>
                <textarea
                  {...register("note_for_result")}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  placeholder="Enter any additional notes"
                ></textarea>
              </div>
            </div>
          )}

          {selectedPropertyType === "Plaza" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Construction story
                </label>
                <input
                  type="number"
                  {...register("construction_story", {
                    required: "Number of construction_story is required",
                    min: {
                      value: 1,
                      message: "At least 1 construction_story is required",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 5 story"
                />
                {errors.construction_story && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.construction_story.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Apartment Floors
                </label>
                <input
                  type="number"
                  {...register("apartment_floors", {
                    required: "Number of apartment_floors is required",
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Four apartment Floors"
                />
                {errors.apartment_floors && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.apartment_floors.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Commercial Floors
                </label>
                <input
                  type="number"
                  {...register("commercial_floors", {
                    required: "Number of commercial_floors is required",
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Five Commercial Floors"
                />
                {errors.commercial_floors && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.commercial_floors.message}
                  </p>
                )}
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                  Shops
                </label>
                <input
                  type="number"
                  {...register("shops", {
                    required: "Number of shops is required",
                    min: { value: 1, message: "At least 1 shop is required" },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 10"
                />
                {errors.shops && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.shops.message}
                  </p>
                )}
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parking
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Basement", "Outdoor"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("parking", {
                          required: "Parking status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.parking && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.parking.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lift
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("lift", {
                          required: "Lift status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.lift && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.lift.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plot Dimension
                </label>
                <input
                  type="text"
                  {...register("plot_dimension", {
                    required: "Plot dimension is required",
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 40x60 ft"
                />
                {errors.plot_dimension && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.plot_dimension.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Building Name
                </label>
                <input
                  type="text"
                  {...register("building_name", {
                    required: "Building name is required",
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., City Plaza"
                />
                {errors.building_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.building_name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Height (ft)
                </label>
                <input
                  type="number"
                  {...register("height", {
                    required: "Height is required",
                    min: { value: 0, message: "Height cannot be negative" },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 50"
                />
                {errors.height && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.height.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Apartments
                </label>
                <input
                  type="number"
                  {...register("apartments", {
                    required: "Number of apartments is required",
                    min: {
                      value: 0,
                      message: "Number of apartments cannot be negative",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 20"
                />
                {errors.apartments && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.apartments.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monthly Rent
                </label>
                <input
                  type="number"
                  {...register("monthly_rent", {
                    required: "Monthly rent is required",
                    min: {
                      value: 0,
                      message: "Monthly rent cannot be negative",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 100000"
                />
                {errors.monthly_rent && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.monthly_rent.message}
                  </p>
                )}
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Utilities
              </label>
              <div className="flex flex-wrap gap-4">
                {utilities.map((util) => (
                  <label key={util} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={util}
                      checked={selectedUtilities.includes(util)}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">{util}</span>
                  </label>
                ))}
              </div>
              {errors.utilities && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.utilities.message}
                </p>
              )}

           {/* size */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Size
                </label>
                <div className="mt-1 flex w-full">
                  <input
                    type="number"
                    step="any"
                    {...register("size.value", {
                      required: "Size is required",
                      min: { value: 0, message: "Size cannot be negative" },
                    })}
                    className="block w-4/5 p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 5"
                  />
                  <select
                    {...register("size.unit", {
                      required: "Unit is required",
                    })}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      const currentSize = watch("size.value");
                      const currentUnit = watch("size.unit");
                      if (
                        currentSize &&
                        currentUnit &&
                        newUnit &&
                        currentUnit !== newUnit
                      ) {
                        const convertedValue = convertSize(
                          currentSize,
                          currentUnit,
                          newUnit
                        );
                        setValue("size.value", convertedValue, {
                          shouldValidate: true,
                        });
                      }
                      setValue("size.unit", newUnit, { shouldValidate: true });
                    }}
                    className="block w-1/6 p-2 border border-gray-800 text-white bg-gradient-to-r from-[#619eb9] via-[#203a43] to-[#000000] rounded-r-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    style={{
                      color: "white", // Ensure select text is white
                      backgroundImage:
                        "linear-gradient(to right, #619eb9, #203a43, #000000)", // Explicit gradient for consistency
                    }}
                  >
                    <option value="" className="text-gray-400 bg-gray-800">
                      Select Unit
                    </option>
                         <option value="Kanal" className="text-black bg-white">
                      Kanal
                    </option>
                    <option value="Marla" className="text-black bg-white">
                      Marla
                    </option>
                    <option
                      value="Square Yards"
                      className="text-black bg-white"
                    >
                      Square Yards
                    </option>
                    <option value="Square Feet" className="text-black bg-white">
                      Square Feet
                    </option>
                  </select>
                </div>
                {errors.size?.value && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.size.value.message}
                  </p>
                )}
                {errors.size?.unit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.size.unit.message}
                  </p>
                )}
              </div>

            </div>

          )}

          {selectedPropertyType === "Shop" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Floor Number
                </label>
                <input
                  type="number"
                  {...register("floor_number", {
                    required: "Floor number is required",
                    min: {
                      value: 0,
                      message: "Floor number cannot be negative",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 0"
                />
                {errors.floor_number && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.floor_number.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Shop Number
                </label>
                <input
                  type="text"
                  {...register("shop_number", {
                    required: "Shop number is required",
                    min: { value: 1, message: "Shop number must be positive" },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 101"
                />
                {errors.shop_number && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.shop_number.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Possession
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("possession", {
                          required: "Possession status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.possession && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.possession.message}
                  </p>
                )}
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lift
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("lift", {
                          required: "Lift status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.lift && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.lift.message}
                  </p>
                )}
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Washroom
                </label>
                <div className="flex flex-wrap gap-4">
                  {booleanOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("washroom", {
                          required: "Washroom status is required",
                        })}
                        value={option}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.washroom && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.washroom.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monthly Rent
                </label>
                <input
                  type="number"
                  {...register("monthly_rent", {
                    required: "Monthly rent is required",
                    min: {
                      value: 0,
                      message: "Monthly rent cannot be negative",
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 50000"
                />
                {errors.monthly_rent && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.monthly_rent.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Building Name
                </label>
                <input
                  type="text"
                  {...register("building_name", {
                    required: "Building name is required",
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., City Plaza"
                />
                {errors.building_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.building_name.message}
                  </p>
                )}
              </div>


              {/* size */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Size
                </label>
                <div className="mt-1 flex w-full">
                  <input
                    type="number"
                    step="any"
                    {...register("size.value", {
                      required: "Size is required",
                      min: { value: 0, message: "Size cannot be negative" },
                    })}
                    className="block w-4/5 p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 5"
                  />
                  <select
                    {...register("size.unit", {
                      required: "Unit is required",
                    })}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      const currentSize = watch("size.value");
                      const currentUnit = watch("size.unit");
                      if (
                        currentSize &&
                        currentUnit &&
                        newUnit &&
                        currentUnit !== newUnit
                      ) {
                        const convertedValue = convertSize(
                          currentSize,
                          currentUnit,
                          newUnit
                        );
                        setValue("size.value", convertedValue, {
                          shouldValidate: true,
                        });
                      }
                      setValue("size.unit", newUnit, { shouldValidate: true });
                    }}
                    className="block w-1/6 p-2 border border-gray-800 text-white bg-gradient-to-r from-[#619eb9] via-[#203a43] to-[#000000] rounded-r-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    style={{
                      color: "white", // Ensure select text is white
                      backgroundImage:
                        "linear-gradient(to right, #619eb9, #203a43, #000000)", // Explicit gradient for consistency
                    }}
                  >
                    <option value="" className="text-gray-400 bg-gray-800">
                      Select Unit
                    </option>
                    <option value="Marla" className="text-black bg-white">
                      Marla
                    </option>
                    <option
                      value="Square Yards"
                      className="text-black bg-white"
                    >
                      Square Yards
                    </option>
                    <option value="Square Feet" className="text-black bg-white">
                      Square Feet
                    </option>
                  </select>
                </div>
                {errors.size?.value && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.size.value.message}
                  </p>
                )}
                {errors.size?.unit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.size.unit.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Property detial is ending here... */}

        {/* Price detail of the property */}

        <div className="space-y-4">
          <DynamicHeader title={"Price Details"} />
          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Type
            </label>
            <div className="flex flex-wrap gap-4">
              {paymentTypes.map((type) => {
                // Only show Installment option if list_type is Sale
                if (type === "Installment" && selectedListType !== "Sale") {
                  return null;
                }
                return (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      {...register("payment_type", {
                        required: "Payment type is required",
                      })}
                      value={type}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{type}</span>
                  </label>
                );
              })}
            </div>
            {errors.payment_type && (
              <p className="text-red-500 text-sm mt-1">
                {errors.payment_type.message}
              </p>
            )}
          </div>

          {/* Installment Fields (only for Sale + Installment) */}
          {selectedListType === "Sale" &&
            selectedPaymentType === "Installment" && (
              <div className="space-y-4">
                {/* Down Payment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Down Payment (PKR)
                  </label>
                  <input
                    type="number"
                    {...register("down_payment", {
                      required: "Down payment is required",
                      min: {
                        value: 0,
                        message: "Down payment cannot be negative",
                      },
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter down payment amount"
                  />
                  {errors.down_payment && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.down_payment.message}
                    </p>
                  )}
                </div>

                {/* Installment Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Installment Amount (PKR)
                  </label>
                  <input
                    type="number"
                    {...register("installment_amount", {
                      required: "Installment amount is required",
                      min: {
                        value: 0,
                        message: "Installment amount cannot be negative",
                      },
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter monthly installment amount"
                  />
                  {errors.installment_amount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.installment_amount.message}
                    </p>
                  )}
                </div>

                {/* Number of Installments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Installments
                  </label>
                  <input
                    type="number"
                    {...register("number_of_installments", {
                      required: "Number of installments is required",
                      min: {
                        value: 1,
                        message: "At least one installment required",
                      },
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter number of installments"
                  />
                  {errors.number_of_installments && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.number_of_installments.message}
                    </p>
                  )}
                </div>
              </div>
            )}

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="text"
              {...register("price", {
                required: "Price is required",
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: "Enter a valid price (e.g., 5000000.00)",
                },
              })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 5000000.00"
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">
                {errors.price.message}
              </p>
            )}
          </div>
        </div>

        {/* Price details is ending here... */}

        {/* Property Images and Videos */}

        <div className="space-y-4">
          <DynamicHeader title={"Property Images & Videos"} />

          {/* video url upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Video URL
            </label>
            <input
              type="text"
              {...register("video_url", {
                required: "video url is required",
              })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., https://youtube.com/video1"
            />
            {errors.building_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.building_name.message}
              </p>
            )}
          </div>

          {/* Property Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Images (up to 5)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="images-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500"
                  >
                    <span>Upload images</span>
                    <input
                      id="images-upload"
                      type="file"
                      multiple
                      {...register("images", {
                        validate: (files) => {
                          if (!files || files.length === 0) return true; // Optional field
                          if (files.length > 5) {
                            return "Cannot upload more than 5 images";
                          }
                          const allowedTypes = [
                            "image/jpeg",
                            "image/png",
                            "image/jpg",
                            "image/webp",
                          ];
                          for (const file of files) {
                            if (!allowedTypes.includes(file.type)) {
                              return "Only JPG, PNG, or WEBP image files are allowed";
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              return "Each image must be less than 5MB";
                            }
                          }
                          return true;
                        },
                      })}
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPEG, JPG, WEBP up to 5MB each, max 5 images
                </p>
                {images.length > 0 && (
                  <p className="text-xs text-gray-700 mt-2">
                    Selected: {images.length} image
                    {images.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            {errors.images && (
              <p className="text-red-500 text-sm mt-1">
                {errors.images.message}
              </p>
            )}
          </div>

        {/* Layout Plan Upload */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Layout Plan (Image) 
  </label>
  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
    <div className="space-y-1 text-center">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex text-sm text-gray-600">
        <label
          htmlFor="layout-upload"
          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500"
        >
          <span>Upload layout plan</span>
          <input
            id="layout-upload"
            name="layout_plan" // Ensure name matches backend
            type="file"
            {...register("layout_plan", {
              validate: (fileList) => {
                const file = fileList?.[0];
                if (!file) return true; // Optional field
                const allowedTypes = [
                  "image/jpeg",
                  "image/png",
                  "image/jpg",
                  "image/webp",
                  // "application/pdf",
                ];
                if (!allowedTypes.includes(file.type)) {
                  return "Only JPG, PNG, WEBP, files are allowed";
                }
                if (file.size > 10 * 1024 * 1024) {
                  return "File must be less than 10MB";
                }
                return true;
              },
            })}
            accept="image/jpeg,image/png,image/jpg,image/webp"
            className="sr-only"
            onChange={handleLayoutChange}
          />
        </label>
        <p className="pl-1">or drag and drop</p>
      </div>
      <p className="text-xs text-gray-500">JPG, PNG, or WEBP – Max 10MB</p>
      {layout_plan && (
        <p className="text-xs text-gray-700 mt-2">Selected: {layout_plan.name}</p>
      )}
    </div>
  </div>
  {errors.layout_plan && (
    <p className="text-red-500 text-sm mt-1">{errors.layout_plan.message}</p>
  )}
</div>
        </div>
        {/* property images and videos ending here.... */}

        {/* propety contact information */}
        <div className="space-y-4">
          <DynamicHeader title="Contact Information" />

          {/* Full Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              {...register("full_Name", {
                required: "Full name is required",
                minLength: {
                  value: 2,
                  message: "Full name must be at least 2 characters long",
                },
              })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Dilawar hussain"
            />
            {errors.full_Name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.full_Name.message}
              </p>
            )}
          </div>

          {/* Office/Agency Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Office or Agency Name
            </label>
            <input
              type="text"
              {...register("office_Name", {
                required: "Agency name is required",
                minLength: {
                  value: 2,
                  message: "Agency name must be at least 2 characters long",
                },
              })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Johar Property Dealers"
            />
            {errors.office_Name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.office_Name.message}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Please enter a valid email address",
                },
              })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., delawar234@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Contact Number Input */}
          <div>
  <label className="block text-sm font-medium text-gray-700">
    Contact Number
  </label>
  <input
    type="tel"
    {...register("contact_Number", {
      required: "Contact number is required",
    })}
    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
    placeholder="+923001234567"
  />
  {errors.contact_Number && (
    <p className="text-red-500 text-sm mt-1">
      {errors.contact_Number.message}
    </p>
  )}
</div>
        </div>

        {/* Submit and Reset Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className={`mt-4 px-6 py-2 rounded-sm flex items-center justify-center gap-2
      ${loading 
        ? "bg-blue-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"} 
      text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin text-white "
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              "Submit"
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostNewProperty;

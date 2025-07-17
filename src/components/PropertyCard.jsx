/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PropertyCard = ({ property,handleViewProperty,  handleEditProperty, onDeleteClick }) => {


  return (
    <motion.div
      className="relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden  w-full hover:shadow-2xl transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      role="article"
      aria-labelledby={`property-${property._id}`}
    >
      {/* Image with gradient overlay */}
      <div className="relative">
        <img
          src={
            property.image ||
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          }
          alt={property.property_type || 'Property'}
          className="w-full h-44 object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Property Type Badge */}
        <div className="absolute bottom-4 right-4 bg-blue-600  text-white text-md font-semibold px-4 py-1 rounded-full">
          {property.property_type || 'Unknown Type'}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3
          id={`property-${property._id}`}
          className="text-lg font-bold text-gray-800 mb-3 tracking-wide"
        >
          {property.city || 'Unknown City'}
        </h3>
        <div className="space-y-2 text-gray-600 text-sm">
          <p>
            <strong className="font-semibold">Price: </strong>
            {Number(property.price || 0).toLocaleString('en-PK', {
              style: 'currency',
              currency: 'PKR',
            })}
          </p>
          <p>
            <strong className="font-semibold">List Type: </strong>
            {property.list_type || 'N/A'}
          </p>
          <div className="flex items-center gap-2">
            <strong className="font-semibold">Size: </strong>
            <span>
              {property.size?.value || 'N/A'} {property.size?.unit || ''}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-2">
          <motion.button
            onClick={() => handleViewProperty(property)}
            className="flex-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`View details for ${property.property_type || 'property'}`}
          >
            View
          </motion.button>
          <motion.button
            onClick={() => handleEditProperty(property)}
            className="flex-1 px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Edit ${property.property_type || 'property'}`}
          >
            Edit
          </motion.button>
          <motion.button
            onClick={() => onDeleteClick(property._id, property.property_type)}
            className="flex-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Delete ${property.property_type || 'property'}`}
          >
            Delete
          </motion.button>
        </div>
      </div>

      {/* Hover Overlay for Additional Info */}
      <motion.div
        className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 pointer-events-none"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-white text-center p-4">
          <p className="text-lg font-semibold">Explore {property.property_type || 'Property'}</p>
          <p className="text-sm">Click to view details</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PropertyCard;
/* eslint-disable no-unused-vars */
import React, { useContext, useMemo,useState } from 'react';
import { toast } from 'react-toastify';
import { HashLoader } from 'react-spinners';
import PropertyCard from '../components/PropertyCard';
import DeleteConfirmationPopup from '../components/PopupCard';
import DynamicHeader from '../components/DynamicHeader';
import { useNavigate } from 'react-router-dom';
import { DashboardContext } from '../context/DashboardContext';

const AllProperties = () => {

  const navigate = useNavigate();
  const { properties, setProperties,base_url, loading, error, setLoading, setError } = useContext(DashboardContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const propertiesPerPage = 10;

  // Map frontend camelCase to backend snake_case for DELETE API
  const backendPropertyTypeMap = {
    Apartment: 'apartment',
    Home: 'home',
    ResidentialPlot: 'residential_plot',
    FarmHouse: 'farmhouse',
    CommercialPlot: 'commercial_plot',
    Plaza: 'plaza',
    Shop: 'shop',
  };

  // Memoize filtered properties to optimize rendering
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        (property.property_type?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (property.city?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (property.list_type?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      const matchesType = filterType ? property.property_type?.toLowerCase() === filterType.toLowerCase() : true;

      return matchesSearch && matchesType;
    });
  }, [properties, searchQuery, filterType]);

  // Pagination logic
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewProperty = (property) => {
    navigate(`/property-detail/${property._id}`, { state: { property } });
  };

  const handleEditProperty = (property) => {
    navigate(`/edit-property/${property._id}`, { state: { property } });
  };

  const handleDeleteClick = (propertyId, propertyType) => {
    setPropertyToDelete({ id: propertyId, type: propertyType });
    setShowDeletePopup(true);
  };

  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;

    try {
      setLoading(true);
      // Convert frontend property_type to backend format
      const backendPropertyType = backendPropertyTypeMap[propertyToDelete.type] || propertyToDelete.type.toLowerCase();
      const response = await fetch(
        `${base_url}/properties/delete/${propertyToDelete.id}?property_type=${backendPropertyType}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      // Update context state
      setProperties(properties.filter((p) => p._id !== propertyToDelete.id));
      toast.success('Property deleted successfully');
    } catch (err) {
      setError(err.message);
      toast.error('Error deleting property');
      console.error('Delete Error:', err);
    } finally {
      setLoading(false);
      setShowDeletePopup(false);
      setPropertyToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setPropertyToDelete(null);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleTypeFilter = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const typeOptions = [
    '',
    'Apartment',
    'Home',
    'ResidentialPlot',
    'FarmHouse',
    'CommercialPlot',
    'Plaza',
    'Shop',
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <DynamicHeader title="All Properties" />

      {/* Search and Filters */}
      <div className="w-full flex items-center justify-between gap-7 mb-6">
        <div className="w-1/2">
          <input
            type="text"
            placeholder="Search by type, city, or list type..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="w-1/3">
          <select
            value={filterType}
            onChange={handleTypeFilter}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type || 'All Types'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      <DeleteConfirmationPopup
        show={showDeletePopup}
        onConfirm={handleDeleteProperty}
        onClose={handleCancelDelete}
      />

      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center items-center pt-32">
          <HashLoader
            color="#3b82f6"
            loading={loading}
            size={60}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      )}
      {error && <p className="text-red-600">{error}</p>}

      {/* Properties Grid */}
      {!loading && !error && (
        <div className="mb-6">
          {currentProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {currentProperties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  handleViewProperty={handleViewProperty}
                  handleEditProperty={handleEditProperty}
                  onDeleteClick={handleDeleteClick}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No properties found.</p>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AllProperties;
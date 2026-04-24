import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaPhone, FaEnvelope, FaStar } from 'react-icons/fa';
import { labPartnerService, type LabPartner } from '../services/labPartnerService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { notify } from '../utils/toast';

const LabPartnerPage: React.FC = () => {
  const navigate = useNavigate();

  // Data States
  const [partners, setPartners] = useState<LabPartner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<LabPartner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load lab partners on mount
  useEffect(() => {
    loadPartners();
  }, []);

  // Filter partners when search or city changes
  useEffect(() => {
    filterPartners();
  }, [searchQuery, selectedCity, partners]);

  const loadPartners = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await labPartnerService.getPartners();
      setPartners(data);

      // Extract unique cities
      const uniqueCities = [...new Set(data.map(p => p.city))].sort();
      setCities(uniqueCities);

      notify.success('Lab partners loaded successfully');
    } catch (err: any) {
      console.error('Error loading lab partners:', err);
      const errorMsg = err.message || 'Failed to load lab partners';
      setError(errorMsg);
      notify.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPartners = () => {
    let filtered = partners;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query)
      );
    }

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(p => p.city === selectedCity);
    }

    setFilteredPartners(filtered);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#0D7C7C] font-600 hover:text-[#004B87] transition-colors mb-6"
        >
          <FaArrowLeft /> Back to Home
        </button>
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">
          Lab Partners
        </h1>
        <p className="text-gray-600 mt-2">Find and connect with our trusted laboratory partners</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-600">{error}</p>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="mb-8 bg-white border-2 border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-600 text-gray-700 mb-2 uppercase">
              Search Lab Partners
            </label>
            <input
              type="text"
              placeholder="Search by name, city, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#0D7C7C] focus:outline-none transition-colors"
            />
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-600 text-gray-700 mb-2 uppercase">
              Filter by City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#0D7C7C] focus:outline-none transition-colors"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-sm text-gray-600">
        Showing <span className="font-bold text-gray-900">{filteredPartners.length}</span> lab partner{filteredPartners.length !== 1 ? 's' : ''}
      </div>

      {/* Lab Partners Grid */}
      {filteredPartners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredPartners.map((partner) => (
            <div key={partner.id} className="bg-white border-2 border-gray-200 rounded-lg hover:shadow-lg hover:border-[#0D7C7C] transition-all overflow-hidden">
              {/* Header with rating */}
              <div className="bg-gradient-to-r from-[#0D7C7C] to-[#004B87] text-white p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-black text-sm uppercase tracking-wider">{partner.name}</h3>
                  {partner.rating && (
                    <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                      <FaStar className="text-yellow-300 text-xs" />
                      <span className="text-xs font-600">{partner.rating}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-[#0D7C7C] text-sm flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs font-600 text-gray-600 opacity-70 uppercase">Location</p>
                    <p className="text-sm text-gray-700">{partner.address}</p>
                    <p className="text-xs text-gray-600">{partner.city}, {partner.state} {partner.pincode}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-[#0D7C7C] text-sm flex-shrink-0" />
                    <a href={`tel:${partner.phone}`} className="text-sm text-[#0D7C7C] hover:text-[#004B87] transition-colors">
                      {partner.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-[#0D7C7C] text-sm flex-shrink-0" />
                    <a href={`mailto:${partner.email}`} className="text-sm text-[#0D7C7C] hover:text-[#004B87] transition-colors">
                      {partner.email}
                    </a>
                  </div>
                </div>

                {/* Services */}
                {partner.servicesOffered && partner.servicesOffered.length > 0 && (
                  <div>
                    <p className="text-xs font-600 text-gray-600 opacity-70 uppercase mb-2">Services</p>
                    <div className="flex flex-wrap gap-2">
                      {partner.servicesOffered.slice(0, 3).map((service, idx) => (
                        <span key={idx} className="inline-block px-2 py-1 bg-[#F0F9F9] border border-[#0D7C7C] text-[#0D7C7C] text-xs font-600 rounded">
                          {service}
                        </span>
                      ))}
                      {partner.servicesOffered.length > 3 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-600 rounded">
                          +{partner.servicesOffered.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Operating Hours */}
                {partner.openingHours && partner.closingHours && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs font-600 text-gray-600 opacity-70 uppercase">Hours</p>
                    <p className="text-sm text-gray-700">{partner.openingHours} - {partner.closingHours}</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => notify.info(`Booking from ${partner.name} - Coming soon!`)}
                  className="w-full px-4 py-2 bg-[#0D7C7C] text-white font-600 rounded-lg hover:bg-[#0a6666] transition-colors text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FaMapMarkerAlt className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-600 text-gray-900 mb-2">No Lab Partners Found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedCity ? 'Try adjusting your search or filter criteria' : 'Check back soon for lab partner locations'}
          </p>
          {(searchQuery || selectedCity) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('');
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0D7C7C] text-white font-600 rounded-lg hover:bg-[#0a6666] transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Back Button */}
      <div className="pt-8 border-t border-gray-200">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-gradient-to-r from-[#0D7C7C] to-[#004B87] text-white font-600 rounded-lg hover:shadow-lg transition-all"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default LabPartnerPage;

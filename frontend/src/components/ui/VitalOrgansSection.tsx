import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VITAL_ORGANS } from '../../constants/labTests';
import PremiumCategoryCard from './PremiumCategoryCard';

const toSlug = (cat: string) =>
  cat.toLowerCase().replace(/[\s'/]+/g, '-').replace(/[^\w-]/g, '');

const VitalOrgansSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* Grid matching Expert-Curated Screenings style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
        {VITAL_ORGANS.slice(0, 8).map((item) => (
          <PremiumCategoryCard key={item.slug} item={item} />
        ))}
      </div>
    </div>
  );
};

export default VitalOrgansSection;

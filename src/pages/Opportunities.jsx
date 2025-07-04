import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import AssetCard from '../components/AssetCard';
import { getAssetsByType } from '../data/assets';
import { motion } from 'framer-motion';

const Opportunities = () => {
  const { t } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const assets = getAssetsByType(selectedFilter);

  const filters = [
    { key: 'all', label: t('opportunities.filter.all') },
    { key: 'equipment', label: t('opportunities.filter.equipment') },
    { key: 'airbnb', label: t('opportunities.filter.airbnb') },
    { key: 'business', label: t('opportunities.filter.business') }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('opportunities.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explora todas las oportunidades de inversión disponibles
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Assets Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {assets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              layout
            >
              <AssetCard asset={asset} />
            </motion.div>
          ))}
        </motion.div>

        {assets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No se encontraron activos para el filtro seleccionado
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Opportunities;
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import AssetCard from '../components/AssetCard';
import { getAssetsByType } from '../data/assets';
import { motion } from 'framer-motion';

const Opportunities = () => {
  const { t } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, [selectedFilter]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const assetsData = await getAssetsByType(selectedFilter);
      setAssets(assetsData);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { key: 'all', label: t('opportunities.filter.all') },
    { key: 'equipment', label: t('opportunities.filter.equipment') },
    { key: 'airbnb', label: t('opportunities.filter.airbnb') },
    { key: 'business', label: t('opportunities.filter.business') }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('opportunities.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
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
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Assets Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 dark:bg-gray-700 rounded-xl h-64"></div>
                <div className="mt-4 space-y-2">
                  <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        )}

        {!loading && assets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No se encontraron activos para el filtro seleccionado
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Opportunities;
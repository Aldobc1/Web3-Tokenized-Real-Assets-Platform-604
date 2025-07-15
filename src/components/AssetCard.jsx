import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { subscribeToAssetSales } from '../services/assetService';

const { FiTrendingUp, FiPercent } = FiIcons;

const AssetCard = ({ asset }) => {
  const { t, language } = useLanguage();
  const [saleProgress, setSaleProgress] = useState({
    sold: asset?.sold || 0,
    totalSupply: asset?.totalSupply || 1000000,
    available: Math.max(0, (asset?.totalSupply || 1000000) - (asset?.sold || 0))
  });

  useEffect(() => {
    if (asset?.id) {
      const unsubscribe = subscribeToAssetSales(asset.id, (progress) => {
        setSaleProgress(progress);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [asset?.id]);

  const getAssetName = () => {
    return language === 'es' ? asset?.name : asset?.nameEn;
  };

  if (!asset) return null;

  return (
    <Link to={`/asset/${asset.id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="aspect-video overflow-hidden">
          <img
            src={asset.image}
            alt={getAssetName()}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {t(`asset.${asset.type}`)}
            </span>
            <span className="text-sm font-medium text-gray-600">
              ${asset.tokenPrice}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {getAssetName()}
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">{t('asset.projectedReturn')}</span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {asset.projectedReturn}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiPercent} className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">{t('asset.available')}</span>
              </div>
              <span className="text-sm font-medium text-blue-600">
                {Math.round((saleProgress.available / saleProgress.totalSupply) * 100)}%
              </span>
            </div>
          </div>

          <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.round((saleProgress.sold / saleProgress.totalSupply) * 100)}%`
              }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Vendido: {saleProgress.sold.toLocaleString()}</span>
            <span>Disponible: {saleProgress.available.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AssetCard;
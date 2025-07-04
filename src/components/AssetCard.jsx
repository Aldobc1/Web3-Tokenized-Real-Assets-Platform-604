import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiTrendingUp, FiPercent } = FiIcons;

const AssetCard = ({ asset }) => {
  const { t, language } = useLanguage();

  const getAssetName = (asset) => {
    return language === 'es' ? asset.name : asset.nameEn;
  };

  const getAssetTypeName = (type) => {
    return t(`asset.${type}`);
  };

  return (
    <Link to={`/asset/${asset.id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden">
        <div className="aspect-video overflow-hidden">
          <img
            src={asset.image}
            alt={getAssetName(asset)}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {getAssetTypeName(asset.type)}
            </span>
            <span className="text-sm font-medium text-gray-600">
              ${asset.tokenPrice}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {getAssetName(asset)}
          </h3>
          
          <div className="space-y-2">
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
                {asset.available}%
              </span>
            </div>
          </div>
          
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${asset.sold}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{t('asset.sold')}: {asset.sold}%</span>
            <span>{t('asset.available')}: {asset.available}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AssetCard;
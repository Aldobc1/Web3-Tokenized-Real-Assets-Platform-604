import React from 'react';
import { Link } from 'react-router-dom';
import SafeIcon from './SafeIcon';
import { FiTrendingUp, FiPercent } from 'react-icons/fi';

const AssetCard = ({ asset }) => {
  const totalSupply = asset.totalSupply || 1000000;
  const sold = asset.sold || 0;
  const availableTokens = Math.max(0, totalSupply - sold);
  const availablePercentage = Math.round((availableTokens / totalSupply) * 100);
  const soldPercentage = 100 - availablePercentage;

  return (
    <Link to={`/asset/${asset.id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="aspect-video overflow-hidden">
          <img 
            src={asset.image} 
            alt={asset.name} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
          />
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
              {asset.type}
            </span>
            <span className="text-sm font-medium text-gray-600">${asset.tokenPrice}</span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{asset.name}</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Proyectado</span>
              </div>
              <span className="text-sm font-medium text-green-600">{asset.projectedReturn}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiPercent} className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Disponible</span>
              </div>
              <span className="text-sm font-medium text-blue-600">{availablePercentage}%</span>
            </div>
          </div>
          
          <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${soldPercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Vendido: {sold.toLocaleString()}</span>
            <span>Disponible: {availableTokens.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AssetCard;
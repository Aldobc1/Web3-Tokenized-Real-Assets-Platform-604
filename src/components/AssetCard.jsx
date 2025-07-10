import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getOperatorById, getOperatorAverageRating } from '../data/operators';
import OperatorModal from './OperatorModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiTrendingUp, FiPercent, FiStar, FiUser } = FiIcons;

const AssetCard = ({ asset }) => {
  const { t, language } = useLanguage();
  const { userProfile } = useWeb3();
  const [operatorRating, setOperatorRating] = useState(0);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [operator, setOperator] = useState(null);

  useEffect(() => {
    if (asset.operatorId) {
      loadOperator();
      loadOperatorRating();
    }
  }, [asset.operatorId]);

  const loadOperator = async () => {
    try {
      const op = await getOperatorById(asset.operatorId);
      setOperator(op);
    } catch (error) {
      console.error('Error loading operator:', error);
    }
  };

  const loadOperatorRating = async () => {
    try {
      const rating = await getOperatorAverageRating(asset.operatorId);
      setOperatorRating(rating);
    } catch (error) {
      console.error('Error loading operator rating:', error);
    }
  };

  const getAssetName = (asset) => {
    return language === 'es' ? asset.name : asset.nameEn;
  };

  const getAssetTypeName = (type) => {
    return t(`asset.${type}`);
  };

  // Calculate available tokens and percentages based on total supply and tokens sold
  const totalSupply = asset.totalSupply || 1000000;
  const sold = asset.sold || 0;
  const availableTokens = Math.max(0, totalSupply - sold);
  const availablePercentage = Math.round((availableTokens / totalSupply) * 100);
  const soldPercentage = 100 - availablePercentage;

  const handleOperatorClick = (e) => {
    e.preventDefault();
    if (operator) {
      setShowOperatorModal(true);
    }
  };

  return (
    <>
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

            {operator && (
              <div 
                className="flex items-center mb-3 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                onClick={handleOperatorClick}
              >
                <div className="flex-shrink-0 w-6 h-6 mr-2 rounded-full overflow-hidden">
                  {operator.profile_image ? (
                    <img 
                      src={operator.profile_image} 
                      alt={operator.name}
                      className="w-6 h-6 object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iI2U1ZTdlYiIvPjxwYXRoIGQ9Ik04IDEzLjVDOCAxMS41NjcgOS41NjcgMTAgMTEuNSAxMEMxMy40MzMgMTAgMTUgMTEuNTY3IDE1IDEzLjVWMTRIMThWMTMuNUMxOCAxMC43MzkgMTYuNzYxIDguMjMgMTQuODI2IDYuODhDMTMuNzE2IDYuMTQxIDEyLjM5MSA1LjcxNCAxMSA1LjcxNEM5LjYwOSA1LjcxNCA4LjI4NCA2LjE0MSA3LjE3NCA2Ljg4QzUuMjM5IDguMjMgNiAxMC43MzkgNCAxMy41VjE0SDdWMTMuNUg4WiIgZmlsbD0iIzk0YTNiOCIvPjwvc3ZnPg==';
                      }}
                    />
                  ) : (
                    <SafeIcon icon={FiUser} className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <span>{language === 'es' ? operator.name : operator.nameEn}</span>
                {operatorRating > 0 && (
                  <div className="flex items-center ml-2">
                    <SafeIcon icon={FiStar} className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="ml-1">{operatorRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            )}

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
                  {availablePercentage}%
                </span>
              </div>
            </div>

            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${soldPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Vendido: {sold.toLocaleString()} ({soldPercentage}%)</span>
              <span>Disponible: {availableTokens.toLocaleString()} ({availablePercentage}%)</span>
            </div>
          </div>
        </div>
      </Link>

      {showOperatorModal && operator && (
        <OperatorModal
          operator={operator}
          onClose={() => setShowOperatorModal(false)}
          userId={userProfile?.id}
        />
      )}
    </>
  );
};

export default AssetCard;
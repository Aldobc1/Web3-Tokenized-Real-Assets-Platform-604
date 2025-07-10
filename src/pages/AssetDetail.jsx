import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getAssetById } from '../data/assets';
import { getOperatorById } from '../data/operators';
import { getHoldingByContract, updateContractHoldings } from '../services/smartContractService';
import PerformanceChart from '../components/PerformanceChart';
import OperatorModal from '../components/OperatorModal';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {
  FiArrowLeft,
  FiTrendingUp,
  FiPercent,
  FiDollarSign,
  FiUser,
  FiFileText,
  FiStar,
  FiMapPin,
  FiCheck,
  FiX
} = FiIcons;

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isConnected, account, userProfile } = useWeb3();
  
  const [asset, setAsset] = useState(null);
  const [operator, setOperator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userHoldings, setUserHoldings] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionProcessing, setTransactionProcessing] = useState(false);

  useEffect(() => {
    loadAsset();
  }, [id]);

  useEffect(() => {
    if (asset && account) {
      loadUserHoldings();
    }
  }, [asset, account]);

  const loadAsset = async () => {
    try {
      setLoading(true);
      const assetData = await getAssetById(id);
      if (!assetData) {
        navigate('/opportunities');
        return;
      }
      setAsset(assetData);
      
      if (assetData.operatorId) {
        const operatorData = await getOperatorById(assetData.operatorId);
        setOperator(operatorData);
      }
    } catch (error) {
      console.error('Error loading asset:', error);
      navigate('/opportunities');
    } finally {
      setLoading(false);
    }
  };

  const loadUserHoldings = async () => {
    try {
      if (!account || !asset?.contractAddress) return;
      const holding = await getHoldingByContract(account, asset.contractAddress, parseInt(id));
      setUserHoldings(holding.tokens || 0);
    } catch (error) {
      console.error('Error loading user holdings:', error);
      setUserHoldings(0);
    }
  };

  const handleBuyTokens = () => {
    if (!isConnected) {
      alert('Por favor conecta tu wallet primero');
      return;
    }
    
    if (!userProfile) {
      alert('Por favor completa tu registro primero');
      return;
    }

    setShowContractModal(true);
  };

  const completeTransaction = async () => {
    try {
      setTransactionProcessing(true);

      // Verificar que tengamos la dirección del contrato
      if (!asset.contractAddress) {
        throw new Error('No hay dirección de contrato asociada a este activo');
      }

      // Obtener los holdings actuales para este contrato específico
      const currentHolding = await getHoldingByContract(account, asset.contractAddress, parseInt(id));
      const currentTokens = currentHolding?.tokens || 0;

      // Calcular los nuevos tokens totales
      const newTotalTokens = currentTokens + quantity;

      // Actualizar los holdings para este contrato específico
      await updateContractHoldings(
        asset.contractAddress,
        account,
        parseInt(id),
        newTotalTokens
      );

      // Actualizar el estado local
      setUserHoldings(newTotalTokens);
      setShowSuccessModal(true);
      setShowContractModal(false);

      // Recargar el asset para mostrar los cambios
      await loadAsset();
    } catch (error) {
      console.error('Error en la transacción:', error);
      setErrorMessage('Error al procesar la compra: ' + (error.message || error));
      setShowErrorModal(true);
    } finally {
      setTransactionProcessing(false);
    }
  };

  const getAssetName = (asset) => {
    return language === 'es' ? asset.name : asset.nameEn;
  };

  const getAssetDescription = (asset) => {
    return language === 'es' ? asset.description : asset.descriptionEn;
  };

  const getOperatorName = (operator) => {
    return language === 'es' ? operator.name : operator.nameEn;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Activo no encontrado
          </h2>
          <Link
            to="/opportunities"
            className="text-yellow-600 hover:text-yellow-500"
          >
            Volver a oportunidades
          </Link>
        </div>
      </div>
    );
  }

  const totalSupply = asset.totalSupply || 1000000;
  const sold = asset.sold || 0;
  const availableTokens = Math.max(0, totalSupply - sold);
  const availablePercentage = Math.round((availableTokens / totalSupply) * 100);
  const soldPercentage = 100 - availablePercentage;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/opportunities')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-yellow-600 mb-6 transition-colors"
        >
          <SafeIcon icon={FiArrowLeft} className="w-5 h-5 mr-2" />
          Volver a oportunidades
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Asset Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="aspect-video">
                <img
                  src={asset.image}
                  alt={getAssetName(asset)}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                    {t(`asset.${asset.type}`)}
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${asset.tokenPrice}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {getAssetName(asset)}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {getAssetDescription(asset)}
                </p>
              </div>
            </motion.div>

            {/* Performance Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PerformanceChart assetId={asset.id} />
            </motion.div>

            {/* Operator Information */}
            {operator && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('asset.operatorData')}
                </h3>
                <div
                  className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-4 rounded-lg transition-colors"
                  onClick={() => setShowOperatorModal(true)}
                >
                  <div className="flex-shrink-0 w-12 h-12 mr-4 rounded-full overflow-hidden">
                    {operator.profile_image ? (
                      <img
                        src={operator.profile_image}
                        alt={getOperatorName(operator)}
                        className="w-12 h-12 object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyNCIgZmlsbD0iI2U1ZTdlYiIvPjxwYXRoIGQ9Ik0xNiAyN0MxNiAyMy4xMzQgMTkuMTM0IDIwIDIzIDIwQzI2Ljg2NiAyMCAzMCAyMy4xMzQgMzAgMjdWMjhIMzRWMjdDMzQgMjEuNDc4IDMxLjUyMiAxNi40NiAyOS42NTIgMTMuNzZDMjcuNDMyIDEyLjI4MiAyNC43ODIgMTEuNDI4IDIyIDExLjQyOEMxOS4yMTggMTEuNDI4IDE2LjU2OCAxMi4yODIgMTQuMzQ4IDEzLjc2QzEwLjQ3OCAxNi40NiA4IDIxLjQ3OCA4IDI3VjI4SDEyVjI3SDE2WiIgZmlsbD0iIzk0YTNiOCIvPjwvc3ZnPg==';
                        }}
                      />
                    ) : (
                      <SafeIcon icon={FiUser} className="w-12 h-12 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {getOperatorName(operator)}
                    </h4>
                    <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                      <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-1" />
                      <span>{operator.location || 'Ubicación no especificada'}</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <SafeIcon
                            key={star}
                            icon={FiStar}
                            className="w-4 h-4 text-yellow-400 fill-current"
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        4.8 (24 reseñas)
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Estadísticas de Inversión
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SafeIcon icon={FiTrendingUp} className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {t('asset.projectedReturn')}
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-green-600">
                    {asset.projectedReturn}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SafeIcon icon={FiPercent} className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {t('asset.available')}
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-blue-600">
                    {availablePercentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {t('asset.tokenPrice')}
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${asset.tokenPrice}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <span>Progreso de venta</span>
                  <span>{soldPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${soldPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Vendido: {sold.toLocaleString()}</span>
                  <span>Disponible: {availableTokens.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>

            {/* My Holdings */}
            {account && userHoldings > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('asset.myHoldings')}
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {userHoldings.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    tokens (${(userHoldings * asset.tokenPrice).toLocaleString()})
                  </div>
                </div>
              </motion.div>
            )}

            {/* Buy Tokens */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Comprar Tokens
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('asset.buyQuantity')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={availableTokens}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Total:</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${(quantity * asset.tokenPrice).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleBuyTokens}
                  disabled={availableTokens === 0}
                  className="w-full bg-yellow-500 text-black py-3 px-4 rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {availableTokens === 0 ? 'Agotado' : t('asset.buy')}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      {showContractModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Confirmar Compra
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Activo:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getAssetName(asset)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Cantidad:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {quantity.toLocaleString()} tokens
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Precio por token:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${asset.tokenPrice}
                </span>
              </div>
              <hr className="border-gray-200 dark:border-gray-600" />
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-yellow-600">
                  ${(quantity * asset.tokenPrice).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowContractModal(false)}
                disabled={transactionProcessing}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={completeTransaction}
                disabled={transactionProcessing}
                className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {transactionProcessing ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiCheck} className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                ¡Compra Exitosa!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Has comprado {quantity} tokens de {getAssetName(asset)} exitosamente.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-yellow-500 text-black py-3 px-4 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiX} className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Error en la Transacción
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {errorMessage}
              </p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operator Modal */}
      {showOperatorModal && operator && (
        <OperatorModal
          operator={operator}
          onClose={() => setShowOperatorModal(false)}
          userId={userProfile?.id}
        />
      )}
    </div>
  );
};

export default AssetDetail;
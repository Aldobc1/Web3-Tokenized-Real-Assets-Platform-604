import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getAssetById } from '../data/assets';
import { getOperatorById } from '../data/operators';
import { getHoldingByContract, updateContractHoldings } from '../services/smartContractService';
import { getAssetDocumentsByType } from '../services/assetDocumentService';
import { getOperatorAverageRating } from '../services/operatorService';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

// Import the component sections
import MarketplaceSection from '../components/MarketplaceSection';
import ClaimsHistorySection from '../components/ClaimsHistorySection';
import DueDiligenceSection from '../components/DueDiligenceSection';
import OperatorModal from '../components/OperatorModal';

const {
  FiArrowLeft,
  FiDollarSign,
  FiTrendingUp,
  FiUser,
  FiShoppingCart,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiCopy,
  FiFileText,
  FiBarChart2,
  FiStar
} = FiIcons;

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isConnected, account, userProfile } = useWeb3();

  const [asset, setAsset] = useState(null);
  const [operator, setOperator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [userHoldings, setUserHoldings] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // New states
  const [activeTab, setActiveTab] = useState('overview');
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [documents, setDocuments] = useState(null);
  const [operatorRating, setOperatorRating] = useState(0);

  useEffect(() => {
    if (id) {
      loadAssetData();
    }
  }, [id]);

  const loadAssetData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load asset data
      const assetData = await getAssetById(parseInt(id));
      if (!assetData) {
        setError('Asset no encontrado');
        return;
      }

      setAsset(assetData);

      // Load operator data if available
      if (assetData.operatorId) {
        const operatorData = await getOperatorById(assetData.operatorId);
        setOperator(operatorData);

        // Load operator rating
        if (operatorData) {
          const rating = await getOperatorAverageRating(operatorData.id);
          setOperatorRating(rating);
        }
      }

      // Load user holdings if connected and has contract
      if (isConnected && account && assetData.contractAddress) {
        const holdings = await getHoldingByContract(account, assetData.contractAddress, parseInt(id));
        setUserHoldings(holdings?.tokens || 0);
      }

      // Load documents
      if (assetData.contractAddress) {
        const docsData = await getAssetDocumentsByType(parseInt(id));
        setDocuments(docsData);
      }
    } catch (error) {
      console.error('Error loading asset:', error);
      setError('Error al cargar el asset');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isConnected) {
      navigate('/login');
      return;
    }

    if (!asset.contractAddress) {
      setErrorMessage('Este asset no tiene un contrato inteligente asociado');
      setShowErrorModal(true);
      return;
    }

    if (quantity <= 0) {
      setErrorMessage('La cantidad debe ser mayor a 0');
      setShowErrorModal(true);
      return;
    }

    if (quantity > asset.available) {
      setErrorMessage('No hay suficientes tokens disponibles');
      setShowErrorModal(true);
      return;
    }

    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    try {
      setIsProcessing(true);
      setShowPurchaseModal(false);

      // Simulate purchase process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update holdings
      const newTotalTokens = userHoldings + quantity;
      await updateContractHoldings(
        asset.contractAddress,
        account,
        parseInt(id),
        newTotalTokens
      );

      setUserHoldings(newTotalTokens);

      // Update asset availability
      const newAsset = {
        ...asset,
        sold: (asset.sold || 0) + quantity,
        available: asset.available - quantity
      };
      setAsset(newAsset);

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error en la compra:', error);
      setErrorMessage('Error al procesar la compra: ' + (error.message || 'Error desconocido'));
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const getAssetName = () => {
    if (!asset) return '';
    return language === 'es' ? asset.name : asset.nameEn;
  };

  const getAssetDescription = () => {
    if (!asset) return '';
    return language === 'es' ? asset.description : asset.descriptionEn;
  };

  const getOperatorName = () => {
    if (!operator) return '';
    return language === 'es' ? operator.name : operator.nameEn;
  };

  const handleListingComplete = () => {
    // Reload asset data to refresh availability
    loadAssetData();
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copiado al portapapeles');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Asset no encontrado'}
          </h2>
          <button
            onClick={() => navigate('/opportunities')}
            className="bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Volver a Oportunidades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/opportunities')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <SafeIcon icon={FiArrowLeft} className="w-5 h-5 mr-2" />
          Volver a Oportunidades
        </button>

        {/* Asset Header - Made image larger */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Larger image container */}
            <div className="lg:col-span-1">
              <img
                src={asset.image}
                alt={getAssetName()}
                className="w-full h-80 lg:h-96 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=Asset+Image';
                }}
              />
            </div>
            <div className="lg:col-span-1 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  {t(`asset.${asset.type}`)}
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${asset.tokenPrice}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {getAssetName()}
              </h1>

              {/* Asset Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center">
                    <SafeIcon icon={FiTrendingUp} className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {t('asset.projectedReturn')}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-green-600 mt-1">
                    {asset.projectedReturn}%
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center">
                    <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Precio por Token
                    </span>
                  </div>
                  <p className="text-xl font-bold text-blue-600 mt-1">
                    ${asset.tokenPrice}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center">
                    <SafeIcon icon={FiBarChart2} className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Total Supply
                    </span>
                  </div>
                  <p className="text-xl font-bold text-purple-600 mt-1">
                    {asset.totalSupply.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center">
                    <SafeIcon icon={FiFileText} className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Smart Contract
                    </span>
                  </div>
                  {asset.contractAddress ? (
                    <div className="flex items-center mt-1">
                      <span className="text-xs font-mono text-yellow-600 truncate">
                        {asset.contractAddress.slice(0, 6)}...{asset.contractAddress.slice(-4)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(asset.contractAddress)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <SafeIcon icon={FiCopy} className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">No disponible</p>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <span>Progreso de venta</span>
                  <span>{Math.round(((asset.sold || 0) / (asset.totalSupply || 1000000)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round(
                        ((asset.sold || 0) / (asset.totalSupply || 1000000)) * 100
                      )}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Vendido: {(asset.sold || 0).toLocaleString()}</span>
                  <span>Disponible: {(asset.available || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Operator Info */}
              {operator && (
                <div
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setShowOperatorModal(true)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {operator.profile_image ? (
                          <img
                            src={operator.profile_image}
                            alt={getOperatorName()}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/40?text=OP';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <SafeIcon icon={FiUser} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('asset.operator')}: {getOperatorName()}
                        </p>
                        <div className="flex items-center">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <SafeIcon
                                key={star}
                                icon={FiStar}
                                className={`w-4 h-4 ${
                                  star <= operatorRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-1 text-xs text-gray-500">
                            {operatorRating > 0 ? operatorRating.toFixed(1) : 'Sin calificaciones'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-blue-600">Ver detalles</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-yellow-500 text-black'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Descripción
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'marketplace'
                ? 'bg-yellow-500 text-black'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab('dueDiligence')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'dueDiligence'
                ? 'bg-yellow-500 text-black'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Due Diligence
          </button>
          {isConnected && (
            <button
              onClick={() => setActiveTab('claims')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'claims'
                  ? 'bg-yellow-500 text-black'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Claims
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Descripción
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {getAssetDescription()}
                </p>

                {userHoldings > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                      {t('asset.myHoldings')}
                    </h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {userHoldings.toLocaleString()} tokens
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Valor: ${(userHoldings * asset.tokenPrice).toLocaleString()}
                        </p>
                      </div>
                      {activeTab !== 'marketplace' && (
                        <button
                          onClick={() => setActiveTab('marketplace')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Ir al Marketplace
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'marketplace' && (
              <MarketplaceSection
                asset={asset}
                userHoldings={userHoldings}
                userWallet={account}
                onListingComplete={handleListingComplete}
              />
            )}

            {activeTab === 'dueDiligence' && (
              <DueDiligenceSection asset={asset} documents={documents} />
            )}

            {activeTab === 'claims' && isConnected && (
              <ClaimsHistorySection assetId={asset.id} userWallet={account} />
            )}
          </div>

          {/* Purchase Section (Right Sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Comprar Tokens
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('asset.buyQuantity')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={asset.available}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Total a pagar:</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${(quantity * asset.tokenPrice).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={!isConnected || quantity <= 0 || quantity > asset.available}
                  className="w-full bg-yellow-500 text-black py-4 rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <SafeIcon icon={FiShoppingCart} className="w-5 h-5 mr-2" />
                  {!isConnected ? 'Conectar Wallet' : t('asset.buy')}
                </button>

                {!isConnected && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Debes conectar tu wallet para comprar tokens
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirmar Compra
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Asset:</span>
                <span className="font-medium text-gray-900 dark:text-white">{getAssetName()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Cantidad:</span>
                <span className="font-medium text-gray-900 dark:text-white">{quantity} tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Total:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${(quantity * asset.tokenPrice).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPurchase}
                className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Procesando Compra
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Por favor espera mientras procesamos tu transacción...
            </p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiCheck} className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ¡Compra Exitosa!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Has comprado {quantity} tokens de {getAssetName()}
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-yellow-500 text-black py-3 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full mx-4 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiAlertCircle} className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Error en la Compra
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {errorMessage}
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              Cerrar
            </button>
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
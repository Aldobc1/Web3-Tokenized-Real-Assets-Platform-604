import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getAssetById } from '../data/assets';
import PerformanceChart from '../components/PerformanceChart';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiDownload, FiUser, FiTrendingUp, FiPercent, FiDollarSign } = FiIcons;

const AssetDetail = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { isConnected, isRegistered, account } = useWeb3();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('initial');

  const asset = getAssetById(id);

  if (!asset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Activo no encontrado</h1>
          <Link to="/opportunities" className="text-primary-600 hover:text-primary-700">
            Volver a oportunidades
          </Link>
        </div>
      </div>
    );
  }

  const getAssetName = (asset) => {
    return language === 'es' ? asset.name : asset.nameEn;
  };

  const getAssetDescription = (asset) => {
    return language === 'es' ? asset.description : asset.descriptionEn;
  };

  const getOperatorName = (asset) => {
    return language === 'es' ? asset.operator : asset.operatorEn;
  };

  const getUserHoldings = () => {
    if (!account) return 0;
    const holdings = localStorage.getItem(`holdings_${account}_${asset.id}`);
    return holdings ? parseInt(holdings) : 0;
  };

  const handlePurchase = () => {
    if (!isConnected || !isRegistered) {
      alert('Debes conectar tu wallet y completar el registro');
      return;
    }

    const currentHoldings = getUserHoldings();
    const newHoldings = currentHoldings + quantity;
    localStorage.setItem(`holdings_${account}_${asset.id}`, newHoldings.toString());
    
    alert(`¡Compra exitosa! Has adquirido ${quantity} tokens de ${getAssetName(asset)}`);
    setQuantity(1);
  };

  const userHoldings = getUserHoldings();
  const totalValue = userHoldings * asset.tokenPrice;

  const tabs = [
    { id: 'initial', label: 'Venta Inicial' },
    { id: 'holdings', label: t('asset.myHoldings') },
    { id: 'diligence', label: t('asset.dueDiligence') },
    { id: 'performance', label: t('asset.historicalPerformance') }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/opportunities"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <SafeIcon icon={FiArrowLeft} className="w-4 h-4 mr-2" />
          Volver a oportunidades
        </Link>

        {/* Asset Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="aspect-video md:aspect-[3/1] overflow-hidden">
            <img
              src={asset.image}
              alt={getAssetName(asset)}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {getAssetName(asset)}
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {t(`asset.${asset.type}`)}
                </span>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <SafeIcon icon={FiTrendingUp} className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">{t('asset.projectedReturn')}</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {asset.projectedReturn}%
                  </span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <SafeIcon icon={FiPercent} className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">{t('asset.available')}</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {asset.available}%
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-lg leading-relaxed">
              {getAssetDescription(asset)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'initial' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Información de Venta</h3>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('asset.tokenPrice')}</span>
                        <span className="font-semibold text-lg">${asset.tokenPrice}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('asset.sold')}</span>
                        <span className="font-semibold text-lg">{asset.sold}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('asset.available')}</span>
                        <span className="font-semibold text-lg">{asset.available}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('asset.operator')}</span>
                        <span className="font-semibold">{getOperatorName(asset)}</span>
                      </div>
                    </div>

                    <div className="bg-gray-200 rounded-full h-3 mb-6">
                      <div
                        className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${asset.sold}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-6">Realizar Compra</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('asset.buyQuantity')}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Precio por token</span>
                          <span className="font-semibold">${asset.tokenPrice}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Cantidad</span>
                          <span className="font-semibold">{quantity}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-lg">${quantity * asset.tokenPrice}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={handlePurchase}
                        disabled={!isConnected || !isRegistered}
                        className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {!isConnected ? 'Conectar Wallet' : !isRegistered ? 'Completar Registro' : t('asset.buy')}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'holdings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="text-xl font-semibold mb-6">{t('asset.myHoldings')}</h3>
                
                {!isConnected ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Conecta tu wallet para ver tus holdings</p>
                    <Link
                      to="/login"
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      Conectar Wallet
                    </Link>
                  </div>
                ) : userHoldings === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No tienes holdings en este activo</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <SafeIcon icon={FiDollarSign} className="w-6 h-6 text-primary-600 mr-2" />
                        <span className="text-sm text-gray-600">Tokens Poseídos</span>
                      </div>
                      <span className="text-2xl font-bold text-primary-600">
                        {userHoldings}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-green-600 mr-2" />
                        <span className="text-sm text-gray-600">Valor Total</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        ${totalValue}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <SafeIcon icon={FiPercent} className="w-6 h-6 text-blue-600 mr-2" />
                        <span className="text-sm text-gray-600">Participación</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">
                        {((userHoldings * asset.tokenPrice) / (asset.tokenPrice * 100) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'diligence' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="text-xl font-semibold mb-6">{t('asset.dueDiligence')}</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-medium mb-4">{t('asset.documents')}</h4>
                    <div className="space-y-3">
                      {asset.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">
                            {language === 'es' ? doc.name : doc.nameEn}
                          </span>
                          <button className="text-primary-600 hover:text-primary-700">
                            <SafeIcon icon={FiDownload} className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium mb-4">{t('asset.operatorData')}</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-4">
                        <SafeIcon icon={FiUser} className="w-6 h-6 text-primary-600 mr-3" />
                        <span className="font-semibold">{asset.operatorData.name}</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Experiencia</span>
                          <span className="font-medium">
                            {language === 'es' ? asset.operatorData.experience : asset.operatorData.experienceEn}
                          </span>
                        </div>
                        
                        {asset.operatorData.projects && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Proyectos</span>
                            <span className="font-medium">
                              {language === 'es' ? asset.operatorData.projects : asset.operatorData.projectsEn}
                            </span>
                          </div>
                        )}
                        
                        {asset.operatorData.properties && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Propiedades</span>
                            <span className="font-medium">
                              {language === 'es' ? asset.operatorData.properties : asset.operatorData.propertiesEn}
                            </span>
                          </div>
                        )}
                        
                        {asset.operatorData.equipment && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Equipos</span>
                            <span className="font-medium">
                              {language === 'es' ? asset.operatorData.equipment : asset.operatorData.equipmentEn}
                            </span>
                          </div>
                        )}
                        
                        {asset.operatorData.restaurants && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Restaurantes</span>
                            <span className="font-medium">
                              {language === 'es' ? asset.operatorData.restaurants : asset.operatorData.restaurantsEn}
                            </span>
                          </div>
                        )}
                        
                        {asset.operatorData.locations && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ubicaciones</span>
                            <span className="font-medium">
                              {language === 'es' ? asset.operatorData.locations : asset.operatorData.locationsEn}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h4 className="text-lg font-medium mb-4">Información Detallada</h4>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {getAssetDescription(asset)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'performance' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="text-xl font-semibold mb-6">{t('asset.historicalPerformance')}</h3>
                <PerformanceChart assetId={asset.id} />
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <span className="text-sm text-gray-600">Rendimiento YTD</span>
                    <div className="text-xl font-bold text-green-600">+12.5%</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <span className="text-sm text-gray-600">Rendimiento 1Y</span>
                    <div className="text-xl font-bold text-green-600">+18.3%</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <span className="text-sm text-gray-600">Volatilidad</span>
                    <div className="text-xl font-bold text-blue-600">8.2%</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <span className="text-sm text-gray-600">Sharpe Ratio</span>
                    <div className="text-xl font-bold text-purple-600">1.45</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
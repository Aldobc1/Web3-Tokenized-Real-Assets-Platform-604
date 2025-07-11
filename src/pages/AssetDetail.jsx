import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import SafeIcon from '../components/SafeIcon';
import { FiArrowLeft, FiTrendingUp, FiPercent, FiDollarSign, FiCheck } from 'react-icons/fi';

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAssetById, user, buyTokens } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  
  const asset = getAssetById(parseInt(id));

  if (!asset) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Activo no encontrado</h2>
          <Link to="/opportunities" className="text-yellow-600 hover:text-yellow-500">
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

  const handleBuyTokens = () => {
    if (!user) {
      alert('Por favor inicia sesión primero');
      navigate('/login');
      return;
    }
    setShowModal(true);
  };

  const confirmPurchase = () => {
    try {
      buyTokens(asset.id, quantity);
      setShowModal(false);
      alert('¡Compra realizada exitosamente!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => navigate('/opportunities')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-yellow-600 mb-6"
        >
          <SafeIcon icon={FiArrowLeft} className="w-5 h-5 mr-2" />
          Volver a oportunidades
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="aspect-video">
                <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                    {asset.type}
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">${asset.tokenPrice}</span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{asset.name}</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">{asset.description}</p>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Stats */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estadísticas</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SafeIcon icon={FiTrendingUp} className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Retorno Proyectado</span>
                  </div>
                  <span className="text-lg font-semibold text-green-600">{asset.projectedReturn}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SafeIcon icon={FiPercent} className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Disponible</span>
                  </div>
                  <span className="text-lg font-semibold text-blue-600">{availablePercentage}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Precio Token</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">${asset.tokenPrice}</span>
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

            {/* Buy Tokens */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Comprar Tokens</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cantidad
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
                  <div className="flex justify-between items-center">
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
                  {availableTokens === 0 ? 'Agotado' : 'Comprar Tokens'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Confirmar Compra</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Activo:</span>
                <span className="font-medium text-gray-900 dark:text-white">{asset.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Cantidad:</span>
                <span className="font-medium text-gray-900 dark:text-white">{quantity.toLocaleString()} tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Precio por token:</span>
                <span className="font-medium text-gray-900 dark:text-white">${asset.tokenPrice}</span>
              </div>
              <hr className="border-gray-200 dark:border-gray-600" />
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-yellow-600">${(quantity * asset.tokenPrice).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPurchase}
                className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetail;
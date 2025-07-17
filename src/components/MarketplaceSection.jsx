import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { createListing, getActiveListings, purchaseListings } from '../services/marketplaceService';

const { FiDollarSign, FiShoppingCart, FiPlus, FiCheck, FiX, FiCopy, FiSave } = FiIcons;

const MarketplaceSection = ({ asset, userHoldings, userWallet, onListingComplete }) => {
  const [listings, setListings] = useState([]);
  const [showListingModal, setShowListingModal] = useState(false);
  const [selectedListings, setSelectedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listingForm, setListingForm] = useState({
    quantity: 1,
    pricePerToken: asset.tokenPrice
  });

  useEffect(() => {
    loadListings();
  }, [asset.id]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const activeListings = await getActiveListings(asset.id);
      
      // Sort listings by price (lowest first)
      const sortedListings = activeListings.sort((a, b) => a.price_per_token - b.price_per_token);
      
      setListings(sortedListings);
      console.log("Loaded listings:", sortedListings);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      await createListing(
        asset.id,
        userWallet,
        listingForm.quantity,
        listingForm.pricePerToken
      );
      setShowListingModal(false);
      loadListings();
      if (onListingComplete) onListingComplete();
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Error al crear el listado');
    }
  };

  const handlePurchaseSelected = async () => {
    try {
      if (selectedListings.length === 0) {
        alert('Por favor selecciona al menos un listado para comprar');
        return;
      }
      
      await purchaseListings(selectedListings.map(l => l.id), userWallet);
      setSelectedListings([]);
      loadListings();
      if (onListingComplete) onListingComplete();
    } catch (error) {
      console.error('Error purchasing listings:', error);
      alert('Error al comprar los tokens');
    }
  };

  const handleSelectListing = (listing, isChecked) => {
    if (isChecked) {
      setSelectedListings([...selectedListings, listing]);
    } else {
      setSelectedListings(selectedListings.filter(l => l.id !== listing.id));
    }
  };

  const totalPurchaseAmount = selectedListings.reduce((total, listing) => {
    return total + (listing.quantity * listing.price_per_token);
  }, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Marketplace
        </h2>
        {userHoldings > 0 && (
          <button
            onClick={() => setShowListingModal(true)}
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            Enlistar Tokens
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
        </div>
      ) : listings.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Los listados están ordenados desde el precio más bajo al más alto. Selecciona los listados que deseas comprar.
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Seleccionar
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vendedor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Precio/Token
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {listings.map((listing) => {
                  const isOwner = listing.seller_wallet === userWallet;
                  const isSelected = selectedListings.some(l => l.id === listing.id);
                  
                  return (
                    <tr 
                      key={listing.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        isSelected ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectListing(listing, e.target.checked)}
                          className="h-5 w-5 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded cursor-pointer"
                          disabled={isOwner}
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-mono text-gray-900 dark:text-white">
                            {`${listing.seller_wallet.slice(0, 6)}...${listing.seller_wallet.slice(-4)}`}
                          </span>
                          {isOwner && (
                            <span className="text-xs text-yellow-600 dark:text-yellow-400">
                              (Tu listado)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {listing.quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          ${listing.price_per_token}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${(listing.quantity * listing.price_per_token).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {selectedListings.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-yellow-400 dark:border-yellow-600"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Tokens seleccionados: <span className="font-medium">{selectedListings.reduce((total, l) => total + l.quantity, 0).toLocaleString()}</span>
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Total: <span className="text-green-600 dark:text-green-400">${totalPurchaseAmount.toLocaleString()}</span>
                  </p>
                </div>
                <button
                  onClick={handlePurchaseSelected}
                  className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 w-full md:w-auto justify-center"
                >
                  <SafeIcon icon={FiShoppingCart} className="w-4 h-4" />
                  Comprar Seleccionados
                </button>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <SafeIcon icon={FiDollarSign} className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            No hay tokens listados en el marketplace
          </p>
          {userHoldings > 0 && (
            <button
              onClick={() => setShowListingModal(true)}
              className="mt-3 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors inline-flex items-center gap-2"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              Sé el primero en enlistar tokens
            </button>
          )}
        </div>
      )}

      {/* Create Listing Modal */}
      {showListingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Enlistar Tokens
            </h3>
            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cantidad de Tokens
                </label>
                <input
                  type="number"
                  min="1"
                  max={userHoldings}
                  value={listingForm.quantity}
                  onChange={(e) => setListingForm({...listingForm, quantity: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Máximo disponible: {userHoldings} tokens
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio por Token
                </label>
                <input
                  type="number"
                  min={asset.min_listing_price || 0}
                  max={asset.max_listing_price || undefined}
                  step="0.01"
                  value={listingForm.pricePerToken}
                  onChange={(e) => setListingForm({...listingForm, pricePerToken: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Precio de referencia: ${asset.tokenPrice} (precio actual del token)
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <div className="flex justify-between text-sm text-yellow-800 dark:text-yellow-200">
                  <span>Total a recibir:</span>
                  <span className="font-bold">${(listingForm.quantity * listingForm.pricePerToken).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowListingModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                >
                  <SafeIcon icon={FiCheck} className="w-4 h-4" />
                  Crear Listado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceSection;
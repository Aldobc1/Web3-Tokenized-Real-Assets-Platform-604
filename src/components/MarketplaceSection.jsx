import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { createListing, getActiveListings, purchaseListings } from '../services/marketplaceService';

const {
  FiDollarSign,
  FiShoppingCart,
  FiPlus,
  FiCheck,
  FiX,
  FiCopy,
  FiSave
} = FiIcons;

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
      setListings(activeListings);
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
      await purchaseListings(selectedListings.map(l => l.id), userWallet);
      setSelectedListings([]);
      loadListings();
      if (onListingComplete) onListingComplete();
    } catch (error) {
      console.error('Error purchasing listings:', error);
      alert('Error al comprar los tokens');
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Seleccionar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {listings.map((listing) => (
                  <tr key={listing.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {`${listing.seller_wallet.slice(0, 6)}...${listing.seller_wallet.slice(-4)}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {listing.quantity}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${listing.price_per_token}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${(listing.quantity * listing.price_per_token).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedListings.some(l => l.id === listing.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedListings([...selectedListings, listing]);
                          } else {
                            setSelectedListings(selectedListings.filter(l => l.id !== listing.id));
                          }
                        }}
                        className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded"
                        disabled={listing.seller_wallet === userWallet}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedListings.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Tokens seleccionados: {selectedListings.reduce((total, l) => total + l.quantity, 0)}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Total: ${totalPurchaseAmount.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={handlePurchaseSelected}
                  className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                >
                  <SafeIcon icon={FiShoppingCart} className="w-4 h-4" />
                  Comprar Seleccionados
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No hay tokens listados en el marketplace
        </p>
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
                  onChange={(e) => setListingForm({
                    ...listingForm,
                    quantity: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                  required
                />
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
                  onChange={(e) => setListingForm({
                    ...listingForm,
                    pricePerToken: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Total a recibir:</span>
                  <span>${(listingForm.quantity * listingForm.pricePerToken).toLocaleString()}</span>
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
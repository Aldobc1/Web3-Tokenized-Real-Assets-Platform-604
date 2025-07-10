import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeb3 } from '../contexts/Web3Context';
import { motion } from 'framer-motion';
import TokenCreationForm from '../components/TokenCreationForm';
import SmartContractEditForm from '../components/SmartContractEditForm';
import { getSmartContracts, deleteSmartContract } from '../services/smartContractService';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiTrash2, FiCopy, FiCoins, FiX, FiEdit, FiFileText } = FiIcons;

const AdminSmartContracts = () => {
  const { t } = useLanguage();
  const { account } = useWeb3();
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadContracts();
  }, [refreshTrigger]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const contractsData = await getSmartContracts();
      setContracts(contractsData);
    } catch (error) {
      console.error('Error loading smart contracts:', error);
      alert('Error al cargar los smart contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenCreated = () => {
    // Refresh the contracts list by incrementing the trigger
    setRefreshTrigger(prev => prev + 1);
    setShowTokenForm(false);
  };

  const handleContractEdited = () => {
    // Refresh the contracts list and close edit form
    setRefreshTrigger(prev => prev + 1);
    setEditingContract(null);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Dirección copiada al portapapeles');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleDelete = async (contractAddress) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este smart contract? Esta acción no eliminará el contrato de la blockchain.')) {
      try {
        await deleteSmartContract(contractAddress);
        alert('Smart contract eliminado exitosamente de la base de datos');
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error('Error deleting smart contract:', error);
        alert('Error al eliminar el smart contract: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  const handleEdit = (contract) => {
    setEditingContract(contract);
  };

  const getDocumentCount = (contract) => {
    if (!contract.documents) return 0;
    return Object.values(contract.documents).filter(doc => doc !== null && doc !== undefined).length;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Smart Contracts
        </h1>
        <button
          onClick={() => setShowTokenForm(true)}
          className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center gap-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          Crear Token
        </button>
      </div>

      {/* Token Creation Modal */}
      {showTokenForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Crear Token ERC-20
              </h2>
              <button
                onClick={() => setShowTokenForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>
            <TokenCreationForm
              onTokenCreated={handleTokenCreated}
              onCancel={() => setShowTokenForm(false)}
            />
          </div>
        </div>
      )}

      {/* Contract Edit Modal */}
      {editingContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4">
            <SmartContractEditForm
              contract={editingContract}
              onSave={handleContractEdited}
              onCancel={() => setEditingContract(null)}
            />
          </div>
        </div>
      )}

      {/* Smart Contracts List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Smart Contracts Desplegados ({contracts.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
          </div>
        ) : contracts.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No hay smart contracts registrados. Crea tu primer token.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Símbolo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Supply
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Blockchain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contract Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Documentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {contracts.map((contract, index) => (
                  <motion.tr
                    key={contract.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-3">
                          <SafeIcon icon={FiCoins} className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{contract.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {contract.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {contract.supply.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {contract.blockchain === 'polygon' ? 'Polygon' : 'Binance Smart Chain'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-400 mr-2">
                          {`${contract.contract_address.substring(0, 6)}...${contract.contract_address.substring(contract.contract_address.length - 4)}`}
                        </span>
                        <button
                          onClick={() => copyToClipboard(contract.contract_address)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <SafeIcon icon={FiCopy} className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <SafeIcon icon={FiFileText} className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {getDocumentCount(contract)} documentos
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
                        {`${contract.owner.substring(0, 6)}...${contract.owner.substring(contract.owner.length - 4)}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(contract)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Editar documentos"
                        >
                          <SafeIcon icon={FiEdit} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(contract.contract_address)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Eliminar"
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSmartContracts;
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getAssets, addAsset, updateAsset, deleteAsset } from '../data/assets';
import { getOperators } from '../data/operators';
import { getAvailableContractsForDropdown, getSmartContractByAddress } from '../services/smartContractService';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiImage } = FiIcons;

const AdminOpportunities = () => {
  const { t, language } = useLanguage();
  const { userRole, account } = useWeb3();
  
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [assets, setAssets] = useState([]);
  const [operators, setOperators] = useState([]);
  const [availableContracts, setAvailableContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    type: 'equipment',
    image: '',
    projectedReturn: '',
    sold: '0',
    tokenPrice: '',
    operatorId: '',
    description: '',
    descriptionEn: '',
    contractAddress: '',
    totalSupply: '1000000',
    tokenSymbol: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assetsData, operatorsData, contractsData] = await Promise.all([
        getAssets(),
        getOperators(),
        getAvailableContractsForDropdown()
      ]);
      setAssets(assetsData);
      setOperators(operatorsData);
      setAvailableContracts(contractsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'contractAddress' && value) {
      // When contract address changes, fetch contract details
      handleContractAddressChange(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContractAddressChange = async (contractAddress) => {
    if (!contractAddress) {
      setFormData(prev => ({
        ...prev,
        contractAddress: '',
        tokenSymbol: '',
        totalSupply: '1000000'
      }));
      return;
    }

    try {
      // Find the contract in the dropdown options first (faster)
      const selectedContract = availableContracts.find(c => c.value === contractAddress);
      
      if (selectedContract) {
        // Get detailed contract info
        const contractData = await getSmartContractByAddress(contractAddress);
        
        setFormData(prev => ({
          ...prev,
          contractAddress,
          tokenSymbol: contractData?.symbol || selectedContract.symbol,
          totalSupply: contractData?.supply?.toString() || prev.totalSupply
        }));
      }
    } catch (error) {
      console.error('Error fetching contract details:', error);
    }
  };

  const calculateAvailableTokens = (totalSupply, sold) => {
    return Math.max(0, totalSupply - sold);
  };

  const calculateAvailablePercentage = (totalSupply, sold) => {
    if (!totalSupply) return 100;
    const soldPercentage = Math.min(100, Math.round((sold / totalSupply) * 100));
    return 100 - soldPercentage;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const selectedOperator = operators.find(op => op.id === parseInt(formData.operatorId));
    const sold = parseInt(formData.sold) || 0;
    const totalSupply = parseInt(formData.totalSupply) || 1000000;

    const assetData = {
      name: formData.name,
      nameEn: formData.nameEn,
      type: formData.type,
      image: formData.image,
      projectedReturn: parseFloat(formData.projectedReturn),
      sold: sold,
      tokenPrice: parseInt(formData.tokenPrice),
      operatorId: parseInt(formData.operatorId),
      operator: selectedOperator?.name || '',
      operatorEn: selectedOperator?.nameEn || '',
      description: formData.description,
      descriptionEn: formData.descriptionEn,
      contractAddress: formData.contractAddress,
      totalSupply: totalSupply,
      tokenSymbol: formData.tokenSymbol
    };

    try {
      setIsSubmitting(true);
      
      if (editingAsset) {
        // For updates, don't modify sold unless explicitly changed
        if (editingAsset.sold === sold) {
          delete assetData.sold;
        }
        
        // Si ya existe un contractAddress, no permitir cambios
        if (editingAsset.contractAddress) {
          delete assetData.contractAddress;
          delete assetData.tokenSymbol;
          delete assetData.totalSupply;
        }
        
        await updateAsset(editingAsset.id, assetData);
        alert('Oportunidad actualizada exitosamente');
      } else {
        await addAsset(assetData);
        alert('Oportunidad agregada exitosamente');
      }
      
      resetForm();
      await loadData(); // Reload data from Supabase
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('Error al guardar la oportunidad: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      type: 'equipment',
      image: '',
      projectedReturn: '',
      sold: '0',
      tokenPrice: '',
      operatorId: '',
      description: '',
      descriptionEn: '',
      contractAddress: '',
      totalSupply: '1000000',
      tokenSymbol: '',
    });
    setShowForm(false);
    setEditingAsset(null);
  };

  const handleEdit = (asset) => {
    console.log('Editing asset:', asset); // Debug log
    setEditingAsset(asset);
    setFormData({
      name: asset.name || '',
      nameEn: asset.nameEn || '',
      type: asset.type || 'equipment',
      image: asset.image || '',
      projectedReturn: asset.projectedReturn?.toString() || '',
      sold: asset.sold?.toString() || '0',
      tokenPrice: asset.tokenPrice?.toString() || '',
      operatorId: asset.operatorId?.toString() || '',
      description: asset.description || '',
      descriptionEn: asset.descriptionEn || '',
      contractAddress: asset.contractAddress || '',
      totalSupply: asset.totalSupply?.toString() || '1000000',
      tokenSymbol: asset.tokenSymbol || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (assetId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta oportunidad?')) {
      try {
        await deleteAsset(assetId);
        alert('Oportunidad eliminada exitosamente');
        await loadData(); // Reload data from Supabase
      } catch (error) {
        console.error('Error deleting asset:', error);
        alert('Error al eliminar la oportunidad: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  const getAssetName = (asset) => {
    return language === 'es' ? asset.name : asset.nameEn;
  };

  const getOperatorName = (operatorId) => {
    const operator = operators.find(op => op.id === operatorId);
    if (!operator) return 'N/A';
    return language === 'es' ? operator.name : operator.nameEn;
  };

  const getTypeDisplayName = (type) => {
    const typeNames = {
      equipment: 'Equipo',
      airbnb: 'Airbnb',
      business: 'Negocio'
    };
    return typeNames[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('admin.opportunities.title')}
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center gap-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          {t('admin.opportunities.add')}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingAsset ? 'Editar Oportunidad' : 'Agregar Nueva Oportunidad'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.nameEn')}
                  </label>
                  <input
                    type="text"
                    name="nameEn"
                    value={formData.nameEn}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.type')}
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    disabled={isSubmitting}
                  >
                    <option value="equipment">Equipo y Maquinaria</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="business">Negocios</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.operator')}
                  </label>
                  <select
                    name="operatorId"
                    value={formData.operatorId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Seleccionar Operador</option>
                    {operators.map(operator => (
                      <option key={operator.id} value={operator.id}>
                        {language === 'es' ? operator.name : operator.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.projectedReturn')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="projectedReturn"
                    value={formData.projectedReturn}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.tokenPrice')}
                  </label>
                  <input
                    type="number"
                    name="tokenPrice"
                    value={formData.tokenPrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contract Address (ERC-20)
                  </label>
                  <select
                    name="contractAddress"
                    value={formData.contractAddress}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    disabled={isSubmitting || !!editingAsset?.contractAddress}
                  >
                    <option value="">Seleccionar Smart Contract</option>
                    {availableContracts.map(contract => (
                      <option key={contract.value} value={contract.value}>
                        {contract.label}
                      </option>
                    ))}
                  </select>
                  {editingAsset?.contractAddress && (
                    <p className="mt-1 text-xs text-gray-500">
                      El smart contract no se puede cambiar una vez asignado
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.image')}
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    required
                    disabled={isSubmitting}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tokens Vendidos
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="sold"
                    value={formData.sold}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-700 rounded-lg"
                    disabled={true}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Los tokens vendidos no se pueden editar manualmente
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Supply Total
                  </label>
                  <input
                    type="number"
                    name="totalSupply"
                    value={formData.totalSupply}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    disabled={formData.contractAddress ? true : isSubmitting}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formData.contractAddress ? 'Valor obtenido del smart contract' : 'Supply total de tokens del activo'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tokens Disponibles
                  </label>
                  <input
                    type="number"
                    value={calculateAvailableTokens(
                      parseInt(formData.totalSupply) || 0,
                      parseInt(formData.sold) || 0
                    )}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
                    disabled={true}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Calculado automáticamente: Supply Total - Tokens Vendidos
                  </p>
                </div>
                {formData.contractAddress && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Token Symbol
                    </label>
                    <input
                      type="text"
                      value={formData.tokenSymbol || ''}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Símbolo obtenido del smart contract
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('form.description')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('form.descriptionEn')}
                </label>
                <textarea
                  name="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                >
                  {t('form.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  {isSubmitting ? 'Guardando...' : t('form.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Opportunities List - Improved Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Oportunidades Actuales ({assets.length})
          </h2>
        </div>
        
        {assets.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No hay oportunidades registradas. Agrega la primera oportunidad.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Activo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Operador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Smart Contract
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {assets.map((asset, index) => {
                  // Calculate available tokens based on totalSupply and sold
                  const totalSupply = asset.totalSupply || 1000000;
                  const sold = asset.sold || 0;
                  const availableTokens = Math.max(0, totalSupply - sold);
                  const availablePercentage = calculateAvailablePercentage(totalSupply, sold);

                  return (
                    <motion.tr
                      key={asset.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              src={asset.image}
                              alt={getAssetName(asset)}
                              className="h-12 w-12 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAzMkMyNi42Mjc0IDMyIDMyIDI2LjYyNzQgMzIgMjBDMzIgMTMuMzcyNiAyNi42Mjc0IDggMjAgOEMxMy4zNzI2IDggOCAxMy4zNzI2IDggMjBDOCAyNi42Mjc0IDEzLjM3MjYgMzIgMjAgMzJaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo=';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white max-w-48 truncate">
                              {getAssetName(asset)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {asset.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          {getTypeDisplayName(asset.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white max-w-32 truncate">
                          {getOperatorName(asset.operatorId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex flex-col">
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {sold?.toLocaleString() || 0} vendidos
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 text-xs">
                              {availableTokens.toLocaleString()} disponibles ({availablePercentage}%)
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {asset.contractAddress ? (
                            <div className="flex flex-col">
                              <span className="text-green-600 dark:text-green-400 font-mono text-xs">
                                {asset.contractAddress.slice(0, 6)}...{asset.contractAddress.slice(-4)}
                              </span>
                              {asset.tokenSymbol && (
                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                  {asset.tokenSymbol}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                              Sin asociar
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(asset)}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                            title="Editar oportunidad"
                          >
                            <SafeIcon icon={FiEdit} className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Eliminar oportunidad"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOpportunities;
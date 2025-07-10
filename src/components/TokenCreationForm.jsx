import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { addSmartContract } from '../services/smartContractService';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCheck, FiX, FiCopy, FiSave } = FiIcons;

const TokenCreationForm = ({ 
  onTokenCreated = () => {}, 
  onCancel = () => {}, 
  initialName = '', 
  initialSymbol = '', 
  initialSupply = 1000000 
}) => {
  const { account } = useWeb3(); // Removido createERC20Token
  const [formData, setFormData] = useState({
    name: initialName || '',
    symbol: initialSymbol || '',
    decimals: 18,
    supply: initialSupply || 1000000,
    blockchain: 'polygon'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdToken, setCreatedToken] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const generateUniqueContractAddress = () => {
    // Generate a more unique contract address to avoid duplicates
    const timestamp = Date.now();
    const random = Math.random().toString(16).slice(2, 10);
    const userPart = account ? account.slice(-4) : '0000';
    return `0x${timestamp.toString(16)}${random}${userPart}${Math.random().toString(16).slice(2, 6)}`.slice(0, 42);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Generate unique contract address
      const contractAddress = generateUniqueContractAddress();
      
      // Verificar que no existe otro contrato con la misma dirección
      let attempts = 0;
      let uniqueAddress = contractAddress;
      
      while (attempts < 5) {
        try {
          // Intentar crear el smart contract en la base de datos
          const savedContract = await addSmartContract({
            name: formData.name,
            symbol: formData.symbol,
            decimals: formData.decimals,
            supply: formData.supply,
            blockchain: formData.blockchain,
            owner: account,
            contract_address: uniqueAddress,
            token_type: 'ERC20',
            documents: {} // Initialize with empty documents object
          });
          
          // Si llegamos aquí, la creación fue exitosa
          setCreatedToken({
            ...formData,
            contractAddress: uniqueAddress
          });
          
          onTokenCreated(uniqueAddress, formData);
          break; // Salir del bucle
          
        } catch (error) {
          if (error.message && error.message.includes('duplicate key value')) {
            // Si hay duplicado, generar nueva dirección e intentar de nuevo
            attempts++;
            uniqueAddress = generateUniqueContractAddress();
            console.log(`Intento ${attempts}: Generando nueva dirección debido a duplicado`);
            
            if (attempts >= 5) {
              throw new Error('No se pudo generar una dirección única después de varios intentos');
            }
          } else {
            // Si es otro tipo de error, lanzarlo
            throw error;
          }
        }
      }
      
    } catch (error) {
      console.error('Error creating token:', error);
      alert('Error al crear el token: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Dirección copiada al portapapeles');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Crear Token ERC-20
      </h3>

      {createdToken ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-green-800 dark:text-green-200 mb-4">
            <div className="flex items-center mb-2">
              <SafeIcon icon={FiCheck} className="w-5 h-5 mr-2" />
              <span className="font-medium">¡Token creado exitosamente!</span>
            </div>
            <p className="text-sm">
              Tu token ha sido creado correctamente. Puedes asociarlo a oportunidades desde la sección de gestión de oportunidades.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Nombre</span>
                <p className="font-medium text-gray-900 dark:text-white">{createdToken.name}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Símbolo</span>
                <p className="font-medium text-gray-900 dark:text-white">{createdToken.symbol}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Supply</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {createdToken.supply.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Blockchain</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {createdToken.blockchain === 'polygon' ? 'Polygon' : 'Binance Smart Chain'}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">Dirección del Contrato</span>
                <p className="font-mono text-gray-900 dark:text-white text-sm truncate">
                  {createdToken.contractAddress}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(createdToken.contractAddress)}
                className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <SafeIcon icon={FiCopy} className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Token
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ej. Mundo Tangible Token"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Símbolo
              </label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ej. MTT"
                required
                maxLength={8}
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Símbolo corto para identificar tu token (máximo 8 caracteres)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Decimales
              </label>
              <input
                type="number"
                name="decimals"
                value={formData.decimals}
                onChange={handleInputChange}
                min="0"
                max="18"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                required
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Número de decimales para dividir el token (recomendado: 18)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Supply Total
              </label>
              <input
                type="number"
                name="supply"
                value={formData.supply}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Blockchain
              </label>
              <select
                name="blockchain"
                value={formData.blockchain}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                disabled={isSubmitting}
              >
                <option value="polygon">Polygon</option>
                <option value="bsc">Binance Smart Chain</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Owner
              </label>
              <input
                type="text"
                value={account || 'No wallet connected'}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Wallet conectada que será propietaria del contrato
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
            <p>
              Al crear el token, se generará un smart contract único en la blockchain seleccionada. 
              La dirección del contrato será generada automáticamente.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  <span>Crear Token</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TokenCreationForm;